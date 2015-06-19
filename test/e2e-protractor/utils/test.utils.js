'use strict';

/* global protractor */

var config = require('./test.config.js');
var request = require('request');

exports.searchField = element(by.id('searchFilter'));

exports.randomId = function () {
  return (Math.random() + 1).toString(36).slice(2, 12);
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

exports.scrollBottom = function (selector) {
  browser.executeScript('$("' + selector + '").first().scrollTop($("' + selector + '").first().scrollHeight);');
};

exports.refresh = function () {
  return browser.refresh();
};

// Utility functions to be used with animation effects
// Will wait for element to be displayed before attempting to take action
exports.wait = function (elem) {
  return browser.wait(function () {
    return elem.isDisplayed().then(function (isDisplayed) {
      return isDisplayed;
    }, function () {
      return false;
    });
  }, TIMEOUT, 'Waiting for: ' + elem.locator());
};

exports.waitUntilEnabled = function (elem) {
  return this.wait(elem).then(function () {
    return browser.wait(function () {
      return elem.isEnabled();
    }, TIMEOUT, 'Waiting until enabled: ' + elem.locator());
  });
};

exports.waitUntilDisabled = function (elem) {
  return this.wait(elem).then(function () {
    return browser.wait(function () {
      return elem.isEnabled() === false;
    }, TIMEOUT, 'Waiting until disabled: ' + elem.locator());
  });
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
  }, TIMEOUT, 'Waiting for: ' + elem.locator());
};

exports.expectTextToBeSet = function (elem, text) {
  browser.wait(function () {
    return elem.getText().then(function (result) {
      return result !== undefined && result !== null && result === text;
    }, function () {
      return false;
    });
  }, TIMEOUT, 'Waiting for: ' + elem.locator());
};

exports.expectValueToBeSet = function (elem, value) {
  this.wait(elem);
  browser.wait(function () {
    return elem.getAttribute('value').then(function (result) {
      return result !== undefined && result !== null && result === value;
    }, function () {
      return false;
    });
  }, TIMEOUT, 'Waiting for: ' + elem.locator());
};

exports.expectValueToContain = function (elem, value) {
  this.wait(elem);
  browser.wait(function () {
    return elem.getAttribute('value').then(function (result) {
      return result !== undefined && result !== null && result.indexOf(value) > -1;
    }, function () {
      return false;
    });
  }, TIMEOUT, 'Waiting for: ' + elem.locator());
};

exports.expectInputValue = function (elem, value) {
  this.expectValueToBeSet(elem.element(by.tagName('input')), value);
};

exports.click = function (elem, maxRetry) {
  return this.wait(elem).then(function () {
    var deferred = protractor.promise.defer();
    if (typeof maxRetry === 'undefined') {
      maxRetry = 10;
    }
    if (maxRetry === 0) {
      return elem.click().then(deferred.fulfill, deferred.reject);
    } else {
      return elem.click().then(deferred.fulfill, function () {
        return exports.click(elem, --maxRetry);
      });
    }
    return deferred.promise;
  });
};

exports.isSelected = function (elem) {
  this.wait(elem);
  return elem.isSelected();
};

exports.expectSelected = function (selected, state) {
  if (state === undefined) {
    state = true;
  }
  if (state) {
    expect(selected).toBeTruthy();
  } else {
    expect(selected).toBeFalsy();
  }
};

exports.clear = function (elem) {
  this.wait(elem).then(function () {
    elem.clear();
  });
};

exports.sendKeys = function (elem, value) {
  this.wait(elem).then(function () {
    elem.sendKeys(value);
  });
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
  return this.wait(elem).then(function () {
    return elem.getAttribute('class').then(function (classes) {
      return classes.split(' ').indexOf(cls) !== -1;
    });
  });
};

exports.clickEscape = function () {
  this.sendKeys(element(by.tagName('body')), protractor.Key.ESCAPE);
};

exports.expectSwitchState = function (elem, value) {
  return this.wait(elem).then(function () {
    return browser.wait(function () {
      var input = elem.element(by.tagName('input'));
      return input.getAttribute('ng-model').then(function (ngModel) {
        return input.evaluate(ngModel).then(function (_value) {
          return value === _value;
        });
      });
    }, TIMEOUT, 'Waiting for switch state to be ' + value + ': ' + elem.locator());
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
  this.clear(this.searchField);
  if (query) {
    this.sendKeys(this.searchField, query);
    this.expectIsDisplayed(element.all(by.cssContainingText('.ngGrid .ngRow span', query)).first());
  }
};

exports.searchAndClick = function (query) {
  this.search(query);
  return this.click(element.all(by.cssContainingText('.ngGrid .ngRow span', query)).first());
};

exports.convertUsersSearchAndClick = function (query) {
  return this.click(element.all(by.cssContainingText('.ngGrid .ngRow span', query)).first());
};

exports.expectRowIsNotDisplayed = function (text) {
  this.expectIsNotDisplayed(element.all(by.cssContainingText('.ngGrid .ngRow span', text)).first());
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

exports.switchToNewWindow = function () {
  return browser.wait(function () {
    return browser.getAllWindowHandles().then(function (handles) {
      if (handles && handles.length > 1) {
        var newWindow = handles[1];
        browser.switchTo().window(newWindow);
        return true;
      } else {
        return false;
      }
    });
  }, 40000, 'Waiting for a new window');
};

exports.getInnerElementByTagName = function (outerElement, tagName) {
  return outerElement.element(by.tagName(tagName));
};
