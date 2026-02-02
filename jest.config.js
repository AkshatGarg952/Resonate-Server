export default {
    testEnvironment: 'node',
    transform: {},
    testMatch: [
        '**/src/tests/**/*.test.js'
    ],
    collectCoverageFrom: [
        'src/services/**/*.js',
        'src/utils/memory*.js',
        '!src/tests/**'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    }
};
