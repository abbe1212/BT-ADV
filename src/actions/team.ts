'use server';

/**
 * Server Actions — Team
 * ─────────────────────────────────────────────────────────────────────────────
 * All admin write operations for the `team` table.
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { TeamMemberInsertSchema, TeamMemberUpdateSchema } from '@/lib/validations';
import type { TeamMember } from '@/lib/supabase/types';

export interface MutationResult<T = void> {
  data: T | null;
  error: string | null;
}

export interface TeamMemberInsert {
  name_ar: string;
  name_en?: string | null;
  role_ar: string;
  role_en?: string | null;
  image_url?: string | null;
  is_featured?: boolean;
  order_index?: number;
}

export interface TeamMemberUpdate extends Partial<TeamMemberInsert> {
  id: string;
}

export async function insertTeamMember(payload: TeamMemberInsert): Promise<MutationResult<TeamMember>> {
  const parsed = TeamMemberInsertSchema.safeParse(payload);
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('team')
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    console.error('[SA insertTeamMember]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/team');
  revalidatePath('/about');
  return { data: data as TeamMember, error: null };
}

export async function updateTeamMember({ id, ...payload }: TeamMemberUpdate): Promise<MutationResult<TeamMember>> {
  const parsed = TeamMemberUpdateSchema.safeParse({ id, ...payload });
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const { id: parsedId, ...updateData } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('team')
    .update(updateData)
    .eq('id', parsedId)
    .select()
    .single();

  if (error) {
    console.error('[SA updateTeamMember]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/team');
  revalidatePath('/about');
  return { data: data as TeamMember, error: null };
}

export async function deleteTeamMember(id: string): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('team').delete().eq('id', id);

  if (error) {
    console.error('[SA deleteTeamMember]', error.message);
    return { data: null, error: error.message };
  }

  revalidatePath('/admin/team');
  revalidatePath('/about');
  return { data: null, error: null };
}
