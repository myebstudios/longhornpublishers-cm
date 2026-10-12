import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { adminBadgeTone } from '../src/lib/admin-v2-model.ts';
const css = fs.readFileSync(new URL('../src/styles/admin.css', import.meta.url), 'utf8');
const tokens = Object.fromEntries([...css.matchAll(/--admin-([\w-]+):([^;]+);/g)].map((m) => [m[1], m[2]]));
const luminance = (hex) => {
  const rgb = hex.replace('#', '').match(/../g).map((v) => parseInt(v, 16) / 255).map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
};
const contrast = (fg, bg) => { const [a,b] = [luminance(fg),luminance(bg)].sort((a,b) => b-a); return (a+.05)/(b+.05); };

test('admin palette matches the approved brand and semantic tokens', () => {
  const approved = {canvas:'#FBF6EE',surface:'#FFFFFF',subtle:'#F3EADD',ink:'#1A1216',muted:'#5A4C52',sidebar:'#3B0F1B','sidebar-hover':'#5C1A2B','sidebar-text':'#FBF6EE',accent:'#5C1A2B','accent-hover':'#3B0F1B','accent-soft':'#7A2C3F','accent-bg':'#F7EDF0',green:'#6FBF3F',success:'#2F7A2A','success-hover':'#245E20','success-bg':'#EAF7E2',orange:'#F47E27',warning:'#854D0E','warning-bg':'#FFF0E3',danger:'#B91C1C','danger-bg':'#FEF2F2',border:'#E4D9CD','control-border':'#71717A',focus:'#5C1A2B'};
  for (const [key,value] of Object.entries(approved)) assert.equal(tokens[key], value, key);
});
test('approved text and control contrast thresholds pass before rounding', () => {
  const pairs = [];
  for (const fg of ['ink','muted','accent','accent-hover']) for (const bg of ['surface','canvas','subtle']) pairs.push([fg,bg,4.5]);
  for (const bg of ['sidebar','accent','accent-soft']) pairs.push(['canvas',bg,4.5]);
  for (const bg of ['accent','accent-hover','success','success-hover','danger']) pairs.push(['surface',bg,4.5]);
  pairs.push(['success','success-bg',4.5],['warning','warning-bg',4.5],['danger','danger-bg',4.5],['sidebar','green',4.5],['sidebar','orange',4.5],['accent','accent-bg',4.5]);
  for (const bg of ['surface','canvas','subtle','accent-bg','success-bg','warning-bg']) pairs.push(['control-border',bg,3]);
  for (const [fg,bg,min] of pairs) assert.ok(contrast(tokens[fg],tokens[bg]) >= min, `${fg}/${bg}`);
});
test('badge paint retains the saved meaning and never treats classification as approval', () => {
  for (const label of ['Draft','Disabled','Not set up','Not featured','Other developed','Unclassified','National Book List · verified']) assert.equal(adminBadgeTone(label),'neutral',label);
  for (const label of ['Published','Enabled','Published · Text eligible','Cover · Public eligible']) assert.equal(adminBadgeTone(label),'success',label);
  for (const label of ['Published · Listing withheld','Cover · Not published']) assert.equal(adminBadgeTone(label),'warning',label);
  assert.equal(adminBadgeTone('Catalogue featured'),'featured');
  assert.equal(adminBadgeTone('Selected on homepage'),'featured');
  assert.equal(adminBadgeTone('Failed'),'error');
});
test('brand overrides are admin-scoped, with readable pending states and distinct light/dark focus', () => {
  const overrides = css.split('/* V2-6 §13:')[1].split('*/')[1];
  for (const [,selectors] of overrides.matchAll(/(?:^|\})\s*([^{}]+)\{/g)) for (const selector of selectors.split(/,(?![^()]*\))/)) assert.match(selector.trim(), /^\.admin-(app|login)\b/);
  assert.doesNotMatch(css, /opacity:\s*\.55/);
  assert.match(overrides, /sidebar-text\);outline-offset:2px;box-shadow:0 0 0 2px var\(--admin-sidebar\)/);
  assert.match(css, /outline:3px solid var\(--admin-focus\);outline-offset:2px;box-shadow:0 0 0 2px white/);
});
