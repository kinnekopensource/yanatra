module.exports = {
    suites: "./scripts",
    reports: "./reports",
    actions: "./actions.js",
    baseUrls: {
        dev: 'http://localhost:8000/'
    },
    presets: {
        allbrowsers: {
            browsers: "chrome,firefox",
            testName: "allbrowsers"
        }
    },
    options: {
        yourCustomOptionHere: {
            demand: false,
            nargs: 1,
            describe: "email/username for user",
            type: 'string'
        }
    }
};