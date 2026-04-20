const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const { callWebhook } = require('../utils/webhooks');

const router = express.Router();

/**
 * Middleware to enforce Admin role
 */
const adminMiddleware = [
  authMiddleware,
  async (req, res, next) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();

      if (error || !profile || profile.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      next();
    } catch (err) {
      console.error('[Admin Middleware Error]:', err.message);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
];

// Apply the admin middleware to all routes in this file
router.use(adminMiddleware);

/**
 * 1. GET /api/admin/dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    // 1. Worker Stats
    const getWorkerCount = async (status) => {
      const { count } = await supabase
        .from('worker_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);
      return count || 0;
    };

    const [activeWorkers, pendingWorkers, suspendedWorkers] = await Promise.all([
      getWorkerCount('active'),
      getWorkerCount('pending_verification'),
      getWorkerCount('suspended')
    ]);

    // 2. Customer Stats
    const { count: totalCustomers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    // 3. Booking Stats (using created_at)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const getBookingCountSince = async (date) => {
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date.toISOString());
      return count || 0;
    };

    const [bookingsToday, bookingsThisWeek, bookingsThisMonth] = await Promise.all([
      getBookingCountSince(today),
      getBookingCountSince(startOfWeek),
      getBookingCountSince(startOfMonth)
    ]);

    // 4. Completion Rate
    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });
      
    const { count: completedBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    let completionRate = 0;
    if (totalBookings > 0) {
      completionRate = ((completedBookings / totalBookings) * 100).toFixed(1);
    }

    // 5. Avg Rating (Averaging all worker_profiles.avg_rating that are non-zero)
    const { data: workerRatings } = await supabase
      .from('worker_profiles')
      .select('avg_rating')
      .gt('avg_rating', 0);
      
    let overallAvgRating = 0;
    if (workerRatings && workerRatings.length > 0) {
      const sum = workerRatings.reduce((acc, wp) => acc + Number(wp.avg_rating || 0), 0);
      overallAvgRating = (sum / workerRatings.length).toFixed(1);
    }

    // 6. Open Disputes
    const { count: openDisputesCount } = await supabase
      .from('disputes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    res.status(200).json({
      success: true,
      dashboard: {
        total_workers: {
          active: activeWorkers,
          pending: pendingWorkers,
          suspended: suspendedWorkers
        },
        total_customers: totalCustomers || 0,
        bookings: {
          today: bookingsToday,
          this_week: bookingsThisWeek,
          this_month: bookingsThisMonth
        },
        completion_rate: parseFloat(completionRate),
        avg_rating: parseFloat(overallAvgRating),
        open_disputes: openDisputesCount || 0
      }
    });

  } catch (err) {
    console.error('[Admin Dashboard Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * 2. GET /api/admin/verification-queue
 */
router.get('/verification-queue', async (req, res) => {
  try {
    const { data: queue, error } = await supabase
      .from('worker_profiles')
      .select(`
        *,
        profile:profiles(full_name, phone, email, avatar_url, area, pin_code)
      `)
      .eq('status', 'pending_verification')
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to fetch verification queue: ' + error.message });
    }

    res.status(200).json({
      success: true,
      data: queue
    });
  } catch (err) {
    console.error('[Verification Queue Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * 3. GET /api/admin/users
 */
router.get('/users', async (req, res) => {
  try {
    const { role, search, status, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('profiles')
      .select(`
        *,
        worker_profile:worker_profiles(status, skills, avg_rating, total_jobs)
      `, { count: 'exact' });

    if (role) {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    
    // Note: status is on worker_profiles, so we filter after or use embedded resource filtering.
    // However, filtering on a joined table natively from the top level in Supabase JS requires inner joins.
    if (status) {
      query = supabase
        .from('profiles')
        .select(`
          *,
          worker_profile:worker_profiles!inner(status, skills, avg_rating, total_jobs)
        `, { count: 'exact' })
        .eq('worker_profile.status', status);
      
      if (role) query = query.eq('role', role);
      if (search) query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: users, error, count } = await query;

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to fetch users: ' + error.message });
    }

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(count / limitNum)
      }
    });

  } catch (err) {
    console.error('[Admin Get Users Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * 4. GET /api/admin/disputes
 */
router.get('/disputes', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('disputes')
      .select(`
        *,
        booking:bookings(status, scheduled_date, job_id, customer_id, worker_id),
        raised_by_user:profiles!disputes_raised_by_fkey(full_name, phone)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: disputes, error, count } = await query;

    if (error) {
       // fallback query without explicit foreign key label if it fails
       console.warn('[Admin Disputes Warning] Primary query failed, trying fallback', error.message);
       let fallbackQuery = supabase
         .from('disputes')
         .select(`*, booking:bookings(*), raised_by_user:profiles(*)`)
         .range(from, to)
         .order('created_at', { ascending: false });
       if (status) fallbackQuery = fallbackQuery.eq('status', status);

       const resFallback = await fallbackQuery;
       if (resFallback.error) {
           return res.status(500).json({ success: false, error: 'Failed to fetch disputes' });
       }

       return res.status(200).json({
         success: true,
         data: resFallback.data,
         pagination: { page: pageNum, limit: limitNum }
       });
    }

    res.status(200).json({
      success: true,
      data: disputes,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(count / limitNum)
      }
    });
  } catch (err) {
    console.error('[Admin Disputes Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * 5. PATCH /api/admin/disputes/:id
 */
router.patch('/disputes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution, admin_notes } = req.body;
    const adminId = req.user.id;

    const updates = {};
    if (status) updates.status = status;
    if (resolution) updates.resolution = resolution;
    if (admin_notes) updates.admin_notes = admin_notes;

    if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = adminId;
    }

    const { data: dispute, error } = await supabase
      .from('disputes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !dispute) {
      return res.status(500).json({ success: false, error: 'Failed to update dispute: ' + (error?.message || 'Not found') });
    }

    // Call N8N Webhook if status changed to resolved or similar
    // The prompt just says "If resolving... Trigger: call n8n webhook"
    if (status === 'resolved' || status === 'investigating') {
      callWebhook('dispute_updated', { dispute });
    }

    res.status(200).json({
      success: true,
      dispute
    });

  } catch (err) {
    console.error('[Update Dispute Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
