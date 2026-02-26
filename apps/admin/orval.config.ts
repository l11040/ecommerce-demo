import { defineConfig } from 'orval';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:40003';

export default defineConfig({
  bo: {
    input: {
      target: `${API_URL}/openapi/bo-json`,
    },
    output: {
      target: './src/api/bo.ts',
      client: 'fetch',
      mode: 'single',
      override: {
        mutator: {
          path: './src/lib/fetcher.ts',
          name: 'fetcher',
        },
      },
    },
  },
});
