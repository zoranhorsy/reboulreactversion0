module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  moduleDirectories: ["node_modules", "<rootDir>/"],
  // Configuration pour les tests organisés
  testMatch: [
    "<rootDir>/tests/**/*.test.(ts|tsx|js|jsx)",
    "<rootDir>/src/**/*.test.(ts|tsx|js|jsx)",
    "<rootDir>/backend/**/*.test.js"
  ],
  // Collecte de coverage depuis les dossiers organisés
  collectCoverageFrom: [
    "src/**/*.{ts,tsx,js,jsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx,js,jsx}",
  ],
}

