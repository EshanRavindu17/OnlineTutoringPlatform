import prisma from '../prismaClient';

export type PolicyRow = {
  policy_id: string;
  policy_name: string;
  type: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  updated_by: string | null;
};

// Only these types are handled on this screen (rates handled separately)
export const ALLOWED_TYPES = new Set(['tos', 'privacy', 'guidelines', 'conduct']);

export async function svcListPolicies(): Promise<PolicyRow[]> {
  try {
    const policies = await prisma.policies.findMany({
      where: {
        type: {
          not: 'rates',
        },
      },
      orderBy: [
        { updated_at: 'desc' },
        { created_at: 'desc' },
      ],
      select: {
        policy_id: true,
        policy_name: true,
        type: true,
        description: true,
        created_at: true,
        updated_at: true,
        updated_by: true,
      },
    });

    return policies;
  } catch (error) {
    console.error('Error listing policies:', error);
    throw error;
  }
}

export async function svcGetPolicy(id: string): Promise<PolicyRow | null> {
  try {
    const policy = await prisma.policies.findUnique({
      where: { policy_id: id },
      select: {
        policy_id: true,
        policy_name: true,
        type: true,
        description: true,
        created_at: true,
        updated_at: true,
        updated_by: true,
      },
    });

    return policy;
  } catch (error) {
    console.error('Error getting policy:', error);
    throw error;
  }
}

export async function svcCreatePolicy(params: {
  policy_name: string;
  type: string;
  description?: string | null;
  adminId: string | null;
}): Promise<PolicyRow> {
  const { policy_name, type, description, adminId } = params;

  if (!policy_name || !type) {
    const err: any = new Error('policy_name and type are required');
    err.status = 400;
    throw err;
  }

  if (!ALLOWED_TYPES.has(String(type))) {
    const err: any = new Error(`type must be one of ${Array.from(ALLOWED_TYPES).join(', ')}`);
    err.status = 400;
    throw err;
  }

  try {
    const newPolicy = await prisma.policies.create({
      data: {
        policy_name,
        type,
        description: description ?? null,
        created_at: new Date(),
        updated_at: new Date(),
        updated_by: adminId,
      },
      select: {
        policy_id: true,
        policy_name: true,
        type: true,
        description: true,
        created_at: true,
        updated_at: true,
        updated_by: true,
      },
    });

    return newPolicy;
  } catch (error: any) {
    console.error('Error creating policy:', error);

    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const err: any = new Error('A policy with this name or type already exists');
      err.status = 400;
      throw err;
    }

    throw error;
  }
}

export async function svcUpdatePolicy(
  id: string,
  params: {
    policy_name?: string;
    type?: string;
    description?: string | null;
    adminId: string | null;
  }
): Promise<PolicyRow> {
  const { policy_name, type, description, adminId } = params;
  console.log('svcUpdatePolicy', id, params);

  if (type !== undefined && !ALLOWED_TYPES.has(String(type))) {
    const err: any = new Error(`type must be one of ${Array.from(ALLOWED_TYPES).join(', ')}`);
    err.status = 400;
    throw err;
  }

  // Build the update data object
  const updateData: any = {
    updated_at: new Date(),
    updated_by: adminId,
  };

  if (policy_name !== undefined) updateData.policy_name = policy_name;
  if (type !== undefined) updateData.type = type;
  if (description !== undefined) updateData.description = description;

  // Check if there are any actual changes to make
  const hasChanges = policy_name !== undefined || type !== undefined || description !== undefined;
  if (!hasChanges) {
    const err: any = new Error('No changes provided');
    err.status = 400;
    throw err;
  }

  try {
    const updatedPolicy = await prisma.policies.update({
      where: { policy_id: id },
      data: updateData,
      select: {
        policy_id: true,
        policy_name: true,
        type: true,
        description: true,
        created_at: true,
        updated_at: true,
        updated_by: true,
      },
    });

    return updatedPolicy;
  } catch (error: any) {
    console.error('Error updating policy:', error);

    if (error.code === 'P2025') {
      const err: any = new Error('Policy not found');
      err.status = 404;
      throw err;
    }

    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const err: any = new Error('A policy with this name already exists');
      err.status = 400;
      throw err;
    }

    throw error;
  }
}

export async function svcDeletePolicy(id: string): Promise<string> {
  try {
    const deletedPolicy = await prisma.policies.delete({
      where: { policy_id: id },
      select: { policy_id: true },
    });

    return deletedPolicy.policy_id;
  } catch (error: any) {
    console.error('Error deleting policy:', error);

    if (error.code === 'P2025') {
      const err: any = new Error('Policy not found');
      err.status = 404;
      throw err;
    }

    throw error;
  }
}
