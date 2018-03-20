'use strict';

/*global TIMEOUT, isSauce*/

const moment = require('moment');
var config = require('./test.config.js');
var request = require('request');
var getCecId = require('../../../utils/getCecId');
var EC = protractor.ExpectedConditions;
var path = require('path');
var fs = require('fs');

var RETRY_COUNT = 5;

exports.getUTCDateTimeString = function () {
  // notes:
  // - want human-readable format for easier troubleshooting
  // - need millisecond precision for unique-enough email addresses
  // - use year + month + day + hours + min + sec + millisec.
  //
  // e.g.
  // - March 19, 2018, 4:59:22.713 PM PDT => '20180319_235922_713'
  // - March 19, 2018, 5:00:22.713 PM PDT => '20180320_000022_713'
  return moment.utc().format('YYYYMMDD_HHmmss_SSS');
};

exports.resolvePath = function (filePath) {
  return path.resolve(__dirname, filePath);
};

exports.writeFile = function (file, text) {
  return protractor.promise.controlFlow().execute(function () {
    var defer = protractor.promise.defer();
    fs.writeFile(file, text, function (err) {
      if (err) {
        console.log('error in writeFile: ', err);
        defer.reject(err);
      } else {
        defer.fulfill();
      }
    });
    return defer.promise;
  });
};

exports.deleteFile = function (file) {
  return fs.unlinkSync(file);
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

exports.getJenkinsBuildTag = function () {
  return process.env.BUILD_TAG || `atlas-web--${getCecId()}`;
};

exports.randomTestGmail = function () {
  return 'collabctg+' + this.getJenkinsBuildTag() + '_' + this.getUTCDateTimeString() + '@gmail.com';
};

exports.randomTestGmailwithSalt = function (salt) {
  if (!isSauce) {
    salt = 'LOC_' + salt;
  }
  return 'collabctg+' + salt + '_' + this.getJenkinsBuildTag() + '_' + this.getUTCDateTimeString() + '@gmail.com';
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
      user: config.oauthClientRegistration.id,
      pass: config.oauthClientRegistration.secret,
      sendImmediately: true,
    },
    body: 'grant_type=client_credentials&scope=' + config.oauthClientRegistration.scope,
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

exports.scrollIntoView = function (el) {
  browser.executeScript('arguments[0].scrollIntoView()', el.getWebElement());
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

  return browser.wait(EC.visibilityOf(elem), timeout || TIMEOUT, 'Waiting for element to be visible: ' + elem.locator());
};

exports.waitForPresence = function (elem, timeout) {
  return browser.wait(EC.presenceOf(elem), timeout || TIMEOUT, 'Waiting for element to be present: ' + elem.locator());
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

exports.waitForSpinner = function () {
  var spinner = element.all(by.css('.icon-spinner')).get(0);

  function waitSpinner() {
    exports.expectIsNotDisplayed(spinner);
  }

  for (var i = 0; i < 3; i++) {
    // Spinner may bounce repeatedly
    exports.wait(spinner, 500).then(waitSpinner, waitSpinner);
  }
};

exports.expectIsDisplayed = function (elem, timeout) {
  return this.wait(elem, timeout || TIMEOUT).then(function () {
    return expect(elem.isDisplayed()).toBeTruthy();
  });
};

exports.expectIsReadOnly = function (elem) {
  this.wait(elem).then(function () {
    expect(elem.getAttribute('readonly')).toBeTruthy();
  });
};

exports.expectAllDisplayed = function (elems) {
  this.wait(elems).then(function () {
    elems.each(function (elem) {
      expect(elem.isDisplayed()).toBeTruthy();
    });
  });
};

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

  return browser.wait(EC.invisibilityOf(elem), timeout || TIMEOUT, 'Waiting for element not to be visible: ' + elem.locator());
};

exports.expectAllNotDisplayed = exports.expectIsNotDisplayed;
exports.waitIsNotDisplayed = exports.expectIsNotDisplayed;
exports.waitIsDisplayed = exports.expectIsDisplayed;

exports.waitForText = function (elem, text, timeout) {
  return exports.wait(elem, timeout).then(function () {
    return browser.wait(function () {
      return elem.getText().then(function (result) {
        log('Waiting for element (' + elem.locator() + ').getText() to contain "' + text + '" currently "' + result + '"');
        return result !== undefined && result !== null && result.indexOf(text) > -1;
      }, function () {
        return false;
      });
    }, timeout || TIMEOUT, 'Waiting for Text to be set: ' + elem.locator() + ' ' + text);
  });
};

exports.waitForAttribute = function (elem, attr, value) {
  this.wait(elem).then(function () {
    return browser.wait(function () {
      return elem.getAttribute(attr).then(function (attrValue) {
        log('Waiting for element: ' + elem.locator() + ' attribute ' + attr + ' ' + attrValue + ' to be ' + value);
        return value === attrValue;
      });
    });
  });
};

exports.waitForAttributeToContain = function (elem, attr, value) {
  this.wait(elem).then(function () {
    return browser.wait(function () {
      return elem.getAttribute(attr).then(function (attrValue) {
        log('Waiting for element: ' + elem.locator() + ' attribute ' + attr + ' ' + attrValue + ' to contain ' + value);
        return _.includes(attrValue, value);
      });
    });
  });
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
  return this.wait(elem).then(function () {
    return browser.wait(EC.elementToBeClickable(elem), TIMEOUT, 'Waiting for element to be clickable: ' + elem.locator());
  }).then(function () {
    if (typeof maxRetry === 'undefined') {
      maxRetry = RETRY_COUNT;
    }
    log('Click element: ' + elem.locator());
    if (maxRetry === 0) {
      return elem.click();
    } else {
      return elem.click().then(_.noop, function (e) {
        log('Failed to click element: ' + elem.locator() + ' Error: ' + ((e && e.message) || e));
        return notifications.clearNotifications().then(function () {
          return exports.click(elem, --maxRetry);
        });
      });
    }
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
    elems.each(function (elem) {
      return exports.click(elem);
    });
  })
};

// Returns true if checkbox is checked
exports.getCheckboxVal = function (elem) {
  return this.wait(elem).then(function () {
    var input = elem.element(by.xpath('..')).element(by.tagName('input'));
    return input.getAttribute('ng-model').then(function (ngModel) {
      return input.evaluate(ngModel).then(function (value) {
        return value;
      });
    });
  });
};

// Wait (timeout ms) for checkbox to be display, if it is, set it to val, if not return
exports.setCheckboxIfDisplayed = function (elem, val, timeout) {
  return this.wait(elem, timeout).then(function () {
    return exports.getCheckboxVal(elem).then(function (curVal) {
      if (curVal !== val) {
        // checkbox value needs to be toggled
        return exports.click(elem);
      }
    });
  }, function () {
    // checkbox not present, move on
    return true;
  });
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
  return this.waitForPresence(elem).then(function () {
    log('Send file keys to element: ' + elem.locator() + ' ' + value);
    return elem.sendKeys(value);
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

exports.waitClass = function (elem, cls, timeout) {
  return this.wait(elem, timeout || TIMEOUT).then(function () {
    browser.wait(function () {
      return elem.getAttribute('class').then(function (classes) {
        return classes !== undefined && classes !== null && classes.split(' ').indexOf(cls) !== -1;
      }, function () {
        return false;
      });
    }, timeout || TIMEOUT, 'Waiting for elem(' + elem.locator() + ') to contain class ' + cls);
  });
};

exports.clickEscape = function () {
  this.sendKeys(element(by.tagName('body')), protractor.Key.ESCAPE);
};

exports.clickEnter = function () {
  this.sendKeys(element(by.tagName('body')), protractor.Key.ENTER);
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

exports.expectInputCheckbox = function (elem, value) {
  return this.wait(elem).then(function () {
    return browser.wait(function () {
      log('Waiting for element to be checked: ' + elem.locator() + ' ' + value);
      var input = elem.element(by.xpath('..')).element(by.tagName('input'));
      return input.getAttribute('ng-model').then(function (ngModel) {
        // Have to navigate up out of the isolated scope from cs-input
        return input.element(by.xpath('../..')).evaluate(ngModel).then(function (_value) {
          return value === _value;
        });
      });
    }, TIMEOUT, 'Waiting for input checkbox to be ' + value + ': ' + elem.locator());
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
  var searchCount = _searchCount || 1;

  exports.click(exports.searchbox);
  exports.clear(exports.searchField);
  if (query) {
    exports.sendKeys(exports.searchField, query + protractor.Key.ENTER);
    exports.expectValueToBeSet(exports.searchField, query, TIMEOUT);
    exports.waitForSpinner();
  }

  if (searchCount > -1) {
    browser.wait(EC.textToBePresentInElement(element(by.css('.searchfilter li:first-child .count')), searchCount), TIMEOUT, 'Waiting for ' + searchCount + ' search result');
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
    value = value.replace(/(\d{3})(\d{3})(\d{4})/, '1 ($1) $2-$3');
  } else if (vLength === 11) {
    value = value.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
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

exports.dragAndDrop = function (elem, target) {
  this.expectIsDisplayed(elem);
  this.expectIsDisplayed(target);
  browser.actions().mouseMove(elem).perform();
  this.highlightElement(elem);
  browser.actions().mouseDown().mouseMove(target).perform();
  this.highlightElement(target);
  browser.actions().mouseUp().perform();
}

exports.highlightElement = function (elem) {
  log('highlighting element:' + elem.locator());
  return browser.driver.executeScript("arguments[0].setAttribute('style', arguments[1]);", elem.getWebElement(), 'color: Red; border: 2px solid red;')
    .then(function () {
      return elem;
    }, function (error) {
      console.log('Error occurred while highlighting element:' + error);
    });
};

function switchToWindow(handleIndex) {
  return browser.wait(function () {
    return browser.getAllWindowHandles().then(function (handles) {
      if (handles && handles.length > handleIndex) {
        var newWindow = handles[handleIndex];
        browser.switchTo().window(newWindow);
        return true;
      } else {
        return false;
      }
    });
  }, 40000, 'Waiting for window');
}

exports.switchToNewWindow = function () {
  return switchToWindow(1);
};

exports.switchToOriginalWindow = function () {
  return switchToWindow(0);
};

exports.closeAndSwitchToOriginalWindow = function () {
  browser.close();
  return this.switchToOriginalWindow();
}

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
    });
  }
};

exports.quickDeleteUser = function (bFirst, name) {
  if (bFirst) {
    this.search(name, -1);
  }

  return exports.waitUntilElemIsPresent(users.userListAction, 2000).then(function () {
    exports.click(users.userListAction);
    exports.click(users.deleteUserOption);
    exports.expectIsDisplayed(users.deleteUserModal);
    exports.click(users.deleteUserButton);
    notifications.assertSuccess(name, 'deleted successfully');
    exports.waitForSpinner();
    return true;
  }, function () {
    log('user is not preset');
    return false;
  });
};

exports.waitUntilElemIsPresent = function (elem, timeout) {
  return exports.wait(elem, timeout).then(function () {
    return elem.isDisplayed();
  })
};


exports.waitForModal = function () {
  return this.wait(element(by.css('.reveal-modal')));
};

exports.selectDropdown = function (dropdown, option) {
  this.click(element(by.css(dropdown + ' span.select-toggle')));
  this.click(element(by.cssContainingText(dropdown + ' .select-options a', option)));
};

exports.selectLastDropdown = function (dropdown, option) {
  this.click(element.all(by.css(dropdown + ' span.select-toggle')).last());
  this.click(element.all(by.cssContainingText(dropdown + ' .select-options a', option)).last());
};
