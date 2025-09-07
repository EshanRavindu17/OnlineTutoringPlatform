import prisma from '../prismaClient';

// ---------- Candidates ----------

type Role = 'Individual' | 'Mass';
type TutorKind = 'individual' | 'mass';

function mapRoleToKind(role: Role): TutorKind {
  return role === 'Individual' ? 'individual' : 'mass';
}

export async function listCandidatesService(opts?: {
  status?: 'pending' | 'approved' | 'rejected';
  role?: Role;
}) {
  const where: any = {};
  if (opts?.status) where.status = opts.status;
  if (opts?.role) where.role = opts.role;

  return prisma.candidates.findMany({
    where,
    orderBy: [{ applied_at: 'desc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      dob: true,
      phone_number: true,
      user_id: true,
      applied_at: true,
      status: true,
      User: { select: { id: true, name: true, email: true, photo_url: true } },
    },
  });
}

export async function approveCandidateService(candidateId: string) {
  return prisma.$transaction(async (tx) => {
    const c = await tx.candidates.findUnique({ where: { id: candidateId } });
    if (!c) throw Object.assign(new Error('Candidate not found'), { status: 404 });
    if (c.role !== 'Individual' && c.role !== 'Mass') {
      throw Object.assign(new Error('Candidate role must be Individual or Mass'), { status: 400 });
    }
    const kind = mapRoleToKind(c.role);

    if (c.status === 'approved') {
      if (c.user_id) {
        if (kind === 'individual') {
          const t = await tx.individual_Tutor.findFirst({ where: { user_id: c.user_id } });
          return { candidate: c, tutor: t, created: false };
        } else {
          const t = await tx.mass_Tutor.findFirst({ where: { user_id: c.user_id } });
          return { candidate: c, tutor: t, created: false };
        }
      }
      return { candidate: c, tutor: null, created: false };
    }

    let tutor: any = null;
    if (kind === 'individual') {
      if (c.user_id) tutor = await tx.individual_Tutor.findFirst({ where: { user_id: c.user_id } });
      if (!tutor) {
        tutor = await tx.individual_Tutor.create({
          data: {
            user_id: c.user_id ?? null,
            subjects: [],
            titles: [],
            hourly_rate: null,
            description: c.bio ?? '',
            rating: null,
            heading: c.name ?? '',
            location: null,
            phone_number: c.phone_number ? String(c.phone_number) : null,
            qualifications: [],
            status: 'active',
          },
        });
      }
    } else {
      if (c.user_id) tutor = await tx.mass_Tutor.findFirst({ where: { user_id: c.user_id } });
      if (!tutor) {
        tutor = await tx.mass_Tutor.create({
          data: {
            user_id: c.user_id ?? null,
            subjects: [],
            prices: null,
            description: c.bio ?? '',
            rating: null,
            heading: c.name ?? '',
            status: 'active',
          },
        });
      }
    }

    const updatedCandidate = await tx.candidates.update({
      where: { id: candidateId },
      data: { status: 'approved' },
    });

    return { candidate: updatedCandidate, tutor, created: true };
  });
}

export async function rejectCandidateService(candidateId: string) {
  const c = await prisma.candidates.findUnique({ where: { id: candidateId } });
  if (!c) throw Object.assign(new Error('Candidate not found'), { status: 404 });
  if (c.status === 'rejected') return { candidate: c, changed: false };
  const updated = await prisma.candidates.update({
    where: { id: candidateId },
    data: { status: 'rejected' },
  });
  return { candidate: updated, changed: true };
}

// ---------- Tutors: list / suspend / unsuspend ----------

export type ListTutorsOptions = {
  status?: 'active' | 'suspended';
  q?: string;
};

export async function listIndividualTutorsService(opts: ListTutorsOptions = {}) {
  const { status, q } = opts;
  return prisma.individual_Tutor.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { heading: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { User: { email: { contains: q, mode: 'insensitive' } } },
              { User: { name: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    },
    orderBy: [{ heading: 'asc' }],
    select: {
      i_tutor_id: true,
      heading: true,
      description: true,
      status: true,
      rating: true,
      User: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function listMassTutorsService(opts: ListTutorsOptions = {}) {
  const { status, q } = opts;
  return prisma.mass_Tutor.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { heading: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { User: { email: { contains: q, mode: 'insensitive' } } },
              { User: { name: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    },
    orderBy: [{ heading: 'asc' }],
    select: {
      m_tutor_id: true,
      heading: true,
      description: true,
      status: true,
      rating: true,
      User: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function suspendTutorService(kind: 'individual' | 'mass', id: string) {
  if (kind === 'individual') {
    return prisma.individual_Tutor.update({
      where: { i_tutor_id: id },
      data: { status: 'suspended' },
      select: { i_tutor_id: true, status: true },
    });
  }
  return prisma.mass_Tutor.update({
    where: { m_tutor_id: id },
    data: { status: 'suspended' },
    select: { m_tutor_id: true, status: true },
  });
}

export async function unsuspendTutorService(kind: 'individual' | 'mass', id: string) {
  if (kind === 'individual') {
    return prisma.individual_Tutor.update({
      where: { i_tutor_id: id },
      data: { status: 'active' },
      select: { i_tutor_id: true, status: true },
    });
  }
  return prisma.mass_Tutor.update({
    where: { m_tutor_id: id },
    data: { status: 'active' },
    select: { m_tutor_id: true, status: true },
  });
}
