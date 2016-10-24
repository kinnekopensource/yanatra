/**
 *
 * Compiles and runs a script inside of a yanatra script sequence.
 *
 * @module subscript
 * @type function
 */

"use strict";

const path = require("path"),
    chalk = require("chalk"),
    sequenceBuilder = require("./sequence"),
    util = yanatra.util;

//merge the attributes of b into a that a does not have
//this means a is superior to b
const mergeContext = function(a, b) {
    if (b) {
        if (typeof b === 'string' || typeof a === 'string') {
            throw "Context cannot be a string. Script " +
            (runtime.subscriptPath || runtime.src) +
            " tried to run " + subscriptPath +
            " with an invalid context"
        }
        for (let key in b) {
            if (!a[key]) {
                a[key] = b[key];
            }
        }
    }
    return a;
};


const buildSubscript = function(childContext, runtime, subscript, resolvedSubscript) {
    var sequence = util.copy(resolvedSubscript.sequence);
    var childRuntime = util.copy(runtime);
    if (!childContext) {
        childContext = {};
    }
    // note that the context that is set in the run action
    // takes priority over the parent
    // the context of the run command comes first, followed by the context of the parent script, followed
    // by the context of the sub script.
    mergeContext(childContext, mergeContext(util.copy(runtime.context), resolvedSubscript.context));
    // the cwd of the spec is now the directory containing the subscript
    childRuntime.cwd = path.dirname(subscript.path);
    childRuntime.subscriptSrc = subscript.script;
    childRuntime.subscriptPath = subscript.path;
    childRuntime.root = runtime.root;
    childRuntime.indent += "\t";
    childRuntime.context = childContext;
    childRuntime.retry = runtime.retry; // always use the parent retry as the default, if it exists.
    return sequenceBuilder(
        subscript.script,
        sequence,
        false,
        childRuntime
    );
};

module.exports = function(subscript, runtime) {
    var prevSubscripted = null;
    var resolvedSubscript = null;
    var buildSubscriptWithContext = function(childContext) {
        var subscripted = buildSubscript(childContext, runtime, subscript, resolvedSubscript);
        if (prevSubscripted) {
            prevSubscripted = prevSubscripted.then(subscripted);
        } else {
            prevSubscripted = subscripted;
        }
    };
    if (typeof subscript !== "object") {
        subscript = {
            script: subscript
        };
    }
    subscript.path =
        path.normalize(
            path.join( util.isAbsolute(subscript.script) ? "" : runtime.cwd, subscript.script + ".json")
        );
    try {
        resolvedSubscript = require(subscript.path);
    } catch(w) {
        throw "'Error loading subscript '" + subscript.script + "' using path '" + subscript.path + "' declared in " + runtime.cwd + ". Error Message is:" + w;
    }
    // build the subscript, an array of contexts implies that the same script should be run with the same context multiple times.
    if (Array.isArray(subscript.context)) {
        subscript.context.forEach(buildSubscriptWithContext)
    } else {
        buildSubscriptWithContext(subscript.context)
    }
    return prevSubscripted;
};
