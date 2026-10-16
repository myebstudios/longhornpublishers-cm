import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { newsImage } from '../src/lib/news-image.ts';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('news images use the stored media key in both locales and tolerate no image', () => {
  const article = { hero_image_id: 'uploads/example.png', headline_en: 'English', headline_fr: 'Français', body_en: 'First\n\nSecond', body_fr: 'Premier\n\nDeuxième' };
  for (const locale of ['en', 'fr']) {
    assert.equal(newsImage(article), '/api/media/uploads/example.png');

  }
  assert.equal(newsImage({ hero_image_id: null }), null);
  assert.equal(newsImage({ hero_image_id: '' }), null);
});

test('every public news query reads the saved image and published/demo constraints stay intact', () => {
  const source = read('src/lib/news.ts');
  const queries = [...source.matchAll(/SELECT[\s\S]*?FROM news_articles[\s\S]*?ORDER BY/g)];
  assert.equal(queries.length, 4);
  for (const [query] of queries) {
    assert.match(query, /hero_image_id/);
    assert.match(query, /WHERE published = true/);
  }
  assert.equal(source.match(/published = true AND is_demo = false/g)?.length, 2);
});

test('news cards, homepage teasers and article pages render the uploaded image with no-image fallbacks', () => {
  for (const name of ['src/components/pages/News.astro', 'src/pages/[lang]/index.astro', 'src/components/pages/NewsArticle.astro']) {
    const source = read(name);
    assert.match(source, /newsImage\(article\)/);
    assert.match(source, /<img[^>]*src=\{newsImage\(article\)!\}/);
    assert.match(source, /alt=""/);
    if (!name.includes('NewsArticle')) assert.match(source, /categoryIcon\(article.category\)/);
  }
  assert.match(read('netlify/functions/_shared/media-approval.ts'), /FROM news_articles WHERE published = true AND hero_image_id = \$\{key\}/);
});
