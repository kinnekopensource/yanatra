/**
 *  The default yanatra file that is used, or if a yanatra files exist in the current working directory,
 *  merged with.
 */

module.exports = {
    suites: false,
    reports: false,
    actions: false,
    // Capabilities to be passed to the webdriver instance.
    browsers: {
        firefox: {
            name: 'Firefox',
            browserName: 'firefox',

        },
        chrome: {
            name: 'Chrome',
            browserName: 'chrome'
        },
        ios: {
            name: 'iOS 8 - iPad',
            platformName: 'iOS',
            platformVersion: '8.0',
            deviceName: 'iPad Simulator',
            browserName: 'Safari',
            orientation: 'landscape'
        }
    },
    baseUrls: {
        local: "http://google.com"
    }
};