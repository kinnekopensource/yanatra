/**
 * Base Protractor config that is loaded prior to the Yanatra build.
 *
 * TODO: figure out an elegant way to allow custom protractor configs.
 *
 * @type object
 */
const env = require(process.env.E2E_ENV_FILE),
    multiCapabilities = [],
    HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter'),
    plugins = [];

const addCapability = function(browser) {
    if (env.args.parallel) {
        browser.shardTestFiles = true;
        browser.maxInstances = env.args.parallel;
    }
    multiCapabilities.push(browser);
};

var reporter,
    failFast,
    capabilities;

const init = function() {
    global.yanatra = {
        env: env
    };
    if (env.reportDir) {
        reporter = new HtmlScreenshotReporter({
            dest: env.reportDir,
            filename: 'index.html',
            pathBuilder: function(currentSpec, suites, browserCapabilities) {
                var browser = browserCapabilities.get('browserName') === "chrome" ? "" : browserCapabilities.get('browserName') + "/";
                return "screenshots/" + browser + yanatra.env.currentSpecName;
            }
        });
    } else {
        console.log("No reports will be generated for this test");
    }
    if (env.args.browsers) {
        env.args.browsers.split(",").forEach(function( browserName ) {
            addCapability(env.config.browsers[browserName]);
        })
    } else {
        addCapability(env.config.browsers.chrome);
    }
    if (!env.args.steamroll) {
        failFast = require('protractor-fail-fast');
        plugins.push({
            package: 'protractor-fail-fast'
        })
    }
};
init();

exports.config = {
    baseUrl: env.config.baseUrls[env.args.baseUrl || "local"],
    seleniumJar: '../../node_modules/protractor/selenium/selenium-server-standalone-2.52.0.jar',
    beforeLaunch: function() {
        if (env.reportDir) {
            return new Promise(function (resolve) {
                reporter.beforeLaunch(resolve);
            });
        }
    },
    onPrepare: function() {
        require('../lib/waitReady.js');
        var jsReporters = require('jasmine-reporters');
        var SpecReporter = require('jasmine-spec-reporter');
        jasmine.getEnv().addReporter(new SpecReporter({
            displayStacktrace: 'none',
            displayFailuresSummary: false
        }));
        if (!env.args.steamroll) {
            jasmine.getEnv().addReporter(failFast.init());
        }
        if (env.reportDir) jasmine.getEnv().addReporter(reporter);
        jasmine.getEnv().addReporter(
            new jsReporters.JUnitXmlReporter('xmloutput', true, true));

    },
    plugins: plugins,
    afterLaunch: function() {
        if (!env.args.steamroll) {
            failFast.clean(); // Cleans up the "fail file" (see below)
        }
        if (env.reportDir) {
            return new Promise(function (resolve) {
                reporter.afterLaunch(resolve.bind(this, exitCode));
            });
        }
    },

    onComplete: function () {
        var open = require("open");
        if (env.reportDir) {
            open(env.reportDir + "/index.html");
        }
    },
    capabilities: capabilities,
    multiCapabilities: multiCapabilities,
    jasmineNodeOpts: {
        defaultTimeoutInterval: 999999,
        print: function() {}
    }
};

