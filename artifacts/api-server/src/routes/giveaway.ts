import { Router } from 'express';
const router = Router();
// Cloudflare owns the dedicated entry ledger; staff use Mailchimp. Preview never
// fabricates entries, administrator authentication, or successful email delivery.
router.get('/giveaway', (_req, res) => {
  res.set('Cache-Control', 'no-store').json({
    campaign: {
      id: 'hyperbaric-giveaway', status: 'draft',
      startsAt: '2026-11-20T14:00:00.000Z', endsAt: '2026-11-20T23:00:00.000Z',
      prizeValue: 2000, rulesApproved: false, rulesVersion: '1',
    },
    acceptingEntries: false, message: 'This giveaway is being prepared. Entries are not open yet.',
  });
});
router.post('/giveaway', (_req, res) => {
  res.set('Cache-Control', 'no-store').status(503).json({ error: 'This preview does not capture giveaway entries or send emails.' });
});
router.all('/giveaway-admin', (_req, res) => {
  res.set('Cache-Control', 'no-store').status(404).json({ error: 'Giveaway administration is managed in Mailchimp. Custom administration is not enabled.' });
});
export default router;
