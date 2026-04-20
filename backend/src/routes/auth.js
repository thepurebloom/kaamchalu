// src/routes/auth.js
const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * 1. POST /api/auth/signup
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: data.user
    });
  } catch (err) {
    console.error('[Signup Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * 2. POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ success: false, error: error.message });
    }

    res.status(200).json({
      success: true,
      session: {
        access_token: data.session.access_token,
        user: data.user
      }
    });
  } catch (err) {
    console.error('[Login Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * 3. POST /api/auth/signup-worker
 */
router.post('/signup-worker', authMiddleware, async (req, res) => {
  try {
    const {
      full_name, skills, experience, hourly_rate, 
      service_areas, availability, languages, about, aadhaar_number
    } = req.body;
    
    const userId = req.user.id;

    // Use upsert to handle case where DB trigger might have auto-created profile on signup
    const { data: profileArgs, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        role: 'worker',
        full_name,
        email: req.user.email,
        phone: req.user.phone || 'N/A' // Mocking phone if schema strictly requires it
      })
      .select()
      .single();

    if (profileError) {
      return res.status(400).json({ success: false, error: 'Error creating profile: ' + profileError.message });
    }

    // Insert into worker_profiles
    const { error: workerProfileError } = await supabase
      .from('worker_profiles')
      .upsert({
        id: userId,
        skills,
        experience,
        hourly_rate,
        service_areas,
        availability,
        languages,
        about,
        aadhaar_number,
        status: 'pending_verification'
      });

    if (workerProfileError) {
      return res.status(400).json({ success: false, error: 'Error creating worker profile: ' + workerProfileError.message });
    }

    res.status(201).json({
      success: true,
      profile: profileArgs
    });
  } catch (err) {
    console.error('[Signup Worker Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * 4. POST /api/auth/signup-customer
 */
router.post('/signup-customer', authMiddleware, async (req, res) => {
  try {
    const { full_name, area, pin_code, email } = req.body;
    const userId = req.user.id;

    const { data: profileArgs, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        role: 'customer',
        full_name,
        area,
        pin_code,
        email: email || req.user.email,
        phone: req.user.phone || 'N/A'
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: 'Error creating customer profile: ' + error.message });
    }

    res.status(201).json({
      success: true,
      profile: profileArgs
    });

  } catch (err) {
    console.error('[Signup Customer Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * 5. GET /api/auth/me
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      return res.status(400).json({ success: false, error: 'Error fetching profile: ' + profileError.message });
    }

    let workerData = null;
    if (profile && profile.role === 'worker') {
      const { data: workerProfile, error: workerErr } = await supabase
        .from('worker_profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (!workerErr) {
        workerData = workerProfile;
      }
    }

    res.status(200).json({
        success: true,
        user: req.user,
        profile: profile || null,
        worker_profile: workerData
    });
  } catch (err) {
    console.error('[Get Me Error]:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
