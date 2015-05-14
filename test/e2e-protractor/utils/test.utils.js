'use strict';

/* global protractor */

var config = require('./test.config.js');
var request = require('request');

exports.searchField = element(by.id('searchFilter'));

exports.randomId = function () {
  return (Math.random() + 1).toString(36).slice(2);
};

exports.randomDid = function () {
  return Math.floor((Math.random() * 90000000000)) + 10000000000; // 11 digits
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

exports.waitUntilEnabled = function (elem) {
  browser.wait(function () {
    return elem.isEnabled();
  }, 40000, 'Waiting for: ' + elem.locator());
};

exports.expectIsDisplayed = function (elem) {
  this.wait(elem);
  expect(elem.isDisplayed()).toBeTruthy();
};

exports.expectAllDisplayed = function (elems) {
  this.wait(elems);
  elems.each().then(function (elem) {
    expect(elem.isDisplayed()).toBeTruthy();
  });
};

exports.expectAllNotDisplayed = function (elems) {
  elems.each().then(function (elem) {
    expect(elem.isDisplayed()).toBeFalsy();
  });
};

exports.expectIsDisabled = function (elem) {
  this.wait(elem);
  expect(elem.isEnabled()).toBeFalsy();
};

exports.expectIsEnabled = function (elem) {
  this.wait(elem);
  expect(elem.isEnabled()).toBeTruthy();
};

exports.expectIsPresent = function (elem) {
  this.wait(elem);
  expect(elem.isPresent()).toBeTruthy();
};

exports.expectIsNotPresent = function (elem) {
  expect(elem.isPresent()).toBeFalsy();
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

exports.expectInputValue = function (elem, value) {
  this.wait(elem);
  this.expectValueToBeSet(elem.element(by.tagName('input')), value);
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

exports.expectCountToBeGreater = function (elems, num) {
  this.wait(elems);
  elems.count().then(function (count) {
    expect(count > num);
  });
};

exports.expectTruthy = function (elem) {
  this.wait(elem);
  expect(elem).toBeTruthy();
};

exports.expectClass = function (elem, cls) {
  this.wait(elem);
  return elem.getAttribute('class').then(function (classes) {
    return classes.split(' ').indexOf(cls) !== -1;
  });
};

exports.clickEscape = function () {
  this.sendKeys(element(by.tagName('body')), protractor.Key.ESCAPE);
};

exports.expectSwitchState = function (elem, value) {
  this.wait(elem);
  return elem.element(by.tagName('input')).getAttribute('ng-model').then(function (ngModel) {
    return elem.evaluate(ngModel);
  });
};

exports.getSwitchState = function (elem) {
  return elem.isSelected();
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
  this.wait(this.searchField);
  this.expectIsDisplayed(this.searchField);
  this.clear(this.searchField);
  if (query) {
    this.sendKeys(this.searchField, query);
    this.expectIsDisplayed(element.all(by.cssContainingText('.ngGrid .ngRow span', query)).first());
  }
};

exports.searchAndClick = function (query) {
  this.search(query);
  this.click(element.all(by.cssContainingText('.ngGrid .ngRow span', query)).first());
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
  if (typeof value !== 'string') {
    value = value.toString();
  }
  value = value.replace(/[^0-9]/g, '');
  var vLength = value.length;
  if (vLength === 10) {
    value = value.replace(/(\d{3})(\d{3})(\d{4})/, "1 ($1) $2-$3");
  } else if (vLength === 11) {
    value = value.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "$1 ($2) $3-$4");
  }
  return value;
};

exports.clickFirstBreadcrumb = function () {
  this.scrollTop();
  this.click(element.all(by.css('.side-panel-container')).last().all(by.css('li[ng-repeat="crumb in breadcrumbs"] a')).first());
};

exports.clickLastBreadcrumb = function () {
  this.scrollTop();
  this.click(element.all(by.css('.side-panel-container')).last().all(by.css('li[ng-repeat="crumb in breadcrumbs"] a')).last());
};
