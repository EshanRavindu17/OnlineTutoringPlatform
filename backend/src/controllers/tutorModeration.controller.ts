import { Request, Response } from 'express';
import {
  listCandidatesService,
  approveCandidateService,
  rejectCandidateService,
  listIndividualTutorsService,
  listMassTutorsService,
  suspendTutorService,
  unsuspendTutorService,
} from '../services/tutorModeration.service';

// ---- Candidates ----

export async function listCandidates(req: Request, res: Response) {
  try {
    const status = req.query.status as 'pending' | 'approved' | 'rejected' | undefined;
    const role = req.query.role as 'Individual' | 'Mass' | undefined;
    const data = await listCandidatesService({ status, role });
    res.json({ candidates: data });
  } catch (e: any) {
    res.status(500).json({ message: 'Failed to load candidates', detail: e?.message });
  }
}

export async function approveCandidate(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const out = await approveCandidateService(id);
    res.status(out.created ? 201 : 200).json(out);
  } catch (e: any) {
    res.status(e?.status || 500).json({ message: e?.message || 'Approve failed' });
  }
}

export async function rejectCandidate(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const out = await rejectCandidateService(id);
    res.json(out);
  } catch (e: any) {
    res.status(e?.status || 500).json({ message: e?.message || 'Reject failed' });
  }
}

// ---- Tutors ----

export async function listIndividualTutors(req: Request, res: Response) {
  try {
    const status = req.query.status as 'active' | 'suspended' | undefined;
    const q = (req.query.q as string) || undefined;
    const items = await listIndividualTutorsService({ status, q });
    // normalize shape for UI
    res.json({
      items: items.map((t) => ({
        id: t.i_tutor_id,
        kind: 'individual' as const,
        heading: t.heading,
        email: t.User?.email ?? null,
        name: t.User?.name ?? null,
        status: t.status,
        rating: t.rating,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ message: 'Failed to load individual tutors' });
  }
}

export async function listMassTutors(req: Request, res: Response) {
  try {
    const status = req.query.status as 'active' | 'suspended' | undefined;
    const q = (req.query.q as string) || undefined;
    const items = await listMassTutorsService({ status, q });
    res.json({
      items: items.map((t) => ({
        id: t.m_tutor_id,
        kind: 'mass' as const,
        heading: t.heading,
        email: t.User?.email ?? null,
        name: t.User?.name ?? null,
        status: t.status,
        rating: t.rating,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ message: 'Failed to load mass tutors' });
  }
}

export async function suspendTutor(req: Request, res: Response) {
  try {
    const { kind, id } = req.params;
    const out = await suspendTutorService(kind as any, id);
    res.json(out);
  } catch (e: any) {
    res.status(e?.status || 500).json({ message: e?.message || 'Suspend failed' });
  }
}

export async function unsuspendTutor(req: Request, res: Response) {
  try {
    const { kind, id } = req.params;
    const out = await unsuspendTutorService(kind as any, id);
    res.json(out);
  } catch (e: any) {
    res.status(e?.status || 500).json({ message: e?.message || 'Unsuspend failed' });
  }
}
