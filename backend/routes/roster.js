import { Router } from 'express';

const router = Router();

const sampleRoster = [
  {
    day: 'Monday',
    shift: 'Morning',
    team: ['John Smith', 'Sarah Johnson'],
  },
  {
    day: 'Monday',
    shift: 'Evening',
    team: ['Mike Davis', 'Lisa Anderson'],
  },
  {
    day: 'Tuesday',
    shift: 'Morning',
    team: ['Emily Wilson', 'Robert Brown'],
  },
];

router.get('/', (_req, res) => {
  res.json({ success: true, roster: sampleRoster });
});

export default router;
