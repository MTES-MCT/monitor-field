// Minimal, self-contained Jest config for the benchmark.
//
// Deliberately does NOT extend `jest.config.js`/`jest-expo`: the benchmark only exercises
// pure TypeScript + Zod, so it doesn't need the Expo Babel preset (which also happens to be
// unusable here because of a broken `hermes-parser` install). It reuses the same `@/…` alias
// map so the files under `src/` resolve identically.
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@database/(.*)$': '<rootDir>/src/database/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@storage$': '<rootDir>/src/storage',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1'
  },
  testEnvironment: 'node',
  testMatch: ['<rootDir>/benchmark/**/*.benchmark.ts'],
  testTimeout: 120000,
  transform: {
    '^.+\\.tsx?$': [
      'babel-jest',
      {
        plugins: ['@babel/plugin-transform-modules-commonjs'],
        presets: ['@babel/preset-typescript']
      }
    ]
  }
}
