import { Router } from 'express';
import { z } from 'zod';
import { supabase, log } from '../index.js';

const router = Router();

const SightingSchema = z.object({
  dog_id:        z.string().uuid(),
  source:        z.enum(['relay','human','collar','nfc']).default('human'),
  lat:           z.number().min(-90).max(90),
  lng:           z.number().min(-180).max(180),
  confidence:    z.number().min(0).max(1).default(0.5),
  rssi:          z.number().optional().nullable(),
  photo_url:     z.string().url().optional().nullable(),
  description:   z.string().max(500).optional(),
  location_text: z.string().max(200).optional(),
});

// POST /api/sightings  (public — no auth required for anonymous reporters)
router.post('/', async (req, res, next) => {
  try {
    const body = SightingSchema.parse(req.body);
    // Quantize location to 50m grid
    const grid = (v: number, m: number) => Math.round(v / (m/111320)) * (m/111320);
    const lat  = grid(body.lat, 50);
    const lng  = grid(body.lng, 50);

    const { data, error } = await supabase
      .from('sightings')
      .insert({
        dog_id:        body.dog_id,
        reporter_id:   (req as any).user?.id ?? null,
        source:        body.source,
        geom:          `POINT(${lng} ${lat})`,
        confidence:    body.confidence,
        rssi:          body.rssi ?? null,
        photo_url:     body.photo_url ?? null,
      })
      .select()
      .single();
    if (error) throw error;

    log.info({ dogId: body.dog_id, source: body.source, lat, lng }, 'sighting recorded');
    res.status(201).json(data);
  } catch (e) { next(e); }
});

// GET /api/sightings/:dogId
router.get('/:dogId', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('sightings')
      .select('id,source,confidence,rssi,created_at')
      .eq('dog_id', req.params.dogId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

export default router;
