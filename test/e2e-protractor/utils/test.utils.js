'use strict';

/* global protractor */

var config = require('./test.config.js');
var request = require('request');

exports.searchButton = element(by.css('.header-search-toggle'));

exports.searchField = element(by.css('.search-form input'));

exports.randomId = function () {
  return (Math.random() + 1).toString(36).slice(2);
};

exports.randomDid = function () {
  return Math.floor((Math.random() * 100000000000) + 1);
};

exports.randomTestRoom = function () {
  return 'atlas-' + this.randomId();
};

exports.randomTestGmail = function () {
  return 'collabctg+' + this.randomId() + '@gmail.com';
};

exports.sendRequest = function (options) {
  var flow = protractor.promise.controlFlow();
  return flow.execute(function () {
    var defer = protractor.promise.defer();
    request(options, function (error, response, body) {
      var status = response && response.statusCode ? response.statusCode : 'unknown';
      if (error) {
        defer.reject('Send request failed with status ' + status + '. Error: ' + error);
      } else if (response && response.statusCode >= 400) {
        defer.reject('Send request failed with status ' + status + '. Body: ' + body);
      } else {
        defer.fulfill(body);
      }
    });
    return defer.promise;
  });
};

exports.getToken = function () {
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

  return this.sendRequest(options).then(function (data) {
    var resp = JSON.parse(data);
    return resp.access_token;
  });
};

exports.retrieveToken = function () {
  return element(by.tagName('body')).evaluate('token').then(function (token) {
    expect(token).not.toBeNull();
    return token;
  });
};

exports.scrollTop = function () {
  browser.executeScript('window.scrollTo(0,0);');
};

// Utility functions to be used with animation effects
// Will wait for element to be displayed before attempting to take action
exports.wait = function (elem) {
  browser.wait(function () {
    return elem.isDisplayed().then(function (isDisplayed) {
      return isDisplayed;
    }, function () {
      return false;
    });
  }, 40000, 'Waiting for: ' + elem.locator());
};

exports.expectIsDisplayed = function (elem) {
  this.wait(elem);
  expect(elem.isDisplayed()).toBeTruthy();
};

exports.expectIsDisabled = function (elem) {
  this.wait(elem);
  expect(elem.isEnabled()).toBeFalsy();
};

exports.expectIsEnabled = function (elem) {
  this.wait(elem);
  expect(elem.isEnabled()).toBeTruthy();
};

exports.expectIsNotDisplayed = function (elem) {
  browser.wait(function () {
    return elem.isDisplayed().then(function (isDisplayed) {
      return !isDisplayed;
    }, function () {
      return true;
    });
  }, 40000, 'Waiting for: ' + elem.locator());
};

exports.expectTextToBeSet = function (elem, text) {
  browser.wait(function () {
    return elem.getText().then(function (result) {
      return result !== undefined && result !== null && result === text;
    }, function () {
      return false;
    });
  }, 40000, 'Waiting for: ' + elem.locator());
};

exports.expectValueToBeSet = function (elem, value) {
  browser.wait(function () {
    return elem.getAttribute('value').then(function (result) {
      return result !== undefined && result !== null && result === value;
    }, function () {
      return false;
    });
  }, 40000, 'Waiting for: ' + elem.locator());
};

exports.expectValueToContain = function (elem, value) {
  browser.wait(function () {
    return elem.getAttribute('value').then(function (result) {
      return result !== undefined && result !== null && result.indexOf(value) > -1;
    }, function () {
      return false;
    });
  }, 40000, 'Waiting for: ' + elem.locator());
};

exports.click = function (elem, maxRetry) {
  this.wait(elem);
  if (typeof maxRetry === 'undefined') {
    maxRetry = 10;
  }
  if (maxRetry === 0) {
    //console.error('Could not click: ' + elem.locator());
    elem.click();
  } else {
    elem.click().then(function () {}, function () {
      exports.click(elem, --maxRetry);
    });
  }
};

exports.clear = function (elem) {
  this.wait(elem);
  elem.clear();
};

exports.sendKeys = function (elem, value) {
  this.wait(elem);
  elem.sendKeys(value);
};

exports.expectAttribute = function (elem, attr, value) {
  this.wait(elem);
  expect(elem.getAttribute(attr)).toEqual(value);
};

exports.expectText = function (elem, value) {
  this.wait(elem);
  expect(elem.getText()).toContain(value);
};

exports.expectNotText = function (elem, value) {
  this.wait(elem);
  expect(elem.getText()).not.toContain(value);
};

exports.expectCount = function (elems, count) {
  this.wait(elems);
  expect(elems.count()).toEqual(count);
};

exports.clickEscape = function () {
  this.sendKeys(element(by.tagName('body')), protractor.Key.ESCAPE);
};

exports.getSwitchState = function (elem) {
  return elem.evaluate('buttonValue');
};

exports.toggleSwitch = function (elem, toggle) {
  this.getSwitchState(elem).then(function (value) {
    if (value !== toggle) {
      elem.element(by.css('input'))
        .then(function (input) {
          input.click();
        }, function () {
          elem.click();
        });
    }
  });
};

exports.enableSwitch = function (elem) {
  this.toggleSwitch(elem, true);
};

exports.disableSwitch = function (elem) {
  this.toggleSwitch(elem, false);
};

exports.hasClass = function (element, cls) {
  return element.getAttribute('class').then(function (classes) {
    return classes.split(' ').indexOf(cls) !== -1;
  });
};

exports.findDirectoryNumber = function (message, lineNumber) {
  for (var i = 0; i < message.length; i++) {
    var line = message[i];
    if (line.directoryNumber.pattern === lineNumber) {
      return line.uuid;
    }
  }
  return null;
};

exports.search = function (query) {
  this.searchButton.click();
  utils.expectIsDisplayed(this.searchField);
  this.searchField.clear();
  if (query) {
    this.searchField.sendKeys(query);
    utils.expectIsDisplayed(element(by.cssContainingText('.ngGrid .ngRow span', query)));
  }
};

exports.searchAndClick = function (query) {
  this.search(query);
  utils.click(element(by.cssContainingText('.ngGrid .ngRow span', query)));
};

exports.dumpConsoleErrors = function () {
  // jshint node:true
  browser.manage().logs().get('browser').then(function (browserLogs) {
    browserLogs.forEach(function (log) {
      if (log.level.value > 900) {
        console.log('CONSOLE - ' + log.message);
      }
    });
  });
};

exports.formatPhoneNumbers = function (value) {
  value = value.replace(/[^0-9]/g, '');
  var vLength = value.length;
  if (vLength === 10) {
    value = value.replace(/(\d{3})(\d{3})(\d{4})/, "1 ($1) $2-$3");
  } else if (vLength === 11) {
    value = value.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "$1 ($2) $3-$4");
  }
  return value;
};
