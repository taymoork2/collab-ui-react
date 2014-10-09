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

exports.randomTestEmail = function() {
	return 'atlas-' + this.randomId() + '@wx2.example.com';
};

exports.randomTestRoom = function() {
  return 'atlas-' + this.randomId();
};

exports.randomTestGmail = function() {
  return 'collabctg+' + this.randomId() + '@gmail.com';
};

exports.sendRequest = function(options) {
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
};

exports.getToken = function() {
  var defer = protractor.promise.defer();

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

  this.sendRequest(options).then(function(data) {
    var resp = JSON.parse(data);
    console.log('access token', resp.access_token);
    //token = resp.access_token;
    defer.fulfill(resp.access_token);
  }, function() {
    defer.reject();
  });

  return defer.promise;

};

exports.scrollTop = function() {
  browser.executeScript('window.scrollTo(0,0);');
};

// Utility functions to be used with animation effects
// Will wait for element to be displayed before attempting to take action
exports.expectIsDisplayed = function(elem) {
  browser.wait(function(){
    return elem.isDisplayed().then(function(isDisplayed){
      return isDisplayed;
    }, function(){
      return false;
    });
  });
  expect(elem.isDisplayed()).toBeTruthy();
};

exports.expectIsNotDisplayed = function(elem) {
  browser.wait(function(){
    return elem.isDisplayed().then(function(isDisplayed){
      return !isDisplayed;
    }, function(){
      return false;
    });
  });
  expect(elem.isDisplayed()).toBeFalsy();
};

exports.click = function(elem) {
  browser.wait(function(){
    return elem.isDisplayed().then(function(isDisplayed){
      return isDisplayed;
    }, function(){
      return false;
    });
  });
  elem.click();
};

exports.getSwitchState = function(elem) {
  return elem.getAttribute('ng-model').then(function(model) {
    return elem.evaluate(model).then(function(value) {
      return value;
    });
  });
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
