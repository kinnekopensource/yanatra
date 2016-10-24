/**
 *
 * Helper object for functions and variables that are shared between actions.
 *
 * @module Util
 * @type object
 */

"use strict";

const bd = browser.driver,
    timeKeeper={},
    path = require("path"),
    nutil = require("util");

const first = function(post$) {
    return (post$.first ? post$.first() : post$ )
};

const filterByAttr = function(post$, attrName, attrValue, child) {
    var getBy = function( ) {
        if (["value", "attr"].indexOf(attrName) === -1) {
            return by[attrName](attrValue);
        } else {
            if (attrName === "value") {
                return by.css(nutil.format('[%s="%s"]', "value", attrValue));
            } else {
                var key;
                for (key in attrValue) {
                    break;
                }
                return by.css(nutil.format('[%s="%s"]', key, attrValue[key]));
            }
        }
    };
    if (!post$) {
        return element.all(getBy());
    }
    if (child) {
        return post$.first().all(getBy());
    }
    return post$.filter(function(elem, index) {
        return elem.getAttribute(attrName).then(function(resolvedValue) {
            return resolvedValue === attrValue;
        });
    });
};

const resolveElement = function(obj, post$, child) {
    var filter = function( key ) {
        if (obj[key]) {
            post$ = filterByAttr(post$, key, obj[key], child);
            child = false;
        }
    };
    if (typeof obj === "string") {
        post$ = $(obj);
    } else {
        if (obj.css) {
            post$ = element.all(by.css(obj.css));
        }
        filter("tagName");
        filter("attr");
        filter("model");
        filter("value");
        filter("name");
        if (obj.child) {
            post$ = resolveElement(obj.child, post$, true);
        }
    }
    return post$;
};

const util = module.exports = {
    waitError( args, tryAgain, el$ ) {
        return function(err) {
            if (args) {
                if (args.retry > 0) {
                    args.retry--;
                    return tryAgain();
                }
                if (args.skip) {
                    return browser.driver.sleep(0);
                }
            }
            throw (err);
        };
    },
    waitReadyHandle(el$, args, callback) {
        var repeat = function() {
            return el$.waitReady().then(
                callback,
                util.waitError(args, repeat, el$)
            )
        };
        return repeat();
    },

    log(msg) {
        if (!yanatra.env.args.steamroll) {
            console.log(msg);
        }
    },

    copy(obj) {
        return JSON.parse(JSON.stringify(obj,function(key, value) {
            if (key === "nextSteps" || key === "root") {
                return;
            }
            return value;
        }));
    },

    /**
     *
     * Get an element from the page using a string or an object.
     * This simplifies the protractor syntax and helps in cases where $() fails.
     *
     * Filtering using multiple attributes is useful when the element in question
     * cannot be located using a unique ID, className etc.
     *
     *
     * @param element {object|string}
     * @param [element.css] {string} - a document.querySelectorAll-friendly selector
     * @param [element.value] {string} - the value of the "value" attribute
     * @param [element.model] {string} - the value of the "ng-model" attribute
     * @param [element.tagName] {string} - the tag name of the element to find
     * @param [element.name] {string} - the value of the "name" attribute
     * @param [element.attr] {object} - the key is the name of the custom attribute  to match with, e.g. "ng-click". the value of the key is the value of the custom attribute, e.g. "view.toggleButton()"
     * @param [element.child] {object} - out of all the matching element sets, look underneath each one for a child element that matches another {@link getElement}
     * @returns {ElementFinder}
     */
    getElement( element ) {
        return first(resolveElement(element));
    },
    iterateOverEndpoints(urls, callback, time) {
        var next;
        urls.forEach(function( url, i ) {
            var load = function() {
                browser.driver.get( url );
            };
            var then = function() {
                browser.executeScript(function() {
                    return document.body.innerHTML;
                }).then(function( result ) {
                    var json = JSON.parse(result);
                    callback(json, i);
                    return browser.driver.sleep( time || 100);
                });
            };
            if ( !next ) {
                load();
                next = util.urlwait(false, true).then(then);
            } else {
                next = next.then(function() {
                    load();
                    return util.urlwait(false, true).then(then);
                });
            }
        });
        return next;
    },
    urlwait( callback, hideStats ) {
        util.timer.start("urlwait");
        return bd.wait(function() {
            return bd.getCurrentUrl().then(function( url ) { // Always must return true
                if (callback) {
                    return callback(url);
                }
                if (!hideStats) {
                    util.log(url);
                    util.timer.end("urlwait", url);
                }
                return true;
            });
        });
    },
    timer: {
        start: function( e ) {
            timeKeeper[e] = new Date().getTime();
        },
        end: function( e, eName ) {
            util.log("Took " + e  +  " " + (eName ? eName + " " : "")  + (new Date().getTime() - timeKeeper[e]) + "ms");
        }
    },


    // TODO: figure out how to simplify the resolving the values of variables.
    getValue(resolve) {
        var deferred = protractor.promise.defer();
        var handlePrimitives = function (first) {
            var prim = function(key) {
                return first[key] !== undefined ? first[key] : first;
            };
            first = prim("string");
            first = prim("boolean");
            first = prim("number");
            if (typeof first === "string") {
                browser.executeScript("window").then(function () {
                    deferred.fulfill(first);
                });
                return true;
            } else if (typeof first === "number") {
                browser.executeScript("window").then(function () {
                    deferred.fulfill(first);
                });
                return true;
            } else if (typeof first === "boolean") {
                browser.executeScript("window").then(function () {
                    deferred.fulfill(first);
                });
                return true;
            }
            return false;
        }
        if (!handlePrimitives(resolve)) {
            if (resolve.var !== undefined) {
                browser.executeScript("return " + resolve.var).then(deferred.fulfill);
            } else {
                var el$;
                if (resolve.css) {
                    el$ = $(resolve.css);
                } else if (resolve.model) {
                    el$ = element.all(protractor.By.model(resolve.model)).first();
                } else if (resolve.binding) {
                    el$ = element.all(protractor.By.binding(resolve.binding)).first();
                }
                if (!el$) {
                    el$ = $("body");
                }
                el$.evaluate(resolve.expression || resolve.binding || resolve.model).then(deferred.fulfill);
            }
        }
        return deferred.promise;
    },
    getName(variable) {
        return variable.var ||
            variable.string ||
            variable.boolean ||
            variable.expression ||
            variable.model ||
            variable.binding ||
            variable;
    },
    isAbsolute(pathName) {
        return path.resolve(pathName) === path.normalize(pathName)
    }


};