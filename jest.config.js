module.exports = {
  preset: "jest-expo",
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
  coverageReporters: ["lcov", "text-summary"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/assets/(.*)$": "<rootDir>/assets/$1",
  },
};
