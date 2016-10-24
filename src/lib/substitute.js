/**
 *
 * Using the keys and values in the script's context object,  or in the yanatra.rem object,
 * replace all the arguments that match the key with its delimeters. @{key}@ for yanatra.rem, #{key}# for context.
 *
 * TODO: determine if having a runtime substituion and a compile time substitution is useful or not.
 *
 * @module substitute
 * @type function
 */

"use strict";

const self = module.exports = {
    /**
     *
     * @param value {number|boolean|string}
     * @param index {number}
     * @param arr {array}
     * @param replace {string}
     * @returns {boolean}
     */
    replace: (value, index, arr, replace) => {
        if (value===undefined) return;
        // If the value to replace with is not a string, and if the string to be replaced
        // matched the search 'replace' exactly, then we'll just replace it with te value exactly.
        // Ex: looking for "dog" in a context variable with an integer value of 7,
        // we see a string "#dog#", so we replace it with the integer 7, not the string "7".
        var exactMatch = arr[index] === replace;
        var convertToNumber =  typeof value === "number" && exactMatch;
        var convertToBoolean = typeof value === "boolean" && exactMatch;
        if (convertToNumber) {
            arr[index] = +value;
            // no more substituting on this string.
            return true;
        } else if (convertToBoolean) {
            arr[index] = (arr[index].replace(replace, value) === "true");
            // no more substituting on this string.
            return true;
        } else if (typeof arr[index] === "string") {
            arr[index] = arr[index].replace(replace, value);
        }
    },

    /**
     * Context is substituted in on compile time
     * @param index {int}
     * @param arr {array}
     * @param context {object}
     */
    replaceUsingContext: ( index, arr, context ) => {
        for (let key in context) {
            if (self.replace(context[key], index, arr, "#" + key + "#")) {
                return;
            }
        }
    },
    /**
     * Rems are substituted in during runtime.
     * @param index {int}
     * @param arr {array}
     */
    replaceUsingRem: ( index, arr) =>  {
        for (let key in yanatra.rem) {
            if (self.replace(yanatra.rem[key], index, arr, "@" + key + "@")) {
                return;
            }
        }
    },
    /**
     *
     * @param index {int}
     * @param arr {array}
     * @param replaceUsing {function}
     */
    recurse: ( index, arr, replaceUsing ) => {
        var step = arr[index];
        if (typeof step === "string") {
            replaceUsing( index, arr)
        } else if (typeof step === "object") {
            for (let key in step) {
                self.recurse(key, step, replaceUsing);
            }
        }
    },
    /**
     * @param index {int}
     * @param arr {array}
     * @param context {object}
     */
    recurseOverContext(index, arr, context) {
        self.recurse(index, arr, (index,arr) => {
            self.replaceUsingContext(index,arr, context);
        });
    },
    /**
     * @param index {int}
     * @param arr {array}
     */
    recurseOverRem(index, arr) {
        self.recurse(index, arr, self.replaceUsingRem);
    }
};