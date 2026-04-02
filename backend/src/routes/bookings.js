// src/routes/bookings.js
const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const { callWebhook } = require('../utils/webhooks');

const router = express.Router();

const getUserProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return data || { role: 'user' };
};

/**
 * GET /api/bookings
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const profile = await getUserProfile(req.user.id);
        
        let query = supabase.from('bookings').select('*, job:jobs(*), customer:profiles!customer_id(full_name, phone), worker:profiles!worker_id(full_name, phone)', { count: 'exact' });

        if (profile.role === 'customer') {
            query = query.eq('customer_id', req.user.id);
        } else if (profile.role === 'worker') {
            query = query.eq('worker_id', req.user.id);
        }

        if (status) query = query.eq('status', status);

        const start = (page - 1) * limit;
        const end = start + limit - 1;
        
        query = query.range(start, end).order('created_at', { ascending: false });

        const { data: bookings, error, count } = await query;
        if (error) return res.status(400).json({ success: false, error: error.message });

        // Filter out phone numbers unless the booking is active/confirmed
        const filteredBookings = bookings.map(b => {
             const canSeePhone = ['confirmed', 'in_progress', 'completed'].includes(b.status);
             if (!canSeePhone) {
                 if (b.customer) b.customer.phone = undefined;
                 if (b.worker) b.worker.phone = undefined;
             }
             return b;
        });

        res.status(200).json({ 
            success: true, 
            bookings: filteredBookings, 
            metadata: { total: count, page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (err) {
        console.error('[GET /bookings Error]:', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * GET /api/bookings/:id
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const profile = await getUserProfile(req.user.id);

        const { data: booking, error } = await supabase
            .from('bookings')
            .select('*, job:jobs(*), customer:profiles!customer_id(full_name, phone, avatar_url), worker:profiles!worker_id(full_name, phone, avatar_url)')
            .eq('id', bookingId)
            .single();

        if (error || !booking) return res.status(404).json({ success: false, error: 'Booking not found' });

        // Auth check - Must be involved or Admin
        if (profile.role !== 'admin' && booking.customer_id !== req.user.id && booking.worker_id !== req.user.id) {
             return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const { data: ratings } = await supabase.from('ratings').select('*').eq('booking_id', bookingId);

        res.status(200).json({ success: true, booking, ratings: ratings || [] });
    } catch (err) {
        console.error('[GET /bookings/:id Error]:', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * PATCH /api/bookings/:id
 */
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { action, reason } = req.body;
        const profile = await getUserProfile(req.user.id);

        const { data: booking, error: bError } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
        if (bError || !booking) return res.status(404).json({ success: false, error: 'Booking not found' });

        if (booking.customer_id !== req.user.id && booking.worker_id !== req.user.id && profile.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        let updates = {};
        let jobUpdates = {};

        switch (action) {
            case 'start':
                if (profile.role !== 'worker' && profile.role !== 'admin') return res.status(403).json({ success: false, error: 'Only worker can start' });
                updates.status = 'in_progress';
                updates.actual_start = new Date().toISOString();
                jobUpdates.status = 'in_progress';
                break;

            case 'complete':
                if (profile.role !== 'worker' && profile.role !== 'admin') return res.status(403).json({ success: false, error: 'Only worker can complete' });
                updates.status = 'completed';
                updates.actual_end = new Date().toISOString();
                jobUpdates.status = 'completed';
                break;

            case 'cancel':
                const cancelledStatus = profile.role === 'customer' ? 'cancelled_by_customer' : 'cancelled_by_worker';
                updates.status = cancelledStatus;
                jobUpdates.status = cancelledStatus;
                break;

            case 'dispute':
                updates.status = 'disputed';
                jobUpdates.status = 'disputed';
                
                // Create a dispute row per schema
                await supabase.from('disputes').insert({
                    booking_id: bookingId,
                    raised_by: req.user.id,
                    reason: reason || 'None provided'
                });
                break;

            default:
                return res.status(400).json({ success: false, error: 'Invalid action specified' });
        }

        // Apply updates
        const { data: updatedBooking, error: uError } = await supabase.from('bookings').update(updates).eq('id', bookingId).select().single();
        if (uError) return res.status(400).json({ success: false, error: uError.message });

        if (Object.keys(jobUpdates).length > 0) {
            await supabase.from('jobs').update(jobUpdates).eq('id', booking.job_id);
        }

        // Trigger Event logic for webhooks
        callWebhook(`booking_${action}`, { booking_id: bookingId, action, user_id: req.user.id, reason });

        res.status(200).json({ success: true, booking: updatedBooking });

    } catch (err) {
        console.error('[PATCH /bookings/:id Error]:', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
