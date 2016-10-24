
/**
 * Module dependencies.
 */

var Emitter = require('component/emitter');
var uid  = require('matthewmueller/uid');
var recorder = require('./recorder')();
var each = require('component/each');
var os = require('component/os');
var fmt = require('yields/fmt');

/**
 * Expose `Daydream`.
 */

module.exports = Daydream;

/**
 * Daydream.
 */

function Daydream(){
  if (!(this instanceof Daydream)) return new Daydream();
  this.isRunning = false;
}

/**
 * Boot.
 */

Daydream.prototype.boot = function(){
  var self = this;
  var add = function(tab) {
    var go = function () {
      recorder.startRecording();
      self.isRunning = true;
    };
    var fastRestart = function (request, sender, sendResponse) {
      var message = request;
      chrome.browserAction.setPopup({ popup: '' });
      chrome.runtime.onMessage.removeListener(fastRestart);
      if (message.startYanatra) {
        go();
      }
    };
    if (!self.isRunning) {
      go();
    } else {
      recorder.stopRecording();
      chrome.browserAction.setIcon({ path: 'images/icon-black.png', tabId: tab.id });
      self.isRunning = false;
      var nightmare = self.parse(recorder.recording, 'nightmare');
      var horseman  = self.parse(recorder.recording, 'horseman');
      chrome.storage.sync.set({ 'nightmare': nightmare, 'horseman': horseman });
      chrome.browserAction.setPopup({ popup: 'index.html' });
      chrome.browserAction.setBadgeText({ text:recorder.recording.length+"", tabId: tab.id });
      chrome.runtime.onMessage.addListener(fastRestart);

    }

  };
  chrome.browserAction.onClicked.addListener(add);
};


/**
 * Parse the recording.
 *
 * @param {Array} recording
 * @param {String} lib
 */

Daydream.prototype.parse = function(recording, lib) {
  var newLine = '\n';
  if (os == 'windows') newLine = '\r\n';

  var result;

  result = "{}";
  var resultJson = {
    sequence: []
  };;
  resultJson.sequence.push("ignoreSync")
  var prevStepKey = false, prevStep = {};
  each(recording, function (record, i) {
    var type = record[0];
    var content = record[1];
    var val = record[2];
    var model = record[3];
    var name = record[4];
    var step = {};
    console.log(record);
    switch (type) {
      case 'wait':
        step = {
          "wait": record[2]
        };
        break;
      case 'goto':
        step = {
          "goto": content
        };
        break;
      case 'click':
        step = {
          "click": content
        };
        if (model) {
          step.click= {model: model};
          if (val) {
            step.click.value = val;
          }
          if (name) {
            step.click.name = name;
          }
        }
          
        break;
      case 'type':
        step = {
          type: {
            css: content,
            keys: val,
            clear: true
          }
        }
        if (model) {
          step.type.model = model;
          delete step.type.css;
        }
        if (name) {
          step.type.name = name;
        }
        break;
      case 'screenshot':
        step = {"screenshot": ""};
        break;
      case 'reload':
        //if (lib === 'nightmare') {
        //  result += fmt("    .refresh()%s", newLine);
        //} else if (lib === 'horseman') {
        //  result += fmt("    .reload()%s", newLine);
        //}
        break;
      case 'evaluate':
        //var textEl = fmt("      return document.querySelector('%s').innerText;", content);
        //
        //result += [
        //  '    .evaluate(function () {',
        //  textEl,
        //  '    }, function (text) {',
        //  '      console.log(text);',
        //  fmt('    })%s', newLine)
        //].join(newLine);

        break;
      default:
        console.log("Not a valid yanatra command");
    }
    var lastStepIsArr;
    if (typeof step !== "string") {
      for (var key in step) {
        if (key === prevStepKey) {
          if (!Array.isArray(prevStep[key])) {
            prevStep[key] = [prevStep[key]];
          }
          prevStep[key].push(step[key]);
        } else {
          resultJson.sequence.push(step);

          prevStepKey = key;
          prevStep = step;
        }
        break;
      }
    } else {
      resultJson.sequence.push(step);
    }
  });

  return JSON.stringify(resultJson, null, 2);
};
