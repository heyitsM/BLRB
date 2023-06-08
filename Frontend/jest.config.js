export default {
  testPathIgnorePatterns: ["../Backend/tests/"],
  testEnvironment: "jsdom",
  collectCoverage:true,
  coverageReporters: ["lcov", "text"],
  coverageThreshold: {
    "global": {
    "branches": 0,
    "functions": 0,
    "lines": 0,
    "statements": 0
    }
  },
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':'<rootDir>/tests/mocks/ImageMock.js',
    "\\.(css|less)$": "<rootDir>/tests/mocks/StyleMock.js"
  },
};
