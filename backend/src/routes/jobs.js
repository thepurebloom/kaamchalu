// src/routes/jobs.js
const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const { callWebhook } = require('../utils/webhooks');

const router = express.Router();

/**
 * Helper to get the actual user profile to determine their role context
 */
const getUserProfile = async (userId) => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return profile || { role: 'user' };
};

/**
 * POST /api/jobs
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const profile = await getUserProfile(req.user.id);
        if (profile.role !== 'customer') {
            return res.status(403).json({ success: false, error: 'Only customers can post jobs' });
        }

        const { category, description, location, pin_code, preferred_date, preferred_time, budget, photo_urls } = req.body;

        const { data: job, error } = await supabase
            .from('jobs')
            .insert({
                customer_id: req.user.id,
                category,
                description,
                location,
                pin_code,
                preferred_date,
                preferred_time,
                budget,
                photo_urls,
                status: 'posted'
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }

        // Trigger n8n webhook
        callWebhook('job_posted', {
            job_id: job.id,
            customer_id: req.user.id,
            category: job.category
        });

        res.status(201).json({ success: true, job });
    } catch (err) {
        console.error('[POST /jobs Error]:', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * GET /api/jobs
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const profile = await getUserProfile(req.user.id);
        
        let query;

        if (profile.role === 'worker') {
            // Workers get jobs they applied to. We inner join with job_applications
            query = supabase
                .from('jobs')
                .select('*, job_applications!inner(*), customer:profiles!customer_id(full_name)', { count: 'exact' })
                .eq('job_applications.worker_id', req.user.id);
        } else {
            // Admin and Customers
            query = supabase
                .from('jobs')
                .select('*, customer:profiles!customer_id(full_name)', { count: 'exact' });

            if (profile.role === 'customer') {
                query = query.eq('customer_id', req.user.id);
            }
        }

        if (status) {
            query = query.eq('status', status);
        }

        const start = (page - 1) * limit;
        const end = start + limit - 1;
        query = query.range(start, end).order('created_at', { ascending: false });

        const { data: jobs, error, count } = await query;

        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }

        res.status(200).json({
            success: true,
            jobs,
            metadata: { total: count, page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (err) {
        console.error('[GET /jobs Error]:', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * GET /api/jobs/:id
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const jobId = req.params.id;
        const profile = await getUserProfile(req.user.id);

        const { data: job, error } = await supabase
            .from('jobs')
            .select('*, customer:profiles!customer_id(full_name, phone)')
            .eq('id', jobId)
            .single();

        if (error || !job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        // Auth Logic strictly per PRD requirement 
        let isAuthorized = false;
        if (profile.role === 'admin') isAuthorized = true;
        else if (profile.role === 'customer' && job.customer_id === req.user.id) isAuthorized = true;
        else if (profile.role === 'worker') {
            if (job.matched_worker_id === req.user.id) {
                isAuthorized = true;
            } else {
                // Determine if they applied
                const { data: app } = await supabase.from('job_applications').select('id').eq('job_id', jobId).eq('worker_id', req.user.id).maybeSingle();
                if (app) isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: 'Not authorized to view this job' });
        }

        let applications = null;
        if (profile.role === 'admin' || (profile.role === 'customer' && job.customer_id === req.user.id)) {
            const { data } = await supabase.from('job_applications').select('*, worker:profiles!worker_id(full_name)').eq('job_id', jobId);
            applications = data;
        }

        let booking = null;
        if (['confirmed', 'in_progress', 'completed'].includes(job.status)) {
            const { data } = await supabase.from('bookings').select('*').eq('job_id', jobId).maybeSingle();
            booking = data;
        }

        res.status(200).json({ success: true, job, applications, booking });
    } catch (err) {
        console.error('[GET /jobs/:id Error]:', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * PATCH /api/jobs/:id
 */
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const jobId = req.params.id;
        const profile = await getUserProfile(req.user.id);
        
        const { data: job, error: jobError } = await supabase.from('jobs').select('*').eq('id', jobId).single();
        if (jobError) return res.status(404).json({ success: false, error: 'Job not found' });

        let updates = { ...req.body };

        if (profile.role === 'customer') {
            if (job.customer_id !== req.user.id) return res.status(403).json({ success: false, error: 'Not your job' });
            
            // Only description and specific status cancellations
            let allowedUpdates = {};
            if (updates.description) allowedUpdates.description = updates.description;
            if (updates.status === 'cancelled_by_customer') {
                if (['posted', 'matching'].includes(job.status)) {
                    allowedUpdates.status = 'cancelled_by_customer';
                } else {
                    return res.status(400).json({ success: false, error: 'Cannot cancel job at this stage' });
                }
            }
            updates = allowedUpdates;
        } else if (profile.role === 'admin') {
            // Admin overrides
        } else {
            return res.status(403).json({ success: false, error: 'Role not authorized to update job' });
        }

        if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, error: 'No valid updates given' });

        const { data: updatedJob, error } = await supabase.from('jobs').update(updates).eq('id', jobId).select().single();
        if (error) return res.status(400).json({ success: false, error: error.message });

        res.status(200).json({ success: true, job: updatedJob });
    } catch (err) {
        console.error('[PATCH /jobs/:id Error]:', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * POST /api/jobs/:id/apply
 */
router.post('/:id/apply', authMiddleware, async (req, res) => {
    try {
        const jobId = req.params.id;
        const profile = await getUserProfile(req.user.id);

        if (profile.role !== 'worker') {
            return res.status(403).json({ success: false, error: 'Only workers can apply' });
        }

        const { data: job, error: jobError } = await supabase.from('jobs').select('status, customer_id').eq('id', jobId).single();
        if (jobError || !job) return res.status(404).json({ success: false, error: 'Job not found' });

        const { data: app, error } = await supabase
            .from('job_applications')
            .upsert({
                job_id: jobId,
                worker_id: req.user.id,
                status: 'accepted',
                responded_at: new Date().toISOString()
            }, { onConflict: 'job_id,worker_id' })
            .select()
            .single();

        if (error) return res.status(400).json({ success: false, error: error.message });

        callWebhook("worker_accepted", {
            job_id: jobId,
            worker_id: req.user.id
        });

        res.status(201).json({ success: true, application: app });
    } catch (err) {
        console.error('[POST /jobs/:id/apply Error]:', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * POST /api/jobs/:id/confirm
 */
router.post('/:id/confirm', authMiddleware, async (req, res) => {
    try {
        const jobId = req.params.id;
        const { worker_id } = req.body;
        const profile = await getUserProfile(req.user.id);

        if (profile.role !== 'customer') {
            return res.status(403).json({ success: false, error: 'Only customers can confirm applications' });
        }

        if (!worker_id) return res.status(400).json({ success: false, error: 'worker_id is required' });

        const { data: job, error: jobError } = await supabase.from('jobs').select('*').eq('id', jobId).single();
        if (jobError || !job) return res.status(404).json({ success: false, error: 'Job not found' });
        if (job.customer_id !== req.user.id) return res.status(403).json({ success: false, error: 'Not your job' });

        const { error: jobUpdateError } = await supabase
            .from('jobs')
            .update({ status: 'confirmed', matched_worker_id: worker_id })
            .eq('id', jobId);
            
        if (jobUpdateError) return res.status(400).json({ success: false, error: jobUpdateError.message });

        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                job_id: jobId,
                customer_id: req.user.id,
                worker_id,
                scheduled_date: job.preferred_date,
                scheduled_time: job.preferred_time,
                status: 'confirmed'
            })
            .select()
            .single();

        if (bookingError) return res.status(400).json({ success: false, error: bookingError.message });

        callWebhook("booking_confirmed", {
            booking_id: booking.id,
            customer_id: req.user.id,
            worker_id: worker_id
        });

        res.status(201).json({ success: true, booking });
    } catch (err) {
        console.error('[POST /jobs/:id/confirm Error]:', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
