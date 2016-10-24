#!/usr/bin/env node
/**
 *  ====================
 *  YANATRA V0.0.1 ALPHA
 *  ====================
 *
 *  Run e2e tests with JSON.
 *  Index file for managing and running yanatra specs on your system.
 *
 *  TODO: This file is getting lengthy, break it up into smaller modules.
 */


"use strict";

const path = require('path'),
    REQUIRED_AS_MODULE = require.main !== module,
    TMP_DIR = path.join(require('os-tmpdir')(), Date.now() / 1000 + "") + path.sep,
    yanatraConfig = require(path.join(__dirname, 'src/config/yanatra.default.js')),
    fs = require('fs'),
    gulp = require('gulp'),
    webDriverUpdate = require("gulp-protractor").webdriver_update,
    rename = require('gulp-rename'),
    del = require('del'),
    concat = require('gulp-concat-util'),
    chalk = require('chalk');

var CWD = process.cwd();

const getDirectoryYanatraConfig = function() {
    return require(path.join(process.cwd(), "yanatra.js"));
};

const getYanatraActions = function(env) {
    var actions;
    env.debugShow = true;
    global.browser = {};
    global.yanatra = {
        env: env
    };
    writeEnvFile(env);
    actions = require(path.join(__dirname,"./src/actions/"));
};

const processArguments = function(result) {
    var command = result.argv._[0];
    var secondCmd = result.argv._[1];
    if (command === "run") {
        return result.argv;
    } else if (command === "update") {
        webDriverUpdate(function () {
        });
    } else if (command === "init") {
        try {
            getDirectoryYanatraConfig();
            console.error(chalk.red("yanatra file already exists in " + process.cwd() + ". can't initialize new yanatra dir."))
            return;
        } catch (err) {
            if (err.code !== "MODULE_NOT_FOUND") {
                console.error(err);
                return;
            }
            let fse = require('fs-extra');
            let dirTemplate = secondCmd || "boilerplate";
            try {
                let absoluteDirPath = path.join(__dirname, "example", dirTemplate);
                fse.copySync(absoluteDirPath, CWD );
                let yconfig = require(path.join(absoluteDirPath, "yanatra.js"));
                if (yconfig.suites) {
                    fse.copySync(
                        path.join(__dirname, "tests"),
                        path.getVariable(CWD, yconfig.suites, "yanatra-core")
                    );
                }
                console.log(chalk.green("initialized new yanatra dir using " + dirTemplate + " as the template!"));
            } catch (err) {
                if (err.code === "ENOENT" && err.path.indexOf(__dirname) !== -1) {
                    console.error(chalk.red(dirTemplate + " is not a directory under the example folder. can't initialize new yanatra dir."))
                } else {
                    console.error(chalk.red(err))
                }
            }
            return;
        }
    } else if (command === "debug") {
        let env = buildEnv(result.argv);
        if (!secondCmd || secondCmd === "environment" ) {
            console.log("Environment:\n", env, "\n");
        }
        if (!secondCmd || secondCmd === "actions" ) {
            getYanatraActions(env)
        }
    } else if (command === "delete-reports") {
        if (!yanatraConfig.reports ) {
            console.error(chalk.red("will only delete report directoryˆ if supplied in yanatra file!"))
            return;
        }
        if (yanatraConfig.reports.split(path.sep).length < 4) {
            console.error(chalk.red("too scared to try to delete " + config.reports))
            return;
        }
        console.log("removing " + yanatraConfig.reports);
        del(yanatraConfig.reports);
    } else {
        result.showHelp();
    }
};

const getArguments = function(config) {
    if (REQUIRED_AS_MODULE) {
        return require('yargs').argv;
    }
    var presets = (config.presets && Object.keys(config.presets)) || [];
    //TODO: write shorthand function for this message logic.
    var suitesMessage = 'default directory for yanatra to look for your scripts. ' +
        (config.suites ? chalk.green(' (default is ' + config.suites + ')') : "");
    var reportMessage = 'destination directory for the report of your tests' +
        (config.reports ? chalk.green(' (default is ' + config.reports + ')') : chalk.yellow(" (if not provided, no reports will be generated for your test)"));
    var actionsMessage = 'file that defines your own custom actions' +
        (config.actions ? chalk.green(' (default is ' + config.actions + ')') : "");
    var testMessage = 'name of report directory created on test run. defaults to your run argument or "untitled"';
    var timeoutMessage = 'number of milliseconds to wait for an element to interact with. ' +
        (config.timeout ? chalk.green(' (your config is ' + config.timeout + ' second(s))') : "");
    var result = require('yargs')
            .usage('Usage: $0 <command> [options]')
            .command('run [test]', 'test a suite or a specific script on your disk or in your suite directory, if provided.')
            .command('update', 'get the latest libs for driving your browser.')
            .command('debug  [type]', 'display debugging info for a given part of yanatra. defaults to all. choices: [actions, env].')
            .command('init  [template]',
                            'copy an example yanatra config, actions, tests etc. into the current working directory' +
                            ' as boilerplate for your own yanatra project. defaults to "boilerplate".')
        ;
    if (config.reports) {
        result
            .command('delete-reports', 'delete the reports dir as defined in your yanatra file.');
    }
    result =result.demand(1)
            .options({
                'suites': {
                demand: false,
                nargs: 1,
                describe: suitesMessage,
                type: 'string'
            },
            'actions': {
                alias: 'a',
                demand: false,
                nargs: 1,
                describe: actionsMessage,
                type: 'string'
            },
            'reports': {
                demand: false,
                nargs: 1,
                describe: reportMessage,
                type: 'string'
            },

            'timeout': {
                demand: false,
                nargs: 1,
                type: "number",
                describe: timeoutMessage
            },
            'delay': {
                demand: false,
                nargs: 1,
                describe: "the number of millisecond delays between action",
                type: "number"
            },
            'parallel': {
                demand: false,
                nargs: 1,
                describe: "the number of chrome windows to parallelize your tests in",
                type: "number"
            },
            'testName': {
                demand: false,
                nargs: 1,
                describe: "name of the test, which will be used for your report dir",
                type: 'string'
            },
            'steamroll': {
                alias: 's',
                demand: false,
                nargs: 0,
                describe: 'ignore errors in your test specs and try to run your specified test without stopping',
                type: 'boolean'
            },
            'debug': {
                demand: false,
                nargs: 0,
                describe: "drop into protractor's debug mode.",
                type: 'boolean'
            },
            'proConfig': {
                alias: 'o',
                demand: false,
                nargs: 1,
                describe: 'use your own protractor config file instead of yanatra\'s default. note: using this option will obviate most of the arguments here'
            },
            'preset': {
                alias: 'p',
                demand: false,
                nargs: 1,
                describe: 'run yanatra using default arguments that have been defined in your yanatra file',
                choices: presets
            }
        })
        .options(config.options || {})
        .example('$0 run <your dir name> -s', '')
        .help('h')
        .alias('h', 'help')
        .epilog('Copyright 2016');
    return processArguments(result);
};


const runRawTests = function(config, args) {
    var callback = function () {};
    var protractor = require('gulp-protractor').protractor;
    gulp.src(TMP_DIR + "**/*.js")
        .pipe(protractor({
            'configFile': config, // need to do yargv
            'debug': args.debug,
            'autoStartStopServer': true
        }))
        .on('error', function(e) {
            del(TMP_DIR);
            if (args.jie) {
                runScripts(args)
            }
        })
        .on('end', function() {
            del(TMP_DIR);
            if (args.jie) {
                runScripts(args)
            }
        });
};

const convertJsonToSpecs = function (specs, config, args) {
    var tap = require("gulp-tap");
    //console.log(specs);
    gulp
        .src(specs)
        .pipe(tap(function(file) {
            file.contents = Buffer.concat([
                new Buffer('require("' + __dirname + '/src/build.js").runScript("'),
                new Buffer(file.path)
            ]);
            file.contents = Buffer.concat([
                file.contents,
                new Buffer('", __dirname, __filename);')
            ]);
        }))
        .pipe(rename({
            extname: ".js"
        }))
        .pipe(gulp.dest(TMP_DIR)
            .on("end", function() {
                runRawTests(config, args);
            })
    );

};

const getSpecs = function(testfile) {
    var specs;
    var specArr = [];
    var dirSpecs = false;
    if (!yanatraConfig.suites && !testfile) {
        throw "No working/test suites directory provided, need at least one run argument!";
    } else if (yanatraConfig.suites) {
        specs = yanatraConfig.suites;
        if (testfile) {
            if (path.isAbsolute(testfile)) {
                specs = testfile;
            } else {
                specs = path.join(CWD, testfile);
            }
        }
    } else {
        if (path.isAbsolute(testfile)) {
            specs = testfile;
        } else {
            specs = path.join(CWD, testfile);
        }
    }
    specs = path.normalize(specs);
    if (!specs.endsWith(".json")) {
        specArr.push("!" + specs + "/**/{_*/,_*/**}");
        specArr.push(path.normalize(path.join(specs, "**/*.json")));
        specArr.push(path.normalize(path.join(specs, "*.json")));
    } else {
        specArr.push(specs);
    }
    return specArr;
};

const writeEnvFile = function (env) {
    var envFile = path.join(TMP_DIR, "env.json");
    process.env.E2E_ENV_FILE = envFile;
    require("mkdirp").sync(TMP_DIR);
    fs.writeFileSync(envFile, JSON.stringify(env));
};

const buildEnv = function(args) {
    var env = {};
    var testfile = args._[1];
    if ( args.preset ) {
        if (!yanatraConfig.presets[args.preset]) {
            throw args.preset + " is not a preset argument defined in" + REQUIRED_AS_MODULE ? " the arguments you're passing in" : " your yanatra file." ;
        }
        for (let key in yanatraConfig.presets[args.preset]) {
            args[key] = yanatraConfig.presets[args.preset][key];
        }
    }
    env.args = args;
    env.config = yanatraConfig;
    env.time = new Date().toLocaleString().replace(/\/|:/g, "-").replace(/\s|,/g, "_");
    if (env.args.testName) {
        env.testName = env.args.testName;
    } else if (env.args.preset) {
        // use the custom key as the test.
        env.testName = env.args.preset;
    }
    if ( testfile ) {
        if (!env.testName) {
            env.testName = "";
        }
        env.testName += "_" + path.basename(testfile, ".json");
    }
    env.reports = env.args.reports || env.config.reports;
    env.actions =  env.args.actions || env.config.actions;
    if (env.reports) {
        env.reportDir =  path.join(env.reports, (env.testName || "untitled" ),  env.time);
    }
    return env;
};

const runScripts =  function(args, callback) {
    args = args || getArguments(yanatraConfig);
    if (!args) {
        return;
    }
    var protractorConfig = path.join(__dirname, 'src/config/base.config.js');
    var testfile = args._[1];
    // for all that is good and holy, do NOT mess with the path placed here.
    del(TMP_DIR,  {force: true}).then(function() {
        writeEnvFile(buildEnv(args));
        return convertJsonToSpecs(
            getSpecs(testfile),
            protractorConfig,
            args
        );
    }).catch(function(err){
        console.log(err);
    });
};


//TODO: reduce the closures in this export, and simplify the logic here.
module.exports = (function() {
    var runModule = function(moduleDir) {
        CWD = path.normalize(moduleDir);
        runWithYanatraConfig( require(path.join(CWD, "yanatra.js") ));
    };
    var runWithYanatraConfig = function(config) {
        if (!config) return;
        var resolvePath = function ( dirPath, successMsg ) {
            if (!dirPath) {
                return false;
            } else {
                //console.log(successMsg);
            }
            if (path.isAbsolute(dirPath)) {
                return path.normalize(dirPath);
            } else {
                return path.normalize( path.join(CWD, dirPath));
            }
        };
        for (let key in config) {
            yanatraConfig[key] = config[key];
        }
        yanatraConfig.suites = resolvePath(yanatraConfig.suites);
        yanatraConfig.reports = resolvePath(yanatraConfig.reports);
        if (yanatraConfig.suites) {
            yanatraConfig.suites += path.sep;
        }
        if (yanatraConfig.reports) {
            yanatraConfig.reports += path.sep;
        }
        yanatraConfig.actions = resolvePath(yanatraConfig.actions);
        yanatraConfig.proConfig = resolvePath(yanatraConfig.proConfig);
        runScripts();
    };
    console.log(chalk.green("Yanatra", "v" + require("./package.json").version, "running") );
    if (!REQUIRED_AS_MODULE) {
        var customYanatraConfig = {};
        try {
            customYanatraConfig = getDirectoryYanatraConfig();
            console.log("Using yanatra config file in " + process.cwd());
        } catch (err) {
            if (err.code !== "MODULE_NOT_FOUND") {
                console.error("Error interpreting yanatra config file: " + err);
            }
        }
        runWithYanatraConfig(customYanatraConfig);
    } else {
        return {
            build: function(options) {

            },
            runModule,
            runWithYanatraConfig,
            runScripts,
            fireAllCylinders() {

            }
        };
    }
})();
