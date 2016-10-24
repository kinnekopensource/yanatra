/**
 *  JS snippet to be injected into the page before every step.
 */
module.exports = function () {
    if (!window.yanatraHelper) {
        var div = document.createElement('div');
        div.id = "yanatra";
        var style = document.createElement('style');
        //TODO: Re-use the inject CSS  here.
        style.innerHTML = "#yanatra { pointer-events: none; width: 175px; background: rgba(0,0,0,.75); height: 40px; position: fixed; color: white; bottom:0px; left:0px; z-index:9999999; } #yanatra small {display:block; font-size:9px;}"
        document.body.appendChild(div);
        document.body.appendChild(style);
        window.yanatraHelper = {
            setText: function (text) {
                div.innerHTML = text;
            }
        }
    }
    window.yanatraHelper.setText('#SET_TEXT#');
};