#!/usr/bin/env node
/**
 * Rejects control characters in source files.
 *
 * A stray NUL or other control byte makes git classify a file as binary, which
 * silently disables three-way merges: a conflict is then resolved by taking one
 * side wholesale, so the other side's work is discarded without a warning.
 *
 *   node scripts/checkSourceEncoding.mjs            # staged files (pre-commit)
 *   node scripts/checkSourceEncoding.mjs --all      # every tracked file
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const CHECKED_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.json',
  '.md',
  '.yml',
  '.yaml',
]);

/** Tab, newline and carriage return are the only control bytes source may use. */
function isDisallowed(byte) {
  return (byte < 0x09 || (byte > 0x0d && byte < 0x20) || byte === 0x7f) &&
    byte !== 0x09 &&
    byte !== 0x0a &&
    byte !== 0x0d;
}

function gitLines(args) {
  return execFileSync('git', args, { encoding: 'utf8' })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function describe(byte) {
  if (byte === 0) return 'NUL (0x00)';
  return `0x${byte.toString(16).padStart(2, '0')}`;
}

const all = process.argv.includes('--all');
const files = (
  all
    ? gitLines(['ls-files'])
    : gitLines(['diff', '--cached', '--name-only', '--diff-filter=ACMR'])
).filter((file) => CHECKED_EXTENSIONS.has(file.slice(file.lastIndexOf('.'))));

const failures = [];

for (const file of files) {
  let buffer;
  try {
    buffer = readFileSync(file);
  } catch {
    continue; // staged deletion, or otherwise unreadable
  }

  for (let i = 0; i < buffer.length; i++) {
    if (!isDisallowed(buffer[i])) continue;

    const line = buffer.subarray(0, i).toString('utf8').split('\n').length;
    failures.push({ file, line, byte: buffer[i] });
    break; // one report per file is enough to block the commit
  }
}

if (failures.length > 0) {
  console.error('\nControl characters found in source files:\n');
  for (const { file, line, byte } of failures) {
    console.error(`  ${file}:${line} — ${describe(byte)}`);
  }
  console.error(
    '\nGit treats these files as binary, which disables merging and can discard\n' +
      'work during a conflict. Remove the character, then commit again.\n'
  );
  process.exit(1);
}

if (all) {
  console.log(`Checked ${files.length} files — no control characters found.`);
}
