import { Router } from 'express';
import { supabase } from '../index.js';

const router = Router();

// GET /api/poster/:dogId
router.get('/:dogId', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { data: dog } = await supabase
      .from('dogs').select('*').eq('id', req.params.dogId).eq('owner_id', userId).single();
    if (!dog) return res.status(404).json({ error: 'Dog not found' });

    const { data: report } = await supabase
      .from('lost_reports').select('*').eq('dog_id', dog.id).eq('active', true).single();

    const { data: profile } = await supabase
      .from('profiles').select('phone,first_name').eq('id', userId).single();

    res.json({
      dog,
      report,
      contact:     profile?.phone ?? '',
      sighting_url:`https://trace.app/r/${dog.id.slice(0,8)}`,
    });
  } catch (e) { next(e); }
});

export default router;
