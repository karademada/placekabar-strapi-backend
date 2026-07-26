'use strict';

/**
 * Ouvre en lecture publique les endpoints Partner et Commitment.
 * Evite d'aller cocher les cases dans Settings → Roles → Public.
 *
 * Run with the dev server STOPPED (SQLite single-writer):
 *   node scripts/enable-public-partners.js
 *
 * Idempotent: les permissions déjà présentes sont laissées telles quelles.
 */

const { createStrapi, compileStrapi } = require('@strapi/strapi');

const ACTIONS = [
  'api::partner.partner.find',
  'api::partner.partner.findOne',
  'api::commitment.commitment.find',
  'api::commitment.commitment.findOne',
];

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';

  const publicRole = await app.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  if (!publicRole) {
    console.error('public role not found — is the users-permissions plugin installed?');
    await app.destroy();
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;

  for (const action of ACTIONS) {
    const existing = await app.db.query('plugin::users-permissions.permission').findOne({
      where: { action, role: publicRole.id },
    });
    if (existing) {
      skipped += 1;
      continue;
    }
    await app.db.query('plugin::users-permissions.permission').create({
      data: { action, role: publicRole.id },
    });
    created += 1;
  }

  console.log(`done: ${created} permissions granted, ${skipped} already set`);
  await app.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
