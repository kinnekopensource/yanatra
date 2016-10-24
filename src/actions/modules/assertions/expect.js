/**
 *
 * Jasmine expectations for testing facets of the browser's current state..
 *
 * TODO: Make a sensible expectation structure, implement the rest of expectations and add documentation.
 *
 * @module expect
 * @type object
 */

const util = yanatra.util;

const assert = function(runtime) {
    return require("./assert")(runtime);
};

const expect = function ( obj, runtime ) {
    return assert(runtime).assert(obj);
};

const expectDisplay = function(element, displayed) {
    return since(element + " is " + (displayed ? "visible": "hidden")).expect(
        (util.getElement(element)).isDisplayed()
    ).toBe(displayed);
};


module.exports = {
    /**
     *
     * @param element
     */
    expectVisible(element) {
        return expectDisplay(element, true);
    },

    /**
     *
     * @param element
     */
    expectHidden(element) {
        return expectDisplay(element, false);
    },

    /**
     *
     * @param arr
     * @param runtime
     */
    expectEquality(arr, runtime){
        return assert(runtime).equality(arr, true, undefined);
    },

    /**
     *
     * @param arr
     * @param runtime
     */
    expectEqualityIfExists(arr, runtime){
        return assert(runtime).equality(arr, true, true);
    },

    /**
     *
     * @param arr
     * @param runtime
     */
    expectInequality(arr, runtime){
        return assert(runtime).equality(arr, false, undefined);
    },

    /**
     *
     * @param obj
     */
    expectFalse(obj) {
        obj.toBe = false;
        return expect(obj);
    },

    /**
     *
     * @param obj
     */
    expectTrue(obj) {
        obj.toBe = true;
        return expect(obj);
    },

    /**
     *
     * @param hash
     * @param runtime
     */
    expectLocationHash(hash, runtime) {
        return expect({
                "equal": [
                    hash,
                    {"var": "window.location.hash"}
                ]
            }, runtime
        );
    },

    /**
     *
     * @param path
     * @param runtime
     */
    expectPath(path, runtime) {
        return expect({
                "equal": [
                    path,
                    {"var": "window.location.pathname"}
                ]
            }, runtime
        );
    },
    expect: expect
};