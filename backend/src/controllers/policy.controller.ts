import { Request, Response } from 'express';
import {
  svcListPolicies,
  svcGetPolicy,
  svcCreatePolicy,
  svcUpdatePolicy,
  svcDeletePolicy,
} from '../services/policy.service';

function getAdminId(req: Request): string | null {
  const adminId = (req as any).admin.adminId || null; // set by requireAdminJWT
  if (!adminId) {
    console.log('Admin ID not found in request');
    return null;
  }
  console.log(`Admin ID ${adminId} found in request`);
  return adminId;
}

/**
 * GET /Admin/policies
 */
export async function listPolicies(req: Request, res: Response) {
  try {
    const rows = await svcListPolicies();
    res.json({ policies: rows });
  } catch (e: any) {
    res.status(e?.status || 500).json({ error: e?.message || 'Failed to list policies' });
    console.error(e);
  }
}

/**
 * GET /Admin/policies/:id
 */
export async function getPolicy(req: Request, res: Response) {
  try {
    const row = await svcGetPolicy(req.params.id);
    if (!row) return res.status(404).json({ error: 'Policy not found' });
    res.json(row);
  } catch (e: any) {
    res.status(e?.status || 500).json({ error: e?.message || 'Failed to get policy' });
  }
}

/**
 * POST /Admin/policies
 * body: { policy_name, type, description }
 */
export async function createPolicy(req: Request, res: Response) {
  try {
    const adminId = getAdminId(req);
    const row = await svcCreatePolicy({
      policy_name: req.body?.policy_name,
      type: req.body?.type,
      description: req.body?.description,
      adminId,
    });
    res.status(201).json(row);
  } catch (e: any) {
    res.status(e?.status || 500).json({ error: e?.message || 'Failed to create policy' });
  }
}

/**
 * PUT /Admin/policies/:id
 * body: { policy_name?, type?, description? }
 */
export async function updatePolicy(req: Request, res: Response) {
  try {
    const adminId = await getAdminId(req);
    // console.log(`Admin ${adminId} updating policy ${req.params.id} with data:`, req.body);
    const row = await svcUpdatePolicy(req.params.id, {
      policy_name: req.body?.policy_name,
      type: req.body?.type,
      description: req.body?.description,
      adminId,
    });
    console.log('Updated policy:', row);
    if (!row) return res.status(404).json({ error: 'Policy not found' });
    res.json(row);
  } catch (e: any) {
    res.status(e?.status || 500).json({ error: e?.message || 'Failed to update policy' });
  }
}

/**
 * DELETE /Admin/policies/:id
 */
export async function deletePolicy(req: Request, res: Response) {
  try {
    const deletedId = await svcDeletePolicy(req.params.id);
    res.json({ ok: true, policy_id: deletedId });
  } catch (e: any) {
    res.status(e?.status || 500).json({ error: e?.message || 'Failed to delete policy' });
  }
}
