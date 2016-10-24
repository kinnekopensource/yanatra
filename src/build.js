"use strict";
/**
 * Initiates and compiles the spec's scripts and all of its subscripts.
 */

require("./setup.js");
const actions = yanatra.actions,
    path = require("path"),
    chalk = require("chalk"),
    fs = require('fs');

const self = module.exports = {
    runScript(scriptJsonSrc, dirname, filename) {
        dirname = path.dirname(scriptJsonSrc);
        const name = path.basename(filename, ".js"),
            dirnames = dirname.split(path.sep);
        describe( dirnames[dirnames.length - 1] +  " suite: " +  name, function () {
            // test cases in suites cannot be split up without breaking the spec.
            // therefore, every test suite in jasmine is comprosed of a single test case, which is the spec.
            it( name , function() {
                return self.startSpec(scriptJsonSrc, dirname, filename);
            });
        });
    },
    buildRuntime(scriptJsonSrc, dirname, filename) {
        var script = require(scriptJsonSrc);
        var runtime = {
            src: scriptJsonSrc,
            subscriptSrc: path.basename(scriptJsonSrc),
            dirname: dirname,
            currentSpecName: path.basename(filename, ".js"),
            cwd: path.dirname(scriptJsonSrc),
            indent: "",
            context: script.context || {}
        };
        runtime.root = runtime;
        // store the time of the test as a context variable so it can be used for such sequences like
        // registering a new user.
        // Example:
        // { "type": { "name": "username", "keys": "#time#@gmail.com" } }
        runtime.context.time = Date.now();
        runtime.context.timeStr = runtime.context.time+"";
        return runtime;
    },
    startSpec(scriptJsonSrc, dirname, filename) {
        const deferred = protractor.promise.defer(),
            sequence = require(scriptJsonSrc).sequence,
            runtime = self.buildRuntime(scriptJsonSrc, dirname, filename);
        yanatra.env.currentSpecName = runtime.currentSpecName;
        // Add a fake "end" action to the top level yanatra sequence to indicate the test should
        // terminate. Used only in retry logic situations.
        sequence.push({
            "end": undefined
        });
        self.buildSequence(
            runtime.currentSpecName,
            sequence,
            actions.init(false, runtime), // the init action is always the first action to start with.
            runtime
        ).then(deferred.fulfill);
        return deferred.promise;
    },
    buildSequence: require("./lib/sequence.js"),
    runSubscript: require("./lib/subscript.js")
};