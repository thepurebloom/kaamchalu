const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const { callWebhook } = require('../utils/webhooks');

const router = express.Router();

/**
 * Helper to check if a user is admin
 */
const isAdmin = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  return !error && data && data.role === 'admin';
};

/**
 * 1. POST /api/ratings
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { booking_id, score, review_text } = req.body;
    const userId = req.user.id;

    if (!booking_id || !score || score < 1 || score > 5) {
      return res.status(400).json({ success: false, error: 'Booking ID and a score between 1 and 5 are required' });
    }

    // 1. Validate booking completeness and participation
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('customer_id, worker_id, status')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, error: 'Booking must be completed before rating' });
    }

    if (booking.customer_id !== userId && booking.worker_id !== userId) {
      return res.status(403).json({ success: false, error: 'You are not part of this booking' });
    }

    const rated_user = booking.customer_id === userId ? booking.worker_id : booking.customer_id;

    // 2. Check if user already rated (database also enforces unique constraint)
    const { data: existingRating, error: existingError } = await supabase
      .from('ratings')
      .select('id')
      .eq('booking_id', booking_id)
      .eq('rated_by', userId)
      .maybeSingle();

    if (existingRating) {
      return res.status(400).json({ success: false, error: 'You have already rated this booking' });
    }

    // 3. Create rating
    const { data: newRating, error: insertError } = await supabase
      .from('ratings')
      .insert({
        booking_id,
        score,
        review_text,
        rated_by: userId,
        rated_user,
        is_flagged: false
      })
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ success: false, error: 'Failed to save rating: ' + insertError.message });
    }

    // 4. Update worker_profiles.avg_rating if the rated_user is a worker
    if (rated_user === booking.worker_id) {
      const { data: workerRatings, error: ratingsError } = await supabase
        .from('ratings')
        .select('score')
        .eq('rated_user', rated_user);

      if (!ratingsError && workerRatings && workerRatings.length > 0) {
        const sum = workerRatings.reduce((acc, curr) => acc + curr.score, 0);
        const avg_rating = (sum / workerRatings.length).toFixed(1);

        await supabase
          .from('worker_profiles')
          .update({ avg_rating })
          .eq('id', rated_user);
      }
    }

    // 5. Trigger n8n webhook
    callWebhook('rating_received', { rating: newRating });

    res.status(201).json({ success: true, rating: newRating });
  } catch (err) {
    console.error('[Create Rating Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * 2. GET /api/ratings
 */
router.get('/', async (req, res) => {
  try {
    const { user_id, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('ratings')
      .select(`
        *,
        reviewer:profiles!ratings_rated_by_fkey(full_name)
      `, { count: 'exact' });

    if (user_id) {
      query = query.eq('rated_user', user_id);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: ratings, error, count } = await query;

    if (error) {
      // Fallback query if the specific foreign key label fails
      console.warn('[Get Ratings Warning]: Primary relation fetch failed, trying alternative', error.message);
      let fallbackQuery = supabase
        .from('ratings')
        .select(`*, profiles:rated_by(full_name)`)
        .range(from, to)
        .order('created_at', { ascending: false });
        
      if (user_id) fallbackQuery = fallbackQuery.eq('rated_user', user_id);
      
      const resFallback = await fallbackQuery;
      
      if (resFallback.error) {
         return res.status(500).json({ success: false, error: 'Failed to fetch ratings' });
      }

      return res.status(200).json({
        success: true,
        data: resFallback.data,
        pagination: { page: pageNum, limit: limitNum }
      });
    }

    res.status(200).json({
      success: true,
      data: ratings,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(count / limitNum)
      }
    });

  } catch (err) {
    console.error('[Get Ratings Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * 3. PATCH /api/ratings/:id/flag
 */
router.patch('/:id/flag', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_flagged } = req.body;
    const userId = req.user.id;

    // Check admin
    const adminCheck = await isAdmin(userId);
    if (!adminCheck) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    if (typeof is_flagged !== 'boolean') {
      return res.status(400).json({ success: false, error: 'is_flagged must be a boolean' });
    }

    const { data: updatedRating, error } = await supabase
      .from('ratings')
      .update({ is_flagged })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to flag rating: ' + error.message });
    }

    res.status(200).json({
      success: true,
      rating: updatedRating
    });
  } catch (err) {
    console.error('[Flag Rating Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
