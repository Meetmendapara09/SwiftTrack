import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  clearMocks: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{js,ts}', // Often boilerplate
    '!src/app/layout.tsx', // Usually too simple or complex to unit test meaningfully
    '!src/app/api/**/*', // API routes might need different testing strategy
    '!src/app/actions/**/*', // Server actions might need different testing
    '!src/lib/database.types.ts', // Generated file
    '!src/ai/**/*', // AI related files, often need specific mocking
    '!src/pages/api/socket.ts' // Socket server setup
  ],
  moduleNameMapper: {
    // Handle CSS imports (if you import CSS directly in components)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle module aliases (if you have them in tsconfig.json)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false, // Set to true if you want coverage reports by default
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
