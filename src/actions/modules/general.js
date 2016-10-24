/**
 * The basic building blocks of a yanatra script.
 * All actions should return a protractor {promise}
 *
 * @module general
 * @type object
 */

"use strict";

const util = require("../../lib/util.js"),
    chalk = require("chalk"),
    stringify = require('node-stringify'),
    path = require('path');

const executeScript = function( func, args )  {
    return browser.driver.executeScript(
        "return " + stringify(func) + "(" + args + ")"
    );
};

var screenshotCount = 1;

module.exports = {

    /**
     * The first step of a spec which ought to be overridden with an init() in your own custom actions module.
     */
    init() {
        return module.exports.skip();
    },

    /**
     * Go to a given url.
     * If the url is relative, protractor will append that url to the baseUrl that was declared in your yanatra file
     * or in your command line.
     *
     * @example
     * {
     *      "goto": "www.google.com"
     * }
     * @param url {string} the relative or absolute url to go to.
     *
     */
    goto(url) {
        browser.get(url);
        return util.urlwait();
    },

    /**
     * Calls the goto action.
     */
    get(url) {
        return yanatra.actions.goto(url);
    },

    /**
     * Scroll the page using the window's scroll bars.
     *
     * @example
     * // scroll down
     * {
     *      "scrollTo": 500
     * }
     *
     * @param scroll {number} 'Y' position on the page to scroll to.
     */
    scrollTo(scroll) {
        browser.sleep(1000);
        return browser.executeScript('window.scrollTo(0,' + scroll + ')')
    },

    /**
     * Disable angularJS synchronization for non-angular pages.
     * Will break certain actions that use angular specific syntax
     *
     * @example
     * [
     *    "ignoreSync",
     *    {
     *       "goto": "http://www.google.com"
     *    }
     * ]
     *
     */
    ignoreSync() {
        browser.ignoreSynchronization = true;
        return browser.driver.sleep(0);
    },

    /**
     * Upload an file on your system to your website.
     *
     * @example
     * {
     *      "upload": "../somepath/to/image/image.png"
     * }
     *
     * @param filepath {string} the relative (to the current subscript) or absolute path to the file.
     *
     */
    upload(filepath, runtime) {
        var expandTilde = require('expand-tilde');
        var fileToUpload = filepath;
        var absolutePath;
        if (fileToUpload.indexOf("/") === 0) {
            absolutePath = fileToUpload;
        } else if (fileToUpload.indexOf("~")===0) {
            absolutePath = expandTilde(fileToUpload);
        } else {
            absolutePath = path.normalize(path.join(path.dirname(runtime.src), fileToUpload ));
        }
        //ya'll better exist!!'
        require('fs').statSync(absolutePath)
        return element.all(by.css('input[type="file"]')).first().sendKeys(absolutePath).then(function() {
            return browser.driver.sleep( 5000 );
        });
    },

    /**
     * Choose an option in a select element.
     *
     * @param obj {object} See {@link ../lib.md#getElement}
     * @param [obj.text] {object} if 'obj.css' and 'obj.text' is present, the option will be located using by.cssContainingText.
     * @param obj.value {object} if 'obj.text' or 'obj.css' is not present, the element will be located using a child option with a matching value
     */
    selectOption(obj) {
        if (obj.css && obj.text) {
            return element(by.cssContainingText(obj.css + " option", obj.text)).click();
        } else {
            if (!obj.child) obj.child = {};
            obj.child.value = obj.value;
            delete obj.value;
            return util.getElement(obj).click();
        }
    },

    /**
     * Click on an element. Will wait for the element to become active and then try repeatedly to click on it.
     * By default, if an element is unclickable, yanatra will try again 3 more times (i.e., "retry": 3)
     *
     * @example
     * // click on the the element that matches the selector "button.some-class"
     * {
     *   "click": "button.some-class"
     * }
     *
     * @example
     * //click on the element with the id "buttonThatMayNotBeHere"
     * //skip if that element is not present, visible, or clickable.
     * {
     *   "click": "#buttonThatMayNotBeHere",
     *   "skip": true
     * }
     *
     * @example
     * // click on the element with the id "buttonMayTakeAWhile"
     * // if the element is unclickable, try again ten more times.
     * // skip if all attempts to click on it failed
     * {
     *   "click": {
     *      "attr": {
     *          "ng-click": "view.triggerEvent()"
     *      }
     *   },
     *   "retry": 10,
     *   "skip": true
     * }
     *
     * @param obj {object} {@link getElement}
     * @param [obj.force] {boolean} if the element should be clicked using document.querySelectorAll instead of selenium.
     * @param [args.skip] {boolean} if true, skip if the button could not be clicked after all (or none) retries have been exhausted.
     * @param [args.retry=3] {boolean} if true and if the button could not be clicked, wait and retry clicking the button
     */
     click(obj, runtime, args) {
        var el$ = util.getElement(obj);
        if (!args) args = {};
        if (args.retry === undefined) args.retry = 3;
        //TODO: clean up how waitReady and retries work together;
        return util.waitReadyHandle(el$, args, function () {
            return el$.click().then(function () {
                    return true;
                }, function (err) {
                    if (obj.force) {
                        return browser.driver.executeScript("document.querySelectorAll('" + obj.css + "')[0].click()");
                    }
                    //weird protractor error where something gets clicked
                    // but an error is somehow thrown.
                    if (err.name === 'ElementNotVisibleError') {
                        return true;
                    }
                    // sometimes an element is not clickable so we have to wait.
                    return util.waitError(args, function () {
                        return browser.driver.sleep(2000).then(function() {
                            return yanatra.baseActions.click(obj, runtime, args);
                        })
                    })(err);
                }
            );
        });
    },

    /**
     * Shorthand for clicking a page submit button.
     */
    submit() {
        return module.exports.click("button[type='submit']")
    },

    /**
     * Type keys into an element, normally an input field or text area.
     *
     * @example
     * // type the phrase "The wizard huffed and puffed and then exploded" in the element with the id "someInputElement"
     * {
     *      "type": {
     *          "css": "#someInputElement",
     *          "keys": "The wizard huffed and puffed and then exploded"
     *      }
     * }
     *
     * @example
     * // try to type the phrase "the fat fox jumps over the slow dog" into the first text area.
     * // skip if the textarea is unable to accept text input.
     * {
     *      "type": {
     *          "css": "textarea",
     *          "keys": "the fat fox jumps over the slow dog"
     *      },
     *      "skip": true
     * }
     *
     * @example
     * // try to type the string "1234567890" into the element with the ng-model "view.form.id"
     * // if the element is unable to accept input, retry 10 times before failing the spec.
     * {
     *      "type": {
     *          "model": "view.form.id",
     *          "keys": "1234567890"
     *      },
     *      "retry": 10
     * }
     *
     * @param obj {object} See {@link getElement}
     * @param obj.keys {string} The string of keys to send into the element
     * @param [obj.clear] {boolean} if true, the input field should be cleared of any characters before sending the keys.
     * @param [args.skip] {boolean} if true, skip if the element is not visible and ready after the normal timeout.
     * @param [args.retry] {boolean} if true and if the button could not be clicked, wait and retry clicking the button
     */
    type(obj, runtime, args) {
        var keys = obj.keys;
        var clear = obj.clear;
        var el$ = util.getElement(obj);
        return util.waitReadyHandle(el$, args, function() {
            if (clear) {
                el$.clear().then(function () {
                    return el$.sendKeys(keys);
                });
            } else {
                return el$.sendKeys(keys);
            }
        });
    },

    /**
     * Do nothing for a certain period of time.
     *
     * @param time {number} the length of time in milliseconds to do nothing for.
     *
     */
    sleep(time) {
        return browser.driver.sleep(time);
    },

    /**
     * Wait for an element to be visible and present on the page.
     *
     * This action is automatically ran for click, type and other element interactions.
     *
     * @example
     * {
     *      "waitForElement": "#anElement"
     * }
     *
     * @param el {string|object} {@link getElement }
     */
    waitForElement(el, runtime, args) {
        return util.waitReadyHandle(
                util.getElement(el),
                args
        );
    },

    /**
     * Run a subscript relative to the currently executing script's directory.
     *
     * @param script {string|object} the path to the script to be run, or an object with special configuration
     * @param script.script {string} the path to the script to be run.
     * @param script.context {object} a key/value object of substitutions to be used for the subscript and its children.
     * @param script.skip_on_check_fail {boolean}
     * @param script.retry {int}
     */
    run(script, runtime) {
        var build  = require("../../build.js");
        return build.runSubscript(script, runtime);
    },

    /**
     * Take a screenshot of the page as it appears in the browser window.
     * Will only be stored if a reportDir is defined for the running specs.
     *
     * @param [name] {string} a name for the screenshot, e.g. "cow" which will then be saved as "cow.png". if none is provided, the default is the current screenshotNumber.
     */
    screenshot(name, runtime) {
        var deferred = protractor.promise.defer();
        browser.takeScreenshot().then(function (png) {
            var base64Data = png.replace(/^data:image\/png;base64,/, "");
            name = name || screenshotCount++;
            if (!yanatra.env.reportDir) {
                console.log(chalk.yellow(name, ".png not saved because no report dir was provided"));
                deferred.fulfill();
                return;
            }
            var screenshotDir = yanatra.env.reportDir + "/screenshots/" + runtime.currentSpecName + "/";
            require("mkdirp")(screenshotDir, function (err) {
                if (err) {
                    since(function() {
                        return screenshotDir + " directory could not be made ! (" + err  + ")";
                    }).expect(err).toBeFalsy();
                    deferred.fulfill();
                    return;
                }
                try {
                    require("fs").writeFileSync(screenshotDir + name + ".png", base64Data, 'base64');
                } catch (e) {
                    throw name + ".png could not be written! (" + err + ")";
                }
                deferred.fulfill()

            });
        });

        return deferred.promise;
    },

    /**
     * Do nothing and return a promise to move onto the next action.
     */
    skip() {
        return browser.driver.sleep(0);
    },

    /**
     * Execute custom javascript directly onto the page.
     * @param script {string} the raw JS string to be executed, e.g. "alert('hi');"
     */
    execute(script) {
        return browser.executeScript(script);
    },

    /**
     * Store the value of a variable, angular expression or otherwise for later use
     * in the current spec's runtime. This key and its value will only be availabe to the current spec, not
     * other specs or their subscripts, and will not be stored after the spec has completed.
     *
     * @param obj {object} See {@link getValue}
     * @param obj.@ {string}
     */
    remember(obj) {
        var alias = obj["@"];
        return util.getValue(obj).then(function(value){
            yanatra.rem[alias] = value;
            return true;
        });
    },

    /**
     * Print the value of a variable, angular expression or otherwise in the console.
     *
     * @example
     * // log a variable that was stored with the "remember" action
     * {
     *      "log": "@rememberedVar@"
     * }
     *
     * @example
     * // log a variable in your context
     * {
     *      "log": "#contextVar#"
     * }
     *
     * @example
     * // execute a script on the page and print out its value
     * {
     *      "log": {
     *          "var": "window.getCurrentUser()"
     *      }
     * }
     *
     * @param variable {object} see getValue {@link ../lib.md#getValue}
     */
    log(variable, runtime) {
        return util.getValue(variable).then(function(value){
            var name = util.getName(variable);
            console.log( runtime.indent, chalk.gray("log:"), value);
            return true;
        });
    },

    /**
     * Inject a CSS string like "body { background: red }" onto the page  to change styling.
     *
     * @example
     * {
     *      "injectCSS": "body { background: red; }"
     * }
     *
     * TODO: recognize when the css string passed in starts with "../" or a "/" or a "/" and use its file contents as the string to inject.
     *
     * @param css
     */
    injectCSS: function(css) {
        return executeScript(function(css) {
            var style = document.createElement("style");
            style.innerHTML = css;
            document.body.appendChild(style)
        }, "'" + css + "'");
    },

    /**
     * Pauses the protractor, enables the protractor debugger in terminal, and usage of the developer toolbar in your browser.
     */
    pause: function() {
        console.log(
            chalk.cyan(
                "Welcome to debug mode! Read the instructions below!"
            )
        );
        browser.pause();
    },

    /**
     * Calls the pause action.
     */
    debug: function() {
        yanatra.actions.pause();
    }
};
