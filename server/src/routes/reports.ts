import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../index.js';

const router = Router();

const LostSchema = z.object({
  dog_id:       z.string().uuid(),
  last_seen_loc: z.string().max(200),
  last_seen_lat: z.number().optional(),
  last_seen_lng: z.number().optional(),
  radius_m:     z.number().default(3000),
  reward_cents: z.number().int().min(0).default(0),
});

// POST /api/reports/lost
router.post('/lost', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const body   = LostSchema.parse(req.body);

    // Verify dog ownership
    const { data: dog } = await supabase
      .from('dogs').select('id,owner_id').eq('id', body.dog_id).single();
    if (!dog || dog.owner_id !== userId)
      return res.status(403).json({ error: 'Forbidden' });

    // Mark dog as lost
    await supabase.from('dogs').update({ status: 'lost' }).eq('id', body.dog_id);

    // Create lost report
    const point = body.last_seen_lat && body.last_seen_lng
      ? `POINT(${body.last_seen_lng} ${body.last_seen_lat})`
      : null;

    const { data, error } = await supabase
      .from('lost_reports')
      .insert({
        dog_id:       body.dog_id,
        last_seen:    point,
        radius_m:     body.radius_m,
        reward_cents: body.reward_cents,
        active:       true,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { next(e); }
});

// POST /api/reports/lost/:id/close
router.post('/lost/:id/close', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    // Verify via dog ownership
    const { data: report } = await supabase
      .from('lost_reports').select('id,dog_id').eq('dog_id', req.params.id).eq('active', true).single();
    if (!report) return res.status(404).json({ error: 'No active report' });

    await supabase.from('lost_reports').update({ active: false }).eq('id', report.id);
    await supabase.from('dogs').update({ status: 'safe' }).eq('id', report.dog_id);
    res.json({ closed: true });
  } catch (e) { next(e); }
});

// GET /api/reports/lost/active/:dogId
router.get('/lost/active/:dogId', async (req, res, next) => {
  try {
    const { data } = await supabase
      .from('lost_reports')
      .select('*')
      .eq('dog_id', req.params.dogId)
      .eq('active', true)
      .single();
    res.json(data ?? null);
  } catch (e) { next(e); }
});

export default router;
