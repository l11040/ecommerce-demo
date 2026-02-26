import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CANDIDATE_ENV_FILES = ['.env', '../../.env'];

function parseAndApply(raw: string): void {
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

let loaded = false;

export function loadEnv(): void {
  if (loaded) {
    return;
  }

  for (const relativePath of CANDIDATE_ENV_FILES) {
    const fullPath = resolve(process.cwd(), relativePath);

    if (!existsSync(fullPath)) {
      continue;
    }

    parseAndApply(readFileSync(fullPath, 'utf-8'));
    loaded = true;
    return;
  }
}
