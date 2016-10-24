if (window.yanatraHelper) {
  window.yanatraHelper.start();
  return;
}

var createActionDisplay = function() {
  var helperHTML = document.createElement('div');
  document.body.appendChild(helperHTML);
  helperHTML.innerHTML = `
  <div style='position: fixed;
              left:0px;
              bottom:0px;
              white-space: nowrap;
              overflow:hidden;
              z-index:999999999;
              width:100%;'
       id='actionContainer'
  >
  </div>
`;
  var actionContainer = document.getElementById('actionContainer');
  var stopped = false;
  return {
    stop: function() {
      [...document.getElementsByClassName("yanatra-action")].forEach(function(el) {
        el.parentNode.removeChild(el);
      });
      stopped = true;
    },
    start: function() {
      stopped = false;
    },
    addError: function( error ) {
      this.addAction(error, "#FB780E", "rgba(105,51,7,.75)");
    },
    addAction: function(message, highlight, color) {
      if (stopped) return;
      highlight = highlight || "#40fb05";
      color = color || "rgba(0,0,0,75)";
      var action = document.createElement('div');
      action.style.display='inline-block';
      action.innerHTML = `
        <div
         class='yanatra-action'
         style='
        padding:5px;
        transition: opacity 1s, max-width 1s, background-color 1s;
        font-size:10px;
        max-width:0px;
        height: 40px;
        overflow: hidden;
        display:inline-block;
        background-color: ` + highlight + `;
        color: white;
        margin:10px;'>
       ` + message + `
        </div>
      `;
      if (action.childElementCount > 0) {
        actionContainer.insertBefore(
            action,
            actionContainer.firstElementChild
        );
      } else {
        actionContainer.appendChild(
            action
        );
      }
      setTimeout(function() {
        action.firstElementChild.style.backgroundColor = color;
        action.firstElementChild.style.maxWidth = "300px";
      }, 50);
      setTimeout(function() {
        if (action.firstElementChild) action.firstElementChild.style.opacity = 0;
        setTimeout(function() {
          action.parentNode.removeChild(action);
        }, 1000);
      }, 10000);
    }
  }
};

var actionDisplay = window.yanatraChrome = createActionDisplay();
/**
* Module dependencies.
*/

var cssPath = require('stevenmiller888/component-path');
var each = require('component/each');
var fmt  = require('yields/fmt');

/**
 * Events and elements.
 */

detect('click');
detect('keyup');
detect('copy');
/**
 * Detect.
 *
 * @param {String} listener
 */
var debouncer;
var lastEventTarget;
var lastTime = Date.now();
function detect(listener){
  if (listener === 'copy') return copyText();

  var els = document.querySelectorAll('body');
  each(els, function(el){
    el.addEventListener(listener, function(event) {
      if (listener === 'click') handle('click', event.target); // such code rot...
      if (listener === 'keyup') {
        if (lastEventTarget === event.target) {
          clearTimeout(debouncer);
        }

        lastEventTarget = event.target;
        (function() {
          var node=event.target;
          debouncer = setTimeout(function() {
            if (node.value === null) return;
            handle('type', node);
          }, 1000);
        })();
      }
    });
  });
};

/**
* Copy text.
*/

function copyText(){
  window.onkeydown = function(event){
    if (event.keyCode === 67 && event.ctrlKey) {
      var selObj = window.getSelection();
      handle('evaluate', selObj.focusNode);
    }
  };
};

function debugMessage(message) {

};

/**
 * Handle.
 *
 * @param {String} event
 * @param {Node} node
 */

function handle(event, node) {
  if (chrome && chrome.runtime) {
    var getAttribute = function( attr, node ) {
      if (node.getAttribute(attr)) {
        path = node.tagName.toLowerCase() + "["+ attr + "=\"" + node.getAttribute(attr) +  "\"]";
        return path;
      }
      return;
    };
    var resolve = function(arr,node){
      var result;
      arr.some(function ( value ) {
        result = getAttribute(value, node);
        if (result) {
          return true;
        }
      });
      return result;
    };
    lastTime = Date.now();
    var name = node.getAttribute("name");
    var path = "";
    if (!node.id) {
      path = resolve(["ng-click", "ng-change", "ng-options", "name", "onclick", "href", "value", "type"], node);
      if (!path) {
        path = resolve(["ng-click", "ng-change", "ng-options", "name", "onclick", "href", "value", "type"], node.parentNode);
        if (path) {
          path += " " + (resolve(["label", "value"], node) || "");
        } else {
          //return;
          path = cssPath(node);
          if (path.indexOf("ng-") !== -1) {
            actionDisplay.addError("not a real action");
            return;
          }
        }
      }
    } else {
      path = "#" + node.id;
    }
    var elapsed = Date.now() - lastTime;
    if (elapsed > 5000) {
      chrome.runtime.sendMessage(["wait", false, elapsed / 5]);
    }
    var model;
      model = node.getAttribute("ng-model");
    var value = event !== "click" || node.tagName.toLowerCase() !== "checkbox"
        ? (node.value || node.getAttribute("checkvalue")) : false;
    var message = [event, path, value, model, name];
    if (event === "type" && value === null) {
      return;
    }
    actionDisplay.addAction([event, value]);
    console.log(message);
    chrome.runtime.sendMessage(message);
  }
};
