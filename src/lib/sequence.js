/**
 * Compiles and runs all the steps in a yanatra's script sequence.
 *
 * @module sequence
 * @type function
 */

"use strict";

const actions = yanatra.actions,
     stringify = require('node-stringify'),
     browserHelper = require("./browserHelper.js"),
     substitute = require("./substitute.js"),
     chalk = require("chalk");

/**
 * Check if an action with the passed in name exists
 * @param key {string}
 */
const checkAction = function(key)  {
    if (!actions[key]) {
        throw "Could not find action: " + key + "!"
    }
};

const enableRunManip = function(options, runtime, nextStep, tryAgain, stepIndex) {
    if (!options) {
        return;
    }
    //TODO: nested retries or skips break the constructed steps!. Fix that!
    if (options.retry) {
        runtime.retry = function (childRuntime) {
            if (options.retry <= 0) {
                console.error(childRuntime.indent + chalk.red("Exhausted retries for " +
                        runtime.src));
                return nextStep();
            }
            console.log(
                childRuntime.indent,
                "Check failed in step ", stepIndex, '@', childRuntime.subscriptSrc);
            console.log(
                runtime.indent,
                chalk.cyan(options.retry + " tries remaining "), "for", runtime.subscriptSrc);
            options.retry--;
            return tryAgain();
        };
    } else if (options.skip_on_check_fail) {
        runtime.retry = function (childRuntime) {
            console.log(
                childRuntime.indent,
                "Check failed in step ", stepIndex, '@', childRuntime.subscriptSrc);
            console.log(
                runtime.indent,
                chalk.yellow("Skipping " + childRuntime.subscriptSrc + " and proceeding with next step in " + runtime.subscriptSrc)
            );
            return nextStep();
        }
    }
};

const stepFinished = function(step, index, arr, name, runtime, actionName) {
    var arg = step[actionName];
    var go = function() {
        return queueStep(arr[index], index, arr, name, runtime);
    };
    var nextStep = runtime.nextStep = function() {
        return browser.driver.sleep(yanatra.env.args.delay || 0).then(function() {
            index++;
            return go();
        });
    };
    var argp = [arg];
    substitute.recurseOverRem(0, argp);
    var options = argp[0];
    if (actionName === "run") {
        enableRunManip(options, runtime, nextStep, go, index);
    }
    var acted = actions[actionName](argp[0], runtime, step);
    if (!acted) {
        return browser.driver.sleep(0);
    }
    return acted.then(function (childRuntime) {
        if (runtime.root.finished) {
            return;
        }
        if (childRuntime) {
            if (!childRuntime || !childRuntime.retry) {
                return nextStep();
            }
            return childRuntime.retry(childRuntime);
        }
        return nextStep();
    });
};

const queueStep = function (step, index, arr, name, runtime) {
    if (!step) {
        return;
    }
    if (typeof step === "string") {
        arr[index] = {};
        arr[index][step] = undefined;
        step = arr[index];
    }
    for (var actionName in step) {
        if (actionName === "end") {
            runtime.finished = true;
            console.log("test finished");
            return;
        }
        checkAction(actionName);
        break;
    }
    return browser.executeScript(
        "(" +
            stringify(browserHelper)
                .replace(
                '#SET_TEXT#',
                "<small>" + name + "</small>" + actionName
                //+ ":  " +
                //(step[actionName] || JSON.stringify(step[actionName]))
            ) +
        ")()"
    ).then((function() {
            return stepFinished(step,index,arr,name,runtime, actionName);
        })
    );
};

const build = function(arr, name, runtime) {
    return queueStep(arr[0], 0, arr, name, runtime);
};

module.exports = function(name, arr, next, runtime) {
    var context = runtime.context || {};
    arr.forEach(function(step, index, arr) {
        substitute.recurseOverContext(index,arr,context);
    });
    var nextStep;
    if (arr.length > 0) {
        nextStep = build(arr, name, runtime);
    }
    if (!next) {
        next = nextStep
    } else {
        next = next.then(nextStep);
    }
    return next;
}