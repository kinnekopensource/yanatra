"use strict";

module.exports = {
    check(obj, runtime) {
        return require("./assert")(runtime, true).assert(obj);
    }
};