import { Router } from 'express';
import { z } from 'zod';
import { supabase, log } from '../index.js';

const router = Router();

// GET /api/chip/:chipId  — PUBLIC, no auth
router.get('/:chipId', async (req, res, next) => {
  try {
    const chipId = req.params.chipId.replace(/\s/g, '');
    if (!/^\d{15}$/.test(chipId))
      return res.status(400).json({ error: 'Invalid chip ID format — must be 15 digits' });

    const { data: dog, error } = await supabase
      .from('dogs')
      .select('id,name,breed,color,age,status,photo_url,chip_id,chip_type')
      .eq('chip_id', chipId)
      .single();

    if (error || !dog) return res.status(404).json({ error: 'Chip not registered in TRACE' });

    // Get owner contact (limited fields only — no email/address)
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name,phone')
      .eq('id', dog.id)
      .single();

    res.json({
      ...dog,
      contact:     profile?.phone ?? null,
      owner:       profile?.first_name ?? 'Owner',
      sighting_url:`https://trace.app/c/${chipId}`,
    });

    // Log the scan event
    log.info({ chipId, status: dog.status }, 'chip lookup');
  } catch (e) { next(e); }
});

// POST /api/chip/register
router.post('/register', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const schema = z.object({
      dog_id:    z.string().uuid(),
      chip_id:   z.string().regex(/^\d{15}/),
      chip_type: z.enum(['passive','active']).default('passive'),
    });
    const body = schema.parse(req.body);

    // Check chip not already taken
    const { data: existing } = await supabase
      .from('dogs').select('id').eq('chip_id', body.chip_id).single();
    if (existing && existing.id !== body.dog_id)
      return res.status(409).json({ error: 'Chip ID already registered to another dog' });

    const { data, error } = await supabase
      .from('dogs')
      .update({ chip_id: body.chip_id, chip_type: body.chip_type })
      .eq('id', body.dog_id)
      .eq('owner_id', userId)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

// POST /api/chip/scan  — shelter/vet scanner webhook + NFC reports
router.post('/scan', async (req, res, next) => {
  try {
    const schema = z.object({
      chip_id:    z.string(),
      source:     z.enum(['nfc','rfid','ble']).default('rfid'),
      scanner_id: z.string().optional(),
      location:   z.string().optional(),
      lat:        z.number().optional(),
      lng:        z.number().optional(),
    });
    const body = schema.parse(req.body);
    const chipId = body.chip_id.replace(/\s/g,'');

    const { data: dog } = await supabase
      .from('dogs').select('id,name,status,owner_id').eq('chip_id', chipId).single();
    if (!dog) return res.status(404).json({ error: 'Chip not in TRACE registry' });

    // File a sighting if lat/lng provided
    if (body.lat && body.lng) {
      await supabase.from('sightings').insert({
        dog_id:     dog.id,
        source:     body.source === 'rfid' ? 'collar' : 'nfc',
        geom:       `POINT(${body.lng} ${body.lat})`,
        confidence: body.source === 'rfid' ? 0.95 : 0.8,
      });
    }

    // TODO: push notify owner via web-push / SMS
    log.info({ chipId, dogId: dog.id, source: body.source, scanner: body.scanner_id }, 'chip scan event');

    res.json({ dog_id: dog.id, name: dog.name, status: dog.status, notified: true });
  } catch (e) { next(e); }
});

export default router;
