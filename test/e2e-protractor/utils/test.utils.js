'use strict';

/* global protractor */

var config = require('./test.config.js');
var request = require('request');
// var jar = request.jar();
// var req = request.defaults({
//   jar: jar
// });

exports.randomId = function() {
  return (Math.random() + 1).toString(36).slice(2);
};

exports.randomTestRoom = function() {
  return 'atlas-' + this.randomId();
};

exports.randomTestGmail = function() {
  var email = 'collabctg+' + this.randomId() + '@gmail.com';
  console.log('randomTestGmail: ' + email);
  return email;
};

exports.sendRequest = function(options) {
  var flow = protractor.promise.controlFlow();
  return flow.execute(function() {
    var defer = protractor.promise.defer();
    console.log('\nSending Request...', options);

    request(options, function(error, response, message) {
      console.log('\nResponse Received...', options.url);
      console.log('--error: ' + error);
      console.log('--status code: ' + response.statusCode);
      console.log('--message: ' + message);

      if (error || response.statusCode >= 400) {
        defer.reject({
          status: response.statusCode,
          error: error,
          message: message
        });
      } else {
        defer.fulfill(message);
      }
    });

    return defer.promise;
  });
};

exports.getToken = function() {
  console.log('getting token');
  var options = {
    method: 'post',
    url: config.oauth2Url + 'access_token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    auth: {
      'user': config.oauthClientRegistration.id,
      'pass': config.oauthClientRegistration.secret,
      'sendImmediately': true
    },
    body: 'grant_type=client_credentials&scope=' + config.oauthClientRegistration.scope
  };

  return this.sendRequest(options).then(function(data) {
    var resp = JSON.parse(data);
    console.log('access token', resp.access_token);
    return resp.access_token;
  });
};

exports.scrollTop = function() {
  browser.executeScript('window.scrollTo(0,0);');
};

// Utility functions to be used with animation effects
// Will wait for element to be displayed before attempting to take action
exports.wait = function(elem) {
  browser.wait(function () {
    return elem.isDisplayed().then(function(isDisplayed){
      return isDisplayed;
    }, function(){
      return false;
    });
  }, 30000, 'Waiting for: ' + elem.locator());
};

exports.expectIsDisplayed = function(elem) {
  this.wait(elem);
  expect(elem.isDisplayed()).toBeTruthy();
};

exports.expectIsNotDisplayed = function(elem) {
  browser.wait(function(){
    return elem.isDisplayed().then(function(isDisplayed){
      return !isDisplayed;
    }, function(){
      return true;
    }, 30000, 'Waiting for: ' + elem.locator());
  });
};

exports.click = function(elem, maxRetry) {
  this.wait(elem);
  if (typeof maxRetry === 'undefined') {
    maxRetry = 10;
  }
  if (maxRetry === 0) {
    console.error('Could not click: ' + elem.locator());
    elem.click();
  } else {
    elem.click().then(function () {
    }, function () {
      exports.click(elem, --maxRetry);
    });
  }
};

exports.expectText = function(elem, value) {
  this.wait(elem);
  expect(elem.getText()).toEqual(value);
};

exports.getSwitchState = function(elem) {
  return elem.evaluate('buttonValue');
};

exports.toggleSwitch = function(elem, toggle) {
  this.getSwitchState(elem).then(function(value){
    if (value !== toggle) {
      elem.element(by.css('input'))
        .then(function(input){
          input.click();
        },function(){
          elem.click();
        });
    }
  });
};

exports.enableSwitch = function(elem) {
  this.toggleSwitch(elem,true);
};

exports.disableSwitch = function(elem) {
  this.toggleSwitch(elem,false);
};

exports.hasClass = function (element, cls) {
  return element.getAttribute('class').then(function (classes) {
      return classes.split(' ').indexOf(cls) !== -1;
  });
};

exports.findDirectoryNumber = function (message, lineNumber) {
  for (var i = 0; i < message.length; i++) {
    var line = message[i];
    if (line.directoryNumber.pattern === lineNumber){
      return line.uuid;
    }
  }
  return null;
};
