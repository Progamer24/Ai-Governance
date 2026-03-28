// This script creates Supabase users for test accounts (5 per level) using the Supabase Admin API.
// It also verifies that each seeded account can sign in with the shared password.
// Usage: node scripts/create-supabase-users.js

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_LOCAL_PATH = path.resolve(__dirname, '..', '.env.local');

function loadEnvFromFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;

    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFromFile(ENV_LOCAL_PATH);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'Test@12345';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase URL, anon key, or service role key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const verifier = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const levelConfig = [
  { level: 1, role: 'INTERN', department: 'Operations', emailPrefix: 'l1.intern', namePrefix: 'Level 1 Intern', need_tags: ['GENERAL'] },
  { level: 2, role: 'ANALYST', department: 'Sales', emailPrefix: 'l2.analyst', namePrefix: 'Level 2 Analyst', need_tags: ['GENERAL', 'OPERATIONAL'] },
  { level: 3, role: 'MANAGER', department: 'Analytics', emailPrefix: 'l3.manager', namePrefix: 'Level 3 Manager', need_tags: ['GENERAL', 'OPERATIONAL', 'FINANCIAL'] },
  { level: 4, role: 'DIRECTOR', department: 'IT', emailPrefix: 'l4.director', namePrefix: 'Level 4 Director', need_tags: ['GENERAL', 'OPERATIONAL', 'FINANCIAL', 'LEGAL'] },
  { level: 5, role: 'SUPERADMIN', department: 'Executive', emailPrefix: 'l5.superadmin', namePrefix: 'Level 5 Super Admin', need_tags: ['ALL'] },
];

const roleCatalog = [
  { name: 'INTERN', description: 'Entry role with general access', level: 1 },
  { name: 'ANALYST', description: 'Analyst role for operational analysis', level: 2 },
  { name: 'MANAGER', description: 'Manager role for financial decisions', level: 3 },
  { name: 'DIRECTOR', description: 'Director role with legal visibility', level: 4 },
  { name: 'SUPERADMIN', description: 'Superadmin full governance control', level: 5 },
  { name: 'IT_ADMIN', description: 'IT administrator role for system security', level: 3 },
  { name: 'AUDITOR', description: 'Audit-only oversight role', level: 2 },
  { name: 'COMPLIANCE', description: 'Compliance role for legal and policy checks', level: 3 },
  { name: 'EXECUTIVE', description: 'Executive role for strategic oversight', level: 5 },
];

function buildUsersPerLevel(countPerLevel = 5) {
  const users = [];

  for (const cfg of levelConfig) {
    for (let i = 1; i <= countPerLevel; i += 1) {
      const suffix = String(i).padStart(2, '0');
      users.push({
        email: `${cfg.emailPrefix}.${suffix}@example.com`,
        full_name: `${cfg.namePrefix} ${suffix}`,
        department: cfg.department,
        role: cfg.role,
        level: cfg.level,
        need_tags: cfg.need_tags,
      });
    }
  }

  users.push({
    email: 'karan.maheshwari@example.com',
    full_name: 'Karan Maheshwari',
    department: 'Executive',
    role: 'SUPERADMIN',
    level: 5,
    need_tags: ['all'],
  });

  return users;
}

const testUsers = buildUsersPerLevel(5);

async function ensureRoles() {
  const roleNames = roleCatalog.map((role) => role.name);
  const { data: existingRoles, error: existingError } = await supabase
    .from('roles')
    .select('id, name')
    .in('name', roleNames);

  if (existingError) {
    throw new Error(`Failed to read roles: ${existingError.message}`);
  }

  const existingMap = new Map((existingRoles ?? []).map((role) => [role.name, role.id]));
  const missingRoles = roleCatalog.filter((role) => !existingMap.has(role.name));

  if (missingRoles.length > 0) {
    const { error: insertError } = await supabase.from('roles').insert(
      missingRoles.map((role) => ({
        name: role.name,
        description: role.description,
        level: role.level,
        department: null,
        is_system_role: true,
      }))
    );

    if (insertError) {
      throw new Error(`Failed to insert roles: ${insertError.message}`);
    }
  }

  const { data: finalRoles, error: finalError } = await supabase
    .from('roles')
    .select('id, name')
    .in('name', roleNames);

  if (finalError || !finalRoles) {
    throw new Error(`Failed to load final roles: ${finalError?.message ?? 'No roles returned'}`);
  }

  return new Map(finalRoles.map((role) => [role.name, role.id]));
}

async function ensureProfilesAndNRL(users) {
  let roleIdByName;
  try {
    roleIdByName = await ensureRoles();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Could not find the table 'public.roles'")) {
      console.warn('Skipping profiles/nrl_profiles sync: governance tables are not present in this Supabase project.');
      return;
    }
    throw error;
  }
  const { data: listedUsers, error: listUsersError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listUsersError || !listedUsers?.users) {
    throw new Error(`Failed to list auth users: ${listUsersError?.message ?? 'No users returned'}`);
  }

  const idByEmail = new Map(
    listedUsers.users
      .filter((authUser) => typeof authUser.email === 'string')
      .map((authUser) => [String(authUser.email).toLowerCase(), authUser.id])
  );

  for (const user of users) {
    const userId = idByEmail.get(String(user.email).toLowerCase());
    if (!userId) {
      console.warn(`Skipping profile/NRL for ${user.email}: auth user id not found`);
      continue;
    }

    const roleId = roleIdByName.get(user.role);
    if (!roleId) {
      console.warn(`Skipping NRL profile for ${user.email}: role ${user.role} not found in roles table`);
      continue;
    }

    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: userId,
        full_name: user.full_name,
        email: user.email,
        department: user.department,
        is_active: true,
        is_mfa_enabled: false,
        failed_login_count: 0,
        locked_until: null,
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      throw new Error(`Failed to upsert profile for ${user.email}: ${profileError.message}`);
    }

    const { data: existingNRL, error: existingNrlError } = await supabase
      .from('nrl_profiles')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (existingNrlError) {
      throw new Error(`Failed to read nrl profile for ${user.email}: ${existingNrlError.message}`);
    }

    const payload = {
      user_id: userId,
      role_id: roleId,
      need_tags: Array.isArray(user.need_tags) ? user.need_tags : [],
      level: user.level,
      valid_from: new Date().toISOString(),
      valid_until: null,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    if (existingNRL?.id) {
      const { error: updateNrlError } = await supabase
        .from('nrl_profiles')
        .update(payload)
        .eq('id', existingNRL.id);

      if (updateNrlError) {
        throw new Error(`Failed to update nrl profile for ${user.email}: ${updateNrlError.message}`);
      }
    } else {
      const { error: insertNrlError } = await supabase
        .from('nrl_profiles')
        .insert(payload);

      if (insertNrlError) {
        throw new Error(`Failed to insert nrl profile for ${user.email}: ${insertNrlError.message}`);
      }
    }
  }
}

async function verifyUser(email) {
  const { data, error } = await verifier.auth.signInWithPassword({
    email,
    password: TEST_USER_PASSWORD,
  });

  if (error || !data?.session) {
    return { ok: false, reason: error?.message || 'No session returned' };
  }

  await verifier.auth.signOut();
  return { ok: true };
}

async function main() {
  const ensured = [];
  const failed = [];

  for (const user of testUsers) {
    const { error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: TEST_USER_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        department: user.department,
        role: user.role,
        level: user.level,
      },
    });

    const duplicateRegistration = error && /already.*registered/i.test(String(error.message));

    if (error && !duplicateRegistration) {
      failed.push({ email: user.email, reason: error.message });
      console.error(`Failed to create user ${user.email}: ${error.message}`);
    } else {
      ensured.push(user);
      console.log(`${duplicateRegistration ? 'User already existed' : 'User ensured'}: ${user.email}`);
    }
  }

  const verified = [];
  const verifyFailed = [];
  for (const user of ensured) {
    const check = await verifyUser(user.email);
    if (check.ok) {
      verified.push(user.email);
    } else {
      verifyFailed.push({ email: user.email, reason: check.reason });
      console.error(`Login verification failed ${user.email}: ${check.reason}`);
    }
  }

  console.log('\n=== SUPABASE SEEDED USERS ===');
  console.log(`ensured: ${ensured.length}`);
  console.log(`verified: ${verified.length}`);
  console.log(`create_failures: ${failed.length}`);
  console.log(`verify_failures: ${verifyFailed.length}`);
  console.log(`shared_password: ${TEST_USER_PASSWORD}`);
  console.log('users:');
  for (const user of ensured) {
    console.log(`- ${user.email} | ${user.role} | level ${user.level}`);
  }

  await ensureProfilesAndNRL(ensured);
  console.log('profiles and nrl_profiles synchronization step completed');

  if (failed.length || verifyFailed.length) {
    process.exit(1);
  }

  process.exit(0);
}

main();
