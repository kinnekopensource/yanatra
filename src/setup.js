/**
 * All the required modules Yanatra needs before it can build and run a spec.
 */

require('jasmine2-custom-message');
require('proquery');
global.yanatra = {
    util: require("./lib/util.js"),
    rem: {},
    env: require(process.env.E2E_ENV_FILE)
};
require("./actions");