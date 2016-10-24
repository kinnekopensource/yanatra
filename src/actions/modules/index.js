"use strict";

const exportList = [
    "./general",
    "./assertions/expect",
    "./assertions/check"
];

/**
 * Iterate over each module and copy their actions into the top-level actions object.
 *
 * Note that an action with the same name/key as a previous module will override that module's action when merging in.
 *
 * @param otherModules
 * @returns object
 */
const combineExports = (otherModules) => {
    var exports = {};
    otherModules.forEach((otherModule) => {
        for (let key in require(otherModule)) {
            exports[key] = require(otherModule)[key];
        }
    });
    return exports;
};

module.exports = combineExports(
    exportList
);
