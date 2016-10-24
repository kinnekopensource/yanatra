
/**
 * Module dependencies.
 */

var js = require('segmentio/highlight-javascript');
var Highlight = require('segmentio/highlight');
var Emitter = require('component/emitter');
var clip = require("./clipboard.js");


var resultJson = "";
chrome.browserAction.setBadgeText({text: ''})


function showLib(lib) {
  chrome.storage.sync.get(lib, function(res){
    var el = document.querySelector('pre');
    var highlight = Highlight().use(js);
    el.innerText = resultJson = res[lib];
    highlight.element(el);
  });
}

var restart = document.querySelector('.Restart-Button');
restart.addEventListener('click', function(event) {
  chrome.browserAction.setBadgeText({text: ''})
  chrome.runtime.sendMessage({
    startYanatra: true
  });

  window.close();
});

new  clip('.Copy-Button', {
  text: function(trigger) {
    setTimeout(function() {
      window.close();
    }, 100);
    return resultJson;
  }
});

var libNightmare = document.querySelector('.Lib-Nightmare');
libNightmare.addEventListener('click', function(event) {
  showLib('nightmare');
});

var libHorseman = document.querySelector('.Lib-Horseman');
libHorseman.addEventListener('click', function(event) {
  showLib('horseman');
});

showLib('nightmare');

