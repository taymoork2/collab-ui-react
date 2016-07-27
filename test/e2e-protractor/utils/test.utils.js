'use strict';

/*global TIMEOUT*/

var config = require('./test.config.js');
var request = require('request');
var EC = protractor.ExpectedConditions;
var path = require('path');
var remote = require('selenium-webdriver/remote');
var fs = require('fs');

exports.getDateTimeString = function () {
  var now = new Date();
  var year = now.getYear() - 100;
  var month = now.getMonth() + 1;
  var day = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();
  if (month.toString().length == 1) {
    var month = '0' + month;
  }
  if (day.toString().length == 1) {
    var day = '0' + day;
  }
  if (hour.toString().length == 1) {
    var hour = '0' + hour;
  }
  if (minute.toString().length == 1) {
    var minute = '0' + minute;
  }
  if (second.toString().length == 1) {
    var second = '0' + second;
  }
  var dateTime = year.toString() + month.toString() + day.toString() + '_' + hour.toString() + minute.toString() + second.toString();
  return dateTime;
};

exports.resolvePath = function (filePath) {
  return path.resolve(__dirname, filePath);
};

exports.writeFile = function (file, text) {
  return fs.writeFile(file, text);
};

exports.deleteFile = function (file) {
  return fs.unlink(file);
};

exports.searchField = element(by.id('searchFilter'));
exports.searchbox = element(by.css('.searchbox'));

exports.randomId = function () {
  return (Math.random() + 1).toString(36).slice(2, 7);
};

exports.randomDid = function () {
  return Math.floor((Math.random() * 90000000000)) + 10000000000; // 11 digits
};

exports.randomTestRoom = function () {
  return 'atlas-' + this.randomId();
};

exports.randomTestGmail = function () {
  return 'collabctg+' + this.getDateTimeString() + '_' + this.randomId() + '@gmail.com';
};

exports.randomTestGmailwithSalt = function (salt) {
  return 'collabctg+' + salt + '_' + this.getDateTimeString() + '_' + this.randomId() + '@gmail.com';
};

exports.sendRequest = function (options) {
  var flow = protractor.promise.controlFlow();
  return flow.execute(function () {
    var defer = protractor.promise.defer();
    request(options, function (error, response, body) {
      var status = _.get(response, 'statusCode');
      if (error || status >= 400) {
        console.error('Send ' + options.method + ' request to ' + options.url + ' failed with status ' + status + '.  ' + (error || body));
        defer.reject(response);
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
exports.wait = function (elem, timeout) {
  // If element is an array, fallback to custom isDisplayed check
  if (elem instanceof protractor.ElementArrayFinder) {
    return browser.wait(function () {
      log('Waiting for element array to be displayed: ' + elem.locator());
      return elem.first().isDisplayed().then(function (isDisplayed) {
        return isDisplayed;
      }, function () {
        return false;
      });
    }, timeout || TIMEOUT, 'Waiting for element array to be displayed: ' + elem.locator());
  }

  function logAndWait() {
    log('Waiting for element to be visible: ' + elem.locator());
    return EC.visibilityOf(elem)().thenCatch(function () {
      // handle a possible stale element
      log('Possible stale element: ' + elem.locator());
      return false;
    });;
  }
  return browser.wait(logAndWait, timeout || TIMEOUT, 'Waiting for element to be visible: ' + elem.locator());
};

exports.waitForPresence = function (elem, timeout) {
  function logAndWait() {
    log('Waiting for element to be present: ' + elem.locator());
    return EC.presenceOf(elem)().thenCatch(function () {
      // handle a possible stale element
      return false;

    });;
  }
  return browser.wait(logAndWait, timeout || TIMEOUT, 'Waiting for element to be present: ' + elem.locator());
};

exports.waitUntilEnabled = function (elem) {
  return this.wait(elem).then(function () {
    return browser.wait(function () {
      return elem.isEnabled().then(function (isEnabled) {
        log('Waiting until element is enabled: ' + elem.locator() + ' ' + isEnabled);
        return isEnabled;
      }, function () {
        return false;
      });
    }, TIMEOUT, 'Waiting until enabled: ' + elem.locator());
  });
};

exports.waitUntilDisabled = function (elem) {
  return this.wait(elem).then(function () {
    return browser.wait(function () {
      return elem.isEnabled().then(function (isEnabled) {
        log('Waiting until element is disabled: ' + elem.locator() + ' ' + !isEnabled);
        return !isEnabled;
      }, function () {
        return false;
      });
    }, TIMEOUT, 'Waiting until disabled: ' + elem.locator());
  });
};

exports.waitForTextBoxValue = function (elem) {
  return this.wait(elem).then(function () {
    return browser.wait(function () {
      return elem.getAttribute('value').then(function (text) {
        log('Waiting until text box displays some text. Current text: ' + text);
        if (text) {
          return true;
        } else {
          return false;
        }
      }, function () {
        return false;
      });
    }, TIMEOUT, 'Waiting text To be available: ' + elem.locator());
  });
};

exports.expectIsDisplayed = function (elem) {
  this.wait(elem).then(function () {
    expect(elem.isDisplayed()).toBeTruthy();
  });
};

exports.expectAllDisplayed = function (elems) {
  this.wait(elems).then(function () {
    elems.each(function (elem) {
      expect(elem.isDisplayed()).toBeTruthy();
    });
  });
};

exports.expectAllNotDisplayed = this.expectIsNotDisplayed;

exports.expectIsDisabled = function (elem) {
  this.wait(elem).then(function () {
    expect(elem.isEnabled()).toBeFalsy();
  });
};

exports.expectIsEnabled = function (elem) {
  this.wait(elem).then(function () {
    expect(elem.isEnabled()).toBeTruthy();
  });
};

exports.expectIsPresent = function (elem) {
  this.wait(elem).then(function () {
    expect(elem.isPresent()).toBeTruthy();
  });
};

exports.expectIsNotPresent = function (elem) {
  expect(elem.isPresent()).toBeFalsy();
};

exports.expectIsNotDisplayed = function (elem, timeout) {

  if (elem instanceof protractor.ElementArrayFinder) {
    return browser.wait(function () {
      log('Waiting for element array not to be displayed: ' + elem.locator());
      return elem.first().isDisplayed().then(function (isDisplayed) {
        return !isDisplayed;
      }, function () {
        return true;
      });
    }, timeout || TIMEOUT, 'Waiting for element array not to be displayed: ' + elem.locator());
  }

  function logAndWait() {
    log('Waiting for element not to be visible: ' + elem.locator());
    return EC.invisibilityOf(elem)().thenCatch(function () {
      // Handle stale element reference
      return EC.stalenessOf(elem)();
    });
  }
  browser.wait(logAndWait, TIMEOUT, 'Waiting for element not to be visible: ' + elem.locator());
};

exports.expectTextToBeSet = function (elem, text, timeout) {
  browser.wait(function () {
    return elem.getText().then(function (result) {
      log('Waiting for element (' + elem.locator() + ').getText() to contain "' + text + '" currently "' + result + '"');
      return result !== undefined && result !== null && result.indexOf(text) > -1;
    }, function () {
      return false;
    });
  }, timeout || TIMEOUT, 'Waiting for Text to be set: ' + elem.locator() + ' ' + text);
};

exports.expectValueToBeSet = function (elem, text, timeout) {
  browser.wait(function () {
    return elem.getAttribute('value').then(function (result) {
      log('Waiting for element (' + elem.locator() + ') to have value "' + text + '" currently "' + result + '"');
      return result !== undefined && result !== null && result.indexOf(text) > -1;
    }, function () {
      return false;
    });
  }, timeout || TIMEOUT, 'Waiting for Text to be set: ' + elem.locator() + ' ' + text);
};

exports.expectValueToContain = function (elem, value) {
  this.wait(elem);
  browser.wait(function () {
    return elem.getAttribute('value').then(function (result) {
      log('Waiting for element to contain value: ' + elem.locator() + ' ' + value);
      return result !== undefined && result !== null && result.indexOf(value) > -1;
    }, function () {
      return false;
    });
  }, TIMEOUT, 'Waiting for: ' + elem.locator());
};

exports.expectInputValue = function (elem, value) {
  this.wait(elem);
  this.expectValueToBeSet(elem.element(by.tagName('input')), value);
};

exports.expectTokenInput = function (elem, value) {
  this.wait(elem);
  var input = elem.all(by.tagName('input')).first();
  browser.wait(function () {
    return input.getAttribute('value').then(function (result) {
      log('Waiting for token to contain value: ' + elem.locator() + ' ' + value);
      return result !== undefined && result !== null && result.indexOf(value) > -1;
    }, function () {
      return false;
    });
  }, TIMEOUT, 'Waiting for token to contain value: ' + elem.locator());
};

exports.click = function (elem, maxRetry) {
  function logAndWait() {
    log('Waiting for element to be clickable: ' + elem.locator());
    return EC.elementToBeClickable(elem)().thenCatch(function () {
      // handle a possible stale element
      return false;
    });
  }
  return this.wait(elem).then(function () {
    return browser.wait(logAndWait, TIMEOUT, 'Waiting for element to be clickable: ' + elem.locator());
  }).then(function () {
    var deferred = protractor.promise.defer();
    if (typeof maxRetry === 'undefined') {
      maxRetry = 10;
    }
    log('Click element: ' + elem.locator());
    if (maxRetry === 0) {
      return elem.click().then(deferred.fulfill, deferred.reject);
    } else {
      return elem.click().then(deferred.fulfill, function (e) {
        log('Failed to click element: ' + elem.locator() + ' Error: ' + (e && e.message || e));
        return exports.click(elem, --maxRetry);
      });
    }
    return deferred.promise;
  });
};

exports.clickFirst = function (elem) {
  return this.wait(elem).then(function () {
    return exports.click(elem.first());
  });
};

exports.clickLast = function (elem) {
  return this.wait(elem).then(function () {
    return exports.click(elem.last());
  });
};

exports.clickAll = function (elems) {
  return this.wait(elems).then(function () {
    elems.each(function (elem, index) {
      return exports.click(elem);
    });
  })
};

exports.isSelected = function (elem) {
  return this.wait(elem).then(function () {
    return elem.isSelected();
  });
};

exports.clear = function (elem) {
  this.wait(elem).then(function () {
    log('Clear element: ' + elem.locator());
    elem.clear();
  });
};

exports.sendKeys = function (elem, value) {
  this.wait(elem).then(function () {
    log('Send keys to element: ' + elem.locator() + ' ' + value);
    elem.sendKeys(value);
  });
};

exports.sendKeysUpArrow = function (element, howMany) {
  var len = howMany || 1;
  var upSeries = '';
  _.times(len, function () {
    upSeries += protractor.Key.ARROW_UP;
  });
  return element.sendKeys(upSeries);
};

exports.fileSendKeys = function (elem, value) {
  this.waitForPresence(elem).then(function () {
    log('Send file keys to element: ' + elem.locator() + ' ' + value);
    browser.setFileDetector(new remote.FileDetector);
    elem.sendKeys(value);
  });
};

exports.expectAttribute = function (elem, attr, value) {
  this.wait(elem).then(function () {
    expect(elem.getAttribute(attr)).toEqual(value);
  });
};

exports.expectText = function (elem) {
  var values = [].slice.call(arguments, 1);
  return this.wait(elem).then(function () {
    var text = elem.getText();
    var locator = elem.locator();
    values.forEach(function (value) {
      log('Expecting element ' + locator + ' to contain text: ' + value);
      expect(text).toContain(value);
    });
    return true;
  });
};

exports.expectNotText = function (elem, value) {
  this.wait(elem).then(function () {
    expect(elem.getText()).not.toContain(value);
  });
};

exports.expectCount = function (elems, count) {
  this.wait(elems).then(function () {
    expect(elems.count()).toEqual(count);
  });
};

exports.expectCountToBeGreater = function (elems, num) {
  this.wait(elems).then(function () {
    return elems.count().then(function (count) {
      expect(count > num);
    });
  });
};

exports.expectTruthy = function (elem) {
  expect(elem).toBeTruthy();
};

exports.expectClass = function (elem, cls) {
  return this.wait(elem).then(function () {
    return elem.getAttribute('class').then(function (classes) {
      log('Expect element to have class: ' + elem.locator() + ' ' + cls);
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
      log('Waiting for element state to be value: ' + elem.locator() + ' ' + value);
      var input = elem.element(by.tagName('input'));
      return input.getAttribute('ng-model').then(function (ngModel) {
        return input.evaluate(ngModel).then(function (_value) {
          return value === _value;
        });
      });
    }, TIMEOUT, 'Waiting for switch state to be ' + value + ': ' + elem.locator());
  });
};

exports.expectCheckbox = function (elem, value) {
  return this.wait(elem).then(function () {
    return browser.wait(function () {
      log('Waiting for element to be checked: ' + elem.locator() + ' ' + value);
      var input = elem.element(by.xpath('..')).element(by.tagName('input'));
      return input.getAttribute('ng-model').then(function (ngModel) {
        return input.evaluate(ngModel).then(function (_value) {
          return value === _value;
        });
      });
    }, TIMEOUT, 'Waiting for checkbox to be ' + value + ': ' + elem.locator());
  });
};

exports.expectRadioSelected = function (elem) {
  return this.wait(elem).then(function () {
    return browser.wait(function () {
      log('Waiting for radio to be selected: ' + elem.locator());
      var input = elem.element(by.tagName('input'));
      return input.getAttribute('ng-model').then(function (ngModel) {
        return input.evaluate(ngModel).then(function (model) {
          return input.getAttribute('value').then(function (value) {
            return value == model;
          });
        });
      });
    }, TIMEOUT, 'Waiting for radio to be selected: ' + elem.locator());
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

// use _searchCount = -1 for unbounded search
exports.search = function (query, _searchCount) {
  var spinner = element.all(by.css('.icon-spinner')).get(0);
  var searchCount = _searchCount || 1;

  function logAndWait() {
    log('Waiting for ' + searchCount + ' search result');
    return EC.textToBePresentInElement(element(by.css('.searchfilter li:first-child .count')), searchCount)().thenCatch(function () {
      // handle a possible stale element
      return false;
    });
  }

  function waitSpinner() {
    exports.expectIsNotDisplayed(spinner);
  }

  exports.click(exports.searchbox);
  exports.clear(exports.searchField);
  if (query) {
    exports.sendKeys(exports.searchField, query + protractor.Key.ENTER);
    exports.expectValueToBeSet(exports.searchField, query, TIMEOUT);
    for (var i = 0; i < 3; i++) {
      // Spinner may bounce repeatedly
      exports.wait(spinner, 500).then(waitSpinner, waitSpinner);
    }
  }

  if (searchCount > -1) {
    browser.wait(logAndWait, TIMEOUT, 'Waiting for ' + searchCount + ' search result');
  }

  if (query) {
    return exports.expectIsDisplayed(element.all(by.cssContainingText('.ui-grid .ui-grid-row .ui-grid-cell-contents', query)).get(0));
  }
};

exports.clickUser = function (query) {
  return this.click(element.all(by.cssContainingText('.ui-grid .ui-grid-row .ui-grid-cell-contents', query)).get(0));
};

exports.searchAndClick = function (query) {
  this.search(query);
  return this.clickUser(query);
};

exports.expectRowIsNotDisplayed = function (text) {
  this.expectIsNotDisplayed(element.all(by.cssContainingText('.ui-grid .ui-grid-row .ui-grid-cell-contents', text)).get(0));
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

exports.createHuronUser = function (name, name2) {
  navigation.clickUsers();
  this.click(users.addUsers);
  this.click(users.addUsersField);
  this.sendKeys(users.addUsersField, name + protractor.Key.ENTER);
  if (name2) {
    this.sendKeys(users.addUsersField, name2 + protractor.Key.ENTER);
  }
  this.click(users.nextButton);
  this.click(users.advancedCommunications);
  this.click(users.nextButton);
  this.expectIsNotDisplayed(telephony.loadingSpinner);
  browser.sleep(500); // TODO fix this with disabled button
  this.click(users.onboardButton);
  notifications.assertSuccess(name, 'onboarded successfully');
  this.expectIsNotDisplayed(users.manageDialog);
  this.searchAndClick(name);
};

exports.loginAndCreateHuronUser = function (loginName, userName, userName2) {
  login.login(loginName, '#/users');
  this.createHuronUser(userName, userName2);
};

exports.getUserWithDn = function (name) {
  navigation.clickUsers();
  this.click(users.addUsers);
  this.click(users.addUsersField);
  this.sendKeys(users.addUsersField, name + protractor.Key.ENTER);
  this.click(users.nextButton);

};
exports.loginToOnboardUsers = function (loginName, userName) {
  login.login(loginName, '#/users');
  this.getUserWithDn(userName);
};

exports.deleteUser = function (name, name2) {
  this.clickEscape();
  navigation.clickUsers();
  this.search(name);
  this.click(users.userListAction);
  this.click(users.deleteUserOption);
  this.expectIsDisplayed(users.deleteUserModal);
  this.click(users.deleteUserButton);
  notifications.assertSuccess(name, 'deleted successfully');
  if (name2) {
    this.search(name2);
    this.click(users.userListAction);
    this.click(users.deleteUserOption);
    this.expectIsDisplayed(users.deleteUserModal);
    this.click(users.deleteUserButton);
    notifications.assertSuccess(name2, 'deleted successfully');
  }
};

exports.deleteIfUserExists = function (name) {
  this.clickEscape();
  navigation.clickUsers();
  this.search(name);
  if (name) {
    waitUntilElemIsPresent(users.userListAction, 2000).then(function () {
      exports.click(users.userListAction);
      exports.click(users.deleteUserOption);
      exports.expectIsDisplayed(users.deleteUserModal);
      exports.click(users.deleteUserButton);
      notifications.assertSuccess(name, 'deleted successfully');
    }, function () {
      log('user is not present');
    });
  }

  function waitUntilElemIsPresent(elem, timeout) {
    return exports.wait(elem, timeout).then(function () {
      return elem.isDisplayed();
    })
  }
};

exports.quickDeleteUser = function (bFirst, name) {
  if (bFirst) {
    this.search(name, -1);
  }

  return waitUntilElemIsPresent(users.userListAction, 2000).then(function () {
    exports.click(users.userListAction);
    exports.click(users.deleteUserOption);
    exports.expectIsDisplayed(users.deleteUserModal);
    exports.click(users.deleteUserButton);
    notifications.assertSuccess(name, 'deleted successfully');
    return true;
  }, function () {
    log('user is not preset');
    return false;
  });

  function waitUntilElemIsPresent(elem, timeout) {
    return exports.wait(elem, timeout).then(function () {
      return elem.isDisplayed();
    })
  }
};

exports.waitForModal = function () {
  return this.wait(element(by.css('.reveal-modal')));
};

exports.selectDropdown = function (dropdown, option) {
  this.click(element(by.css(dropdown + ' a.select-toggle')));
  this.click(element(by.cssContainingText(dropdown + ' .select-options a', option)));
};
