import { Router } from 'express';
import { requireAdminJWT } from '../middleware/requireAdminJWT';
import {
  listCandidates,
  approveCandidate,
  rejectCandidate,
  listIndividualTutors,
  listMassTutors,
  suspendTutor,
  unsuspendTutor,
} from '../controllers/tutorModeration.controller';

const r = Router();
r.use(requireAdminJWT);

// Candidates
r.get('/candidates', listCandidates);
r.post('/candidates/:id/approve', approveCandidate);
r.post('/candidates/:id/reject', rejectCandidate);

// Tutors listing
// GET /Admin/tutors/individuals?status=active|suspended&q=...
r.get('/individuals', listIndividualTutors);
// GET /Admin/tutors/mass?status=active|suspended&q=...
r.get('/mass', listMassTutors);

// Suspend / Unsuspend
// POST /Admin/tutors/individual/:id/suspend
// POST /Admin/tutors/individual/:id/unsuspend
// POST /Admin/tutors/mass/:id/suspend
// POST /Admin/tutors/mass/:id/unsuspend
r.post('/:kind(individual|mass)/:id/suspend', suspendTutor);
r.post('/:kind(individual|mass)/:id/unsuspend', unsuspendTutor);

export default r;
