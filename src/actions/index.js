/**
 *
 * The building blocks of a yanatra test. Each action is identified by a name or key in the object that is generated here.
 *
 * @module actions
 * @type object
 */
"use strict"

const fs = require('fs');

const inlineExports = function(exports) {
    for ( var key in exports ) {
        if (typeof exports[key]  === "object") {
            exports[key] = exports[key][1];
        }
    }
};

const repeatExports = function (exports) {
    var repeatStep = function (obj, runtime, args, callback) {
        if (obj && Array.isArray(obj)) {
            var start;
            obj.forEach(function (step) {
                if (!start) {
                    start = callback(step, runtime, args);
                } else {
                    start = start.then(function () {
                        var promise = callback(step, runtime, args);
                        if (yanatra.env.args.delay && promise && promise.then) {
                            promise = promise.then(function() {
                                return browser.driver.sleep(yanatra.env.args.delay);
                            });
                        }
                        return promise;
                    });
                }
            });
            return start;
        } else {
            return callback(obj, runtime, args);
        }
    };
    for (var key in exports) {
        (function(){
            var originalFunc = exports[key];
            exports[key] = function (obj, runtime, args) {
                return repeatStep(obj, runtime, args, originalFunc);
            }
        })();
    }
};

const transformActions = function(exports) {
    inlineExports(exports);
    repeatExports(exports);
    return exports;
};

const combineWithCustomActions = function(exports) {
    if (yanatra.env.debugShow) {
        console.log("Built in actions available:\n", "\t", Object.keys(exports).join("\n\t"), "\n");
    }
    if (yanatra.env.actions) {
        var customActions = require(yanatra.env.actions);
        for (let key in customActions) {
            exports[key] = customActions[key];
        }
        if (yanatra.env.debugShow) {
            console.log("Custom actions:\n", "\t", Object.keys(customActions).join("\n\t"));
        }
    }
    return exports;
};

const setBaseYanatraActions = function(exports) {
    const newExports = {};
    yanatra.baseActions = exports;
    for (var key in exports) {
        newExports[key] = exports[key];
    }
    yanatra.actions = newExports;
    return newExports;
};

module.exports = transformActions(
    combineWithCustomActions(
        setBaseYanatraActions(
            require("./modules")
        )
    )
);