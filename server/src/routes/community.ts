import { Router } from 'express';
import { supabase } from '../index.js';

const router = Router();

// GET /api/community/nearby?lat=&lng=&radius=
router.get('/nearby', async (req, res, next) => {
  try {
    const lat    = parseFloat(req.query.lat as string);
    const lng    = parseFloat(req.query.lng as string);
    const radius = parseInt(req.query.radius as string ?? '5000', 10);

    if (isNaN(lat) || isNaN(lng)) return res.status(400).json({ error: 'lat and lng required' });

    const { data, error } = await supabase.rpc('nearby_lost_dogs', { lat, lng, radius_m: radius });
    if (error) throw error;
    res.json(data ?? []);
  } catch (e) { next(e); }
});

export default router;
