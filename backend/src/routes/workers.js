// src/routes/workers.js
const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const { callWebhook } = require('../utils/webhooks');

const router = express.Router();

/**
 * GET /api/workers
 */
router.get('/', async (req, res) => {
  try {
    const { category, area, min_rating, max_rate, sort_by, page = 1, limit = 20 } = req.query;
    
    // Pagination logic
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = supabase
      .from('worker_profiles')
      .select('*, profiles!inner(full_name, avatar_url)', { count: 'exact' })
      .eq('status', 'active');

    // Filtering
    if (category) {
      query = query.contains('skills', [category]); 
    }
    if (area) {
      query = query.contains('service_areas', [area]);
    }
    if (min_rating) {
      query = query.gte('avg_rating', min_rating);
    }
    if (max_rate) {
      query = query.lte('hourly_rate', max_rate);
    }

    // Sorting
    if (sort_by === 'rating') {
      query = query.order('avg_rating', { ascending: false });
    } else if (sort_by === 'rate') {
      query = query.order('hourly_rate', { ascending: true });
    } else if (sort_by === 'experience') {
      query = query.order('experience', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({
      success: true,
      data,
      metadata: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (err) {
    console.error('[GET Workers Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/workers/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const workerId = req.params.id;
    
    // Fetch profile
    const { data: worker, error } = await supabase
      .from('worker_profiles')
      .select('*, profiles!inner(*)')
      .eq('id', workerId)
      .single();

    if (error) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }

    // Check authorization for inactive profiles
    if (worker.status !== 'active') {
        const authHeader = req.headers.authorization;
        let isAuthorized = false;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const { data: { user } } = await supabase.auth.getUser(token);
            if (user) {
                if (user.id === workerId) {
                  isAuthorized = true;
                } else {
                  const { data: userProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                  if (userProfile && userProfile.role === 'admin') isAuthorized = true;
                }
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: 'Not authorized to view inactive worker profile' });
        }
    }

    // Fetch ratings/reviews
    const { data: ratings, error: ratingsError } = await supabase
      .from('ratings')
      .select('*, rater:profiles!rated_by(full_name)')
      .eq('rated_user', workerId);

    if (ratingsError) {
      console.warn("[GET Worker Ratings Error]:", ratingsError.message);
    }

    res.status(200).json({
      success: true,
      worker,
      ratings: ratings || []
    });

  } catch (err) {
    console.error('[GET Worker By ID Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * PATCH /api/workers/:id
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const workerId = req.params.id;
    
    // Auth check
    if (req.user.id !== workerId) {
      return res.status(403).json({ success: false, error: 'You can only update your own profile' });
    }

    // Exclude system fields
    const updates = { ...req.body };
    delete updates.status;
    delete updates.avg_rating;
    delete updates.total_jobs;
    delete updates.id;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields provided for update' });
    }

    const { data, error } = await supabase
      .from('worker_profiles')
      .update(updates)
      .eq('id', workerId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({
      success: true,
      worker: data
    });

  } catch (err) {
    console.error('[PATCH Worker Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * PATCH /api/workers/:id/status
 */
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const workerId = req.params.id;
    const { status, reason } = req.body;

    // Check Admin rights
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();
        
    if (!adminProfile || adminProfile.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Only admins can update worker status' });
    }

    if (!['active', 'suspended', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    let updates = { status };
    if (status === 'active') {
        updates.verified_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('worker_profiles')
      .update(updates)
      .eq('id', workerId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // Trigger n8n webhook
    callWebhook(
        status === 'active' ? 'worker_approved' : 'worker_status_updated', 
        { worker_id: workerId, new_status: status, reason }
    );

    res.status(200).json({
      success: true,
      worker: data
    });

  } catch (err) {
    console.error('[Update Worker Status Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
