
/**
 * Module dependencies.
 */

var Analytics = require('./analytics-node');
var uid = require('matthewmueller/uid');
var empty = require('component/empty');
var each = require('component/each');

/**
 * Analytics.
 */

var oldId = localStorage['userId'];
var newId = oldId || uid();
if (!oldId) localStorage['userId'] = newId;

/**
 * Expose `Recorder`.
 */

module.exports = Recorder;

var getActiveTab = function(func) {
 chrome.tabs.query({active: true}, function(tabs) {
   chrome.windows.getCurrent(function(window) {
     tabs.forEach(function(tab) {
       if (window.id === tab.windowId) {
         func(tab);
         return true;
       }
     })
   })
 })
};

/**
 * Recorder.
 */

function Recorder(){
  if (!(this instanceof Recorder)) return new Recorder();
  this.recording = [];
}

/**
 * Record a message.
 *
 * @param {String} message
 */

Recorder.prototype.record = function(message){
  //debugger;
  var lastElement = this.recording[this.recording.length - 1];
  if (!lastElement) return this.recording.push(message);
  if (lastElement[1] === message[1]) {
    if (lastElement[0] === "click" && message[0] === "type") {
      this.recording.pop();
    }
  }
  this.recording.push(message);
};

var messageListener;
/**
 * Start recording.
 */

Recorder.prototype.startRecording = function(){
  var self = this;
  this.recording = [];
  this.detectScreenshots();
  this.detectUrl();
  this.detectEvents();
  messageListener =  function (request, sender, sendResponse) {
    var message = request;
    self.record(message);
  };
  chrome.runtime.onMessage.addListener(messageListener);
  
  // analytics.track({ event: 'Started recording', userId: newId });
};

var animated = "";
var lastActiveTabId = null;
var timed;
var indicateRecording = function() {
  chrome.browserAction.setBadgeBackgroundColor({
    color:[73,158,73,255],
    tabId: lastActiveTabId
  });
  chrome.browserAction.setBadgeText({ text:"••", tabId: lastActiveTabId });
};


var tabListener = function(tabId, changeInfo, tab){

  if (changeInfo.status == 'complete') {
    getActiveTab(function (activeTab){
      if (tabId === activeTab.id) {
        indicateRecording();
        lastActiveTabId = tabId;
        inject('foreground.js', activeTab.id);
      } else {
        lastActiveTabId = null;
      }
    });
  }
};

var tabActivateListener = function (tabId, windowId) {

};

/**
 * Record events on the page.
 */

Recorder.prototype.detectEvents = function(){
  var self = this;
  getActiveTab(function(tab){
    inject('foreground.js', tab.id);

    lastActiveTabId = tab.id;
    self.recording.unshift([
      "goto", tab.url
    ]);
    indicateRecording();
  });

  chrome.tabs.onUpdated.addListener(tabListener);

};

/**
 * Detect the url.
 */

Recorder.prototype.detectUrl = function(){
  var self = this;
};

/**
 * Detect screenshots.
 */

var screenshotListener;

Recorder.prototype.detectScreenshots = function(){
  var self = this;
  screenshotListener = function(command){
    if (command === "detect-screenshot") self.record(['screenshot', 'index.png']);

    //analytics.track({ event: 'Took screenshot', userId: newId });
  };
  chrome.commands.onCommand.addListener(screenshotListener);
};

/**
 * Stop recording.
 */

Recorder.prototype.stopRecording = function(){
  chrome.commands.onCommand.removeListener(screenshotListener);
  chrome.runtime.onMessage.removeListener(messageListener);
  chrome.tabs.onUpdated.removeListener(tabListener);
  chrome.browserAction.setBadgeText({ text:"", tabId: lastActiveTabId });
  chrome.tabs.executeScript(lastActiveTabId, {code: "window.yanatraChrome && window.yanatraChrome.stop()"});
  lastActiveTabId = null;
};

/**
 * Helper function to inject a content script.
 *
 * @param {String} name
 * @param {Number} id
 */

function inject(name, id){
  console.log(name);
  chrome.tabs.executeScript(id, {file: name});
};
