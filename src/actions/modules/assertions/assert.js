"use strict"
const util = yanatra.util,
    chalk = require("chalk"),
    // an unresolved value
    // cannot be undefined, false, or some untruthy value because that may be the value that is resolved.
    // so instead we choose a value that is unlikely to exist anywhere else except in this codebase.
    UNSET_VALUE = "QQQQQEUGENE|||||";

module.exports = function( runtime, justCheck ) {

    const check = function (checkSucceeded, message) {
        const deferred = protractor.promise.defer();
        if (runtime.retry && !checkSucceeded) {
            console.log(runtime.indent, chalk.blue("retrying " + message));
            deferred.fulfill(runtime);
        } else {
            if (!runtime.retry && !checkSucceeded) {
                console.log(chalk.yellow(runtime.indent, "Check failed but moving on: " + message));
            }
            if (checkSucceeded) {
                console.log(chalk.cyan(runtime.indent, "Check succeeded: " + message));
            }
            deferred.fulfill();
        }
        return deferred.promise;
    };

    const strictTruth = function(variable, truth){
        return util.getValue(variable).then(function(value) {
            const message = util.getName(variable) + " should be " + truth + "(It was " + value + ")";
            if (justCheck) {
                return check(variable === truth, message);
            } else {
                return since(message)
                    .expect(value).toBe(truth);
            }
        });
    };

    const truthy = function(variable, truth){
        return util.getValue(variable).then(function(value) {
            const message = util.getName(variable) + " should be " + truth + "y (It was " + value + ")";
            if (justCheck) {
                return check(!!value == truth, message);
            } else {
                var truthiness = since(
                    message
                ).expect(value);
                if (truth) {
                    return truthiness.toBeTruthy();
                } else {
                    return truthiness.toBeFalsy();
                }
            }
        });
    };

    const toBe = function (check, expectedValue, message) {
        if (justCheck) {
            return check.then(function(value) {
                return check(value === expectedValue, message);
            });
        } else {
            return since(message).expect(check).toBe(expectedValue)
        }
    };
    const self = {
        assert(obj) {
            if (obj.equal !== undefined) {
                return self.equality(obj.equal, !obj.not, obj.ifExists);
            } else if (obj.element) {
                return self.exists(obj);
            } else if (obj.toBe) {
                return strictTruth(obj, obj.toBe);
            } else if (obj.truthiness !== undefined) {
                return truthy(obj, obj.truthiness);
            }
            return true;
        },
        truthy: truthy,
        strictTruth: strictTruth,
        exists(obj) {
            const message = obj.element.selector + " element should " + (obj.not ? "NOT" : "") + " exist",
                check = util.getElement(obj.element.selector).isPresent();
            return toBe(check, message, !obj.not);
        },
        equality(arr, equal, onlyIfExists) {
            const deferred = protractor.promise.defer();
            const resolved = {
                first: UNSET_VALUE,
                second: UNSET_VALUE
            };
            const compare = function () {
                const ignore = resolved.first === undefined || resolved.second === undefined;
                if (resolved.first === UNSET_VALUE || resolved.second === UNSET_VALUE) {
                    return;
                }
                if (onlyIfExists && ignore) {
                    deferred.fulfill();
                } else {
                    let message =
                        util.getName(arr["0"]) + "(" + resolved.first + ", " + typeof resolved.first +
                        ") should" + ( equal ? " " : " NOT ") + "equal " + util.getName(arr["1"]) +
                        "(" + resolved.second + ", " + typeof resolved.second + ")";
                    if (!justCheck) {
                        since(message).
                            expect(resolved.first === resolved.second)
                            .toBe(equal);
                        deferred.fulfill();
                    } else {
                        check((resolved.first === resolved.second) === equal, message).then(deferred.fulfill);
                    }
                }
            };
            util.getValue(arr[0]).then(function (value) {
                resolved.first = value;
                compare();
            });
            util.getValue(arr[1]).then(function (value) {
                resolved.second = value;
                compare();
            });
            return deferred.promise;
        }
    };
    return self;
};
