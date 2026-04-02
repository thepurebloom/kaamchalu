const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All notifications routes require auth
router.use(authMiddleware);

/**
 * 1. GET /api/notifications
 */
router.get('/', async (req, res) => {
  try {
    const { is_read, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (is_read === 'true') {
      query = query.eq('is_read', true);
    } else if (is_read === 'false') {
      query = query.eq('is_read', false);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    // Fetch unread count simultaneously
    const [notificationsResult, unreadCountResult] = await Promise.all([
      query,
      supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
    ]);

    if (notificationsResult.error) {
      return res.status(500).json({ success: false, error: 'Failed to fetch notifications: ' + notificationsResult.error.message });
    }

    res.status(200).json({
      success: true,
      data: notificationsResult.data,
      unread_count: unreadCountResult.count || 0,
      pagination: {
        total: notificationsResult.count,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(notificationsResult.count / limitNum)
      }
    });

  } catch (err) {
    console.error('[Get Notifications Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * 2. PATCH /api/notifications/:id/read
 */
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check ownership
    const { data: notification, error: getError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', id)
      .single();

    if (getError || !notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    if (notification.user_id !== userId) {
      return res.status(403).json({ success: false, error: 'You do not have permission to read this notification' });
    }

    const { data: updatedNotification, error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ success: false, error: 'Failed to update notification: ' + updateError.message });
    }

    res.status(200).json({
      success: true,
      notification: updatedNotification
    });

  } catch (err) {
    console.error('[Update Notification Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * 3. POST /api/notifications/read-all
 */
router.post('/read-all', async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to mark notifications as read: ' + error.message });
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (err) {
    console.error('[Read All Notifications Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
