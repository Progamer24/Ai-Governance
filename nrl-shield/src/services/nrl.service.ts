import { supabase } from '../config/supabase'
import type { NRLProfile } from '../types/rbac.types'

export async function getNRLProfile(userId: string): Promise<NRLProfile | null> {
const { data, error } = await supabase
.from('nrl_profiles')
.select('*')
.eq('user_id', userId)
.order('created_at', { ascending: false })
.limit(1)
.maybeSingle()

if (error) throw error
if (!data) return null

return mapProfile(data)
}

export async function getActiveProfile(userId: string): Promise<NRLProfile | null> {
const { data, error } = await supabase
.from('nrl_profiles')
.select('*')
.eq('user_id', userId)
.eq('is_active', true)
.maybeSingle()

if (error) throw error
if (!data) return null

return mapProfile(data)
}

export async function updateNRLProfile(
profileId: string,
updates: Partial<NRLProfile>,
): Promise<NRLProfile> {
const dbUpdates: Record<string, unknown> = {}
if (updates.roleId !== undefined) dbUpdates.role_id = updates.roleId
if (updates.needTags !== undefined) dbUpdates.need_tags = updates.needTags
if (updates.level !== undefined) dbUpdates.level = updates.level
if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive
if (updates.validFrom !== undefined) dbUpdates.valid_from = updates.validFrom
if (updates.validUntil !== undefined) dbUpdates.valid_until = updates.validUntil

const { data, error } = await supabase
.from('nrl_profiles')
.update(dbUpdates)
.eq('id', profileId)
.select()
.single()

if (error) throw error
return mapProfile(data)
}

function mapProfile(row: Record<string, unknown>): NRLProfile {
return {
id: row.id as string,
userId: (row.user_id as string),
roleId: (row.role_id as string),
needTags: (row.need_tags as string[]) ?? [],
level: row.level as number,
validFrom: row.valid_from as string,
validUntil: (row.valid_until as string) ?? null,
isActive: row.is_active as boolean,
}
}
