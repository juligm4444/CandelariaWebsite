import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

/**
 * Flat config. `eslint-config-next` 16 ships native flat arrays, so the
 * `FlatCompat` shim is not used: it cannot serialise the plugin graph and
 * fails outright.
 */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'graphify-out/**',
      'next-env.d.ts',
      '.playwright-cli/**',
      'supabase/migrations/**',
    ],
  },

  ...nextCoreWebVitals,
  ...nextTypeScript,

  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // `any` erases the type checking that keeps untrusted input honest.
      '@typescript-eslint/no-explicit-any': 'error',
      // Logging is how the server surfaces security events, but `console.log`
      // in a request path tends to be a leftover debug statement.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // `target="_blank"` without `rel` hands the opener to the destination.
      'react/jsx-no-target-blank': 'error',
    },
  },
];

export default config;
