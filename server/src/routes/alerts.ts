import { Router } from 'express';
import { z } from 'zod';
import { supabase, log } from '../index.js';
import twilio from 'twilio';

const router = Router();

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const BroadcastSchema = z.object({
  dog_id:    z.string().uuid().optional(),
  channels:  z.object({
    sms:   z.boolean().default(true),
    push:  z.boolean().default(true),
    kiosk: z.boolean().default(false),
  }).default({}),
  radius_mi: z.number().min(0.5).max(10).default(1),
  message:   z.string().max(360).optional(),
});

router.post('/broadcast', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const body   = BroadcastSchema.parse(req.body);

    // Fetch dog details
    const dogQuery = body.dog_id
      ? supabase.from('dogs').select('*').eq('id', body.dog_id).eq('owner_id', userId).single()
      : supabase.from('dogs').select('*').eq('owner_id', userId).eq('status','lost').limit(1).single();

    const { data: dog } = await dogQuery;
    if (!dog) return res.status(404).json({ error: 'Dog not found' });

    const smsText = body.message ??
      `🐕 MISSING DOG near you. ${dog.name} – ${dog.color} ${dog.breed}. ` +
      `If seen call (201)555-0192 or trace.app/r/${dog.id.slice(0,8)} Reply STOP to opt out.`;

    const results: Record<string, any> = {};

    // SMS via Twilio
    if (body.channels.sms && twilioClient) {
      try {
        const subscribers = await getOptedInSubscribers(dog.id, body.radius_mi);
        let sent = 0;
        for (const sub of subscribers) {
          await twilioClient.messages.create({
            to:   sub.phone,
            from: process.env.TWILIO_FROM_NUMBER!,
            body: smsText,
          });
          sent++;
          // Rate limit: 1 req/s
          await new Promise(r => setTimeout(r, 1000));
        }
        results.sms = { sent };
      } catch (e: any) {
        results.sms = { error: e.message };
        log.error({ err: e.message }, 'SMS broadcast failed');
      }
    } else {
      results.sms = { skipped: true, reason: body.channels.sms ? 'Twilio not configured' : 'disabled' };
    }

    // Web Push (TODO: implement VAPID dispatch)
    results.push = body.channels.push ? { queued: true } : { skipped: true };

    log.info({ dogId: dog.id, channels: body.channels, radius: body.radius_mi }, 'broadcast fired');
    res.json({ success: true, dog: dog.name, results });
  } catch (e) { next(e); }
});

async function getOptedInSubscribers(_dogId: string, _radiusMi: number) {
  // TODO: PostGIS query — get users within radius who opted in to SMS
  // SELECT p.phone FROM profiles p
  // JOIN user_locations ul ON ul.user_id = p.id
  // WHERE p.sms_opted_in = true
  // AND ST_DWithin(ul.last_location, (SELECT last_seen FROM lost_reports WHERE dog_id=$1 LIMIT 1), $2 * 1609.34)
  return [] as { phone: string }[];
}

export default router;
