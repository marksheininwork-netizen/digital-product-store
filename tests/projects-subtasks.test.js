import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../projects.js', import.meta.url), 'utf8');
const cardSource = source.match(/function card\(t\)\{[\s\S]*?(?=function board\()/)?.[0] ?? '';

test('task cards render accessible, escaped, stateful subtask checkboxes', () => {
  assert.match(cardSource, /class="np-subtask"/);
  assert.match(cardSource, /type="checkbox" data-subtask=/);
  assert.match(cardSource, /data-subindex=/);
  assert.match(cardSource, /s\.done\?'checked'/);
  assert.match(cardSource, /esc\(s\.title\)/);
  assert.match(source, /if\(sub\)\{sub\.done=b\.checked;save\(\);render\(\)\}/);
});
