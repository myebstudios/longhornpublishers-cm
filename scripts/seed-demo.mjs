import { execFileSync } from 'node:child_process';
import { assertLocalSeedEnvironment, assertLoopbackConnection, demoSeedSql } from './demo-seed-lib.mjs';

function netlify(...args) {
  return execFileSync('npx', ['--no-install', 'netlify', ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

try {
  assertLocalSeedEnvironment(process.env);

  const connection = JSON.parse(netlify('database', 'connect', '--json'));
  assertLoopbackConnection(connection.connection_string, connection.context);

  const schema = JSON.parse(netlify(
    'database', 'connect', '--json', '--query',
    "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'catalogue_titles' AND column_name = 'is_demo') AS demo_ready, EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'catalogue_titles' AND column_name = 'product_code') AS has_product_code, EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'news_articles' AND column_name = 'is_demo') AS has_news_demo",
  ));
  const state = schema[0] ?? {};
  if (!state.demo_ready) {
    throw new Error('Local migration 003_local_demo_origin is not applied. Start `npm run dev`, then retry.');
  }

  if (!state.has_news_demo) {
    console.warn('Migration 004_news_demo_origin is not applied locally; seeding catalogue only. Restart `npm run dev` to pick it up.');
  }

  const sql = demoSeedSql(Boolean(state.has_product_code), Boolean(state.has_news_demo));
  netlify('database', 'connect', '--query', sql);

  const verification = JSON.parse(netlify(
    'database', 'connect', '--json', '--query',
    state.has_news_demo
      ? 'SELECT (SELECT COUNT(*)::int FROM catalogue_titles WHERE is_demo = true) AS titles, (SELECT COUNT(*)::int FROM subjects WHERE is_demo = true) AS subjects, (SELECT COUNT(*)::int FROM news_articles WHERE is_demo = true) AS news, (SELECT COUNT(*)::int FROM news_articles WHERE is_demo = true AND published = true) AS news_published'
      : 'SELECT (SELECT COUNT(*)::int FROM catalogue_titles WHERE is_demo = true) AS titles, (SELECT COUNT(*)::int FROM subjects WHERE is_demo = true) AS subjects, 0 AS news, 0 AS news_published',
  ));
  const counts = verification[0] ?? { titles: 0, subjects: 0, news: 0, news_published: 0 };
  console.log(
    `Seeded local demo CMS data (${counts.titles} titles / ${counts.subjects} subjects / `
    + `${counts.news} news articles, ${counts.news_published} published).`,
  );
  console.log('Demo rows are marked is_demo=true and are excluded outside the local dev runtime.');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
