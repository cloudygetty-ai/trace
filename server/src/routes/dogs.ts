import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../index.js';

const router = Router();

const DogSchema = z.object({
  name:      z.string().min(1).max(60),
  breed:     z.string().max(80).optional(),
  age:       z.string().max(20).optional(),
  color:     z.string().max(120).optional(),
  chip_id:   z.string().regex(/^\d{15}$/).optional().nullable(),
  chip_type: z.enum(['passive','active']).optional().nullable(),
  photo_url: z.string().url().optional().nullable(),
});

// GET /api/dogs
router.get('/', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { data, error } = await supabase
      .from('dogs')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

// GET /api/dogs/:id
router.get('/:id', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { data, error } = await supabase
      .from('dogs')
      .select('*')
      .eq('id', req.params.id)
      .eq('owner_id', userId)
      .single();
    if (error) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (e) { next(e); }
});

// POST /api/dogs
router.post('/', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const body = DogSchema.parse(req.body);
    const { data, error } = await supabase
      .from('dogs')
      .insert({ ...body, owner_id: userId, status: 'safe' })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { next(e); }
});

// PATCH /api/dogs/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const body = DogSchema.partial().parse(req.body);
    const { data, error } = await supabase
      .from('dogs')
      .update(body)
      .eq('id', req.params.id)
      .eq('owner_id', userId)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

// DELETE /api/dogs/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { error } = await supabase
      .from('dogs')
      .delete()
      .eq('id', req.params.id)
      .eq('owner_id', userId);
    if (error) throw error;
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
