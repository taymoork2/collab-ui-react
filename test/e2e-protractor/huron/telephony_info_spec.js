'use strict';

var testuser = {
  username: 'admin@int1.huron-alpha.com',
  password: 'Cisco123!'
};

xdescribe('Telephony Info', function () {
  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  var currentUser;
  var user = utils.randomTestGmail();
  var dropdownVariables = {
    voicemail: 'Voicemail',
    addNew: 'Add New'
  };
  var snrLine = Math.ceil(Math.random() * Math.pow(10, 10)).toString();
  var externalCFLine = Math.ceil(Math.random() * Math.pow(10, 10)).toString();

  it('should login', function () {
    login.login(testuser.username, testuser.password);
  });

  it('clicking on users tab should change the view', function () {
    navigation.clickUsers();
  });

  it('should create user', function () {
    utils.click(users.addUsers);
    browser.wait(function () {
      return users.addUsersField.isPresent().then(function (present) {
        return present;
      });
    });

    users.addUsersField.clear();
    utils.click(users.addUsersField);
    users.addUsersField.sendKeys(user);
    users.addUsersField.sendKeys(protractor.Key.ENTER);

    utils.click(users.collabRadio1);

    browser.wait(function () {
      return users.squaredUCCheckBox.isPresent().then(function (present) {
        return present;
      });
    });

    utils.click(users.squaredUCCheckBox);
    utils.click(users.onboardButton);
    notifications.assertSuccess(user, 'added successfully');
    utils.click(users.closeAddUsers);

  });

  it('should verify added user', function () {
    utils.search(user);
    users.returnUser(user).click();
    element(by.binding('currentUser.userName')).evaluate('currentUser').then(function (_currentUser) {
      currentUser = _currentUser;
      expect(currentUser).not.toBeNull();
    });
  });

  describe('Directory Numbers', function () {
    it('should have a primary directory number', function () {
      telephony.directoryNumbers.count().then(function (count) {
        if (count > 1) {
          utils.click(telephony.close);
          users.returnUser(user).click();
          browser.sleep(2000).then(function () {
            utils.expectIsDisplayed(telephony.telephonyPanel);
          });
          expect(telephony.directoryNumbers.count()).toBe(1);
        } else {
          expect(count).toBe(1);
        }
      });
    });

    it('should show directory number select', function () {
      telephony.directoryNumbers.first().all(by.css('span')).first().click();
      utils.expectIsDisplayed(telephony.internalNumber);
    });

    it('should not display remove button for primary line', function () {
      expect(telephony.removeButton.isPresent()).toBeFalsy();
    });

    it('should save call forward none selection', function () {
      browser.wait(function () {
        return telephony.forwardNoneRadio.isPresent().then(function (present) {
          return present;
        });
      });
      utils.click(telephony.forwardNoneRadio);
      utils.expectIsNotDisplayed(telephony.forwardAll);
      utils.expectIsNotDisplayed(telephony.forwardBusyNoAnswer);
      utils.expectIsNotDisplayed(telephony.forwardExternalCalls);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      utils.click(telephony.voicemailFeature);
      utils.click(telephony.primary);
      browser.wait(function () {
        return telephony.forwardNoneRadio.isPresent().then(function (present) {
          return present;
        });
      });
      utils.expectIsNotDisplayed(telephony.forwardAll);
      utils.expectIsNotDisplayed(telephony.forwardBusyNoAnswer);
      utils.expectIsNotDisplayed(telephony.forwardExternalCalls);
    });

    it('should save call forward all to voicemail', function () {
      browser.wait(function () {
        return telephony.forwardAllRadio.isPresent().then(function (present) {
          return present;
        });
      });
      utils.click(telephony.forwardAllRadio);
      utils.expectIsDisplayed(telephony.forwardAll);
      utils.expectIsNotDisplayed(telephony.forwardBusyNoAnswer);
      utils.expectIsNotDisplayed(telephony.forwardExternalCalls);
      telephony.selectOption(telephony.forwardAll, dropdownVariables.voicemail);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      utils.click(telephony.voicemailFeature);
      utils.click(telephony.primary);
      browser.wait(function () {
        return telephony.forwardAllRadio.isPresent().then(function (present) {
          return present;
        });
      });
      utils.expectIsDisplayed(telephony.forwardAll);
      utils.expectIsNotDisplayed(telephony.forwardBusyNoAnswer);
      expect(telephony.forwardAll.element(by.css('input')).getAttribute('value')).toEqual(dropdownVariables.voicemail);
    });

    it('should save call forward all to an outside number', function () {
      telephony.selectOption(telephony.forwardAll, dropdownVariables.addNew);
      telephony.setNumber(telephony.forwardAll, snrLine);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      utils.click(telephony.voicemailFeature);
      utils.click(telephony.primary);
      browser.wait(function () {
        return telephony.forwardAllRadio.isPresent().then(function (present) {
          return present;
        });
      });
      expect(telephony.forwardAll.element(by.css('input')).getAttribute('value')).toEqual(snrLine);
    });

    it('should save call forward busy/no answer to voicemail', function () {
      telephony.directoryNumbers.first().click();
      utils.click(telephony.forwardBusyNoAnswerRadio);
      utils.expectIsNotDisplayed(telephony.forwardAll);
      utils.expectIsDisplayed(telephony.forwardBusyNoAnswer);
      utils.expectIsDisplayed(telephony.forwardExternalCalls);

      telephony.selectOption(telephony.forwardBusyNoAnswer, dropdownVariables.voicemail);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      utils.click(telephony.voicemailFeature);
      utils.click(telephony.primary);
      browser.wait(function () {
        return telephony.forwardBusyNoAnswerRadio.isPresent().then(function (present) {
          return present;
        });
      });
      utils.expectIsNotDisplayed(telephony.forwardAll);
      utils.expectIsDisplayed(telephony.forwardBusyNoAnswer);
      utils.expectIsDisplayed(telephony.forwardExternalCalls);
      expect(telephony.forwardBusyNoAnswer.element(by.css('input')).getAttribute('value')).toEqual(dropdownVariables.voicemail);
    });

    it('should save call forward busy/no answer to an outside number', function () {
      telephony.directoryNumbers.first().click();
      utils.click(telephony.forwardBusyNoAnswerRadio);
      utils.expectIsNotDisplayed(telephony.forwardAll);
      utils.expectIsDisplayed(telephony.forwardBusyNoAnswer);
      utils.expectIsDisplayed(telephony.forwardExternalCalls);

      telephony.selectOption(telephony.forwardBusyNoAnswer, dropdownVariables.addNew);
      telephony.setNumber(telephony.forwardBusyNoAnswer, snrLine);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      utils.click(telephony.voicemailFeature);
      utils.click(telephony.primary);
      browser.wait(function () {
        return telephony.forwardBusyNoAnswerRadio.isPresent().then(function (present) {
          return present;
        });
      });
      utils.expectIsNotDisplayed(telephony.forwardAll);
      utils.expectIsDisplayed(telephony.forwardBusyNoAnswer);
      utils.expectIsDisplayed(telephony.forwardExternalCalls);
      expect(telephony.forwardBusyNoAnswer.element(by.css('input')).getAttribute('value')).toEqual(snrLine);
    });

    it('should save external call forwarding to voicemail', function () {
      utils.expectIsNotDisplayed(telephony.forwardExternalBusyNoAnswer);
      utils.click(telephony.forwardExternalCalls);

      utils.expectIsDisplayed(telephony.forwardExternalBusyNoAnswer);
      telephony.selectOption(telephony.forwardExternalBusyNoAnswer, dropdownVariables.voicemail);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      utils.click(telephony.voicemailFeature);
      utils.click(telephony.primary);
      browser.wait(function () {
        return telephony.forwardBusyNoAnswerRadio.isPresent().then(function (present) {
          return present;
        });
      });
      utils.expectIsDisplayed(telephony.forwardExternalBusyNoAnswer);
      expect(telephony.forwardExternalBusyNoAnswer.element(by.css('input')).getAttribute('value')).toEqual(dropdownVariables.voicemail);
    });

    it('should save external call forwarding to an outside number', function () {
      utils.expectIsDisplayed(telephony.forwardExternalBusyNoAnswer);
      telephony.selectOption(telephony.forwardExternalBusyNoAnswer, dropdownVariables.addNew);
      telephony.setNumber(telephony.forwardExternalBusyNoAnswer, externalCFLine);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      utils.click(telephony.voicemailFeature);
      utils.click(telephony.primary);
      browser.wait(function () {
        return telephony.forwardBusyNoAnswerRadio.isPresent().then(function (present) {
          return present;
        });
      });
      utils.expectIsDisplayed(telephony.forwardExternalBusyNoAnswer);
      expect(telephony.forwardExternalBusyNoAnswer.element(by.css('input')).getAttribute('value')).toEqual(externalCFLine);
    });

    it('should change caller id to custom display', function () {
      utils.expectIsDisplayed(telephony.callerIdDefault);
      utils.expectIsDisplayed(telephony.callerIdCustom);
      expect(telephony.callerId.isEnabled()).toBeFalsy();

      // use mousemove to force clicking the radio button regardless of overlaid <span>
      browser.actions().mouseMove(telephony.callerIdCustom, 50, 50).click().perform();
      expect(telephony.callerId.isEnabled()).toBeTruthy();
      telephony.callerId.sendKeys(user);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      telephony.directoryNumbers.first().click();
      expect(telephony.callerId.isEnabled()).toBeTruthy();
      expect(telephony.callerId.getAttribute('value')).toEqual(user);
    });

    it('should change caller id to default display', function () {
      utils.expectIsDisplayed(telephony.callerIdDefault);
      utils.expectIsDisplayed(telephony.callerIdCustom);
      expect(telephony.callerId.isEnabled()).toBeTruthy();

      // use mousemove to force clicking the radio button regardless of overlaid <span>
      browser.actions().mouseMove(telephony.callerIdDefault, 50, 50).click().perform();
      expect(telephony.callerId.isEnabled()).toBeFalsy();
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      telephony.directoryNumbers.first().click();
      expect(telephony.callerId.isEnabled()).toBeFalsy();
    });

    it('should cancel a new directory number add', function () {
      utils.expectIsDisplayed(telephony.threeDotButton);
      utils.click(telephony.threeDotButton);
      utils.expectIsDisplayed(telephony.addNewLine);
      utils.click(telephony.addNewLine);
      expect(telephony.internalNumber.isDisplayed).toBeTruthy();
      var number = telephony.verifyNewNumber();
      utils.click(telephony.primary);
      var primaryNum = telephony.verifyExistingNumber();
      expect(number).not.toEqual(primaryNum);
      expect(element(by.cssContainingText('span', number)).isPresent()).toBeFalsy();
    });

    it('should add a new directory number', function () {
      utils.expectIsDisplayed(telephony.threeDotButton);
      utils.click(telephony.threeDotButton);
      utils.expectIsDisplayed(telephony.addNewLine);
      utils.click(telephony.addNewLine);
      expect(telephony.internalNumber.isDisplayed).toBeTruthy();
      utils.click(telephony.internalNumber);
      telephony.verifyNewNumber().then(function (number) {
        utils.click(telephony.forwardBusyNoAnswerRadio);
        telephony.selectOption(telephony.forwardBusyNoAnswer, dropdownVariables.addNew);
        telephony.setNumber(telephony.forwardBusyNoAnswer, snrLine);
        expect(telephony.removeButton.isPresent()).toBeFalsy();
        utils.click(telephony.saveButton);
        notifications.assertSuccess('Line configuration saved successfully');

        var numberElement = element.all(by.cssContainingText('span', number));
        browser.wait(function () {
          return numberElement.count().then(function (count) {
            return count > 0;
          });
        });
        expect(telephony.removeButton.isPresent()).toBeTruthy();
        expect(numberElement.first().isDisplayed()).toBeTruthy();
        telephony.directoryNumbers.get(1).click();
        telephony.verifyExistingNumber().then(function (verificationNumber) {
          expect(number).toEqual(verificationNumber);
          expect(element(by.cssContainingText('span', number)).isPresent()).toBeTruthy();
        });
      });
    });

    it('should update directory number', function () {
      telephony.verifyExistingNumber().then(function (number) {
        utils.click(telephony.internalNumber);
        telephony.internalNumber.all(by.css('option')).get(1).click();
        utils.click(telephony.saveButton);
        notifications.assertSuccess('Line configuration saved successfully');

        telephony.directoryNumbers.get(1).click();
        telephony.verifyExistingNumber().then(function (newNumber) {
          expect(number).not.toEqual(newNumber);
          expect(element(by.cssContainingText('span', number)).isPresent()).toBeFalsy();
          expect(element(by.cssContainingText('span', newNumber)).isPresent()).toBeTruthy();
        });
      });
    });

    it('should save adding an external number', function () {
      utils.click(telephony.externalNumber);
      telephony.externalNumber.all(by.css('option')).get(1).click();
      var extNumber = '';
      telephony.externalNumber.element(by.css('option:checked')).getText().then(function (text) {
        extNumber = text;
      });
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Line configuration saved successfully');

      telephony.verifyExistingNumber().then(function (number) {
        utils.click(telephony.primary);
        element.all(by.cssContainingText('span', number)).first().click();
      });
      var verifyNumber = '';
      telephony.externalNumber.element(by.css('option:checked')).getText().then(function (text) {
        verifyNumber = text;
      });
      expect(extNumber).toEqual(verifyNumber);
    });

    it('should cancel deleting the non-primary number', function () {
      expect(telephony.removeButton.isPresent()).toBeTruthy();
      utils.click(telephony.removeButton);
      utils.click(telephony.cancelDisassociation);

      telephony.verifyExistingNumber().then(function (number) {
        var numberElement = element.all(by.cssContainingText('span', number));
        browser.wait(function () {
          return numberElement.count().then(function (count) {
            return count > 0;
          });
        });
        utils.click(telephony.primary);
        numberElement.first().click();
      });
      expect(telephony.removeButton.isPresent()).toBeTruthy();
    });

    it('should delete the non-primary number', function () {
      expect(telephony.removeButton.isPresent()).toBeTruthy();
      utils.click(telephony.removeButton);
      utils.click(telephony.disassociateLine);
      notifications.assertSuccess('Line successfully unassigned from user');

      utils.expectIsDisplayed(telephony.telephonyPanel);
      expect(telephony.directoryNumbers.count()).toBe(1);
    });
  });

  describe('Voicemail', function () {

    it('should save the disabled state', function () {
      utils.click(telephony.voicemailFeature);

      utils.expectText(telephony.voicemailStatus, 'On');
      expect(utils.getSwitchState(telephony.voicemailSwitch)).toBeTruthy();

      utils.disableSwitch(telephony.voicemailSwitch);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Voicemail configuration saved successfully');

      utils.expectText(telephony.voicemailStatus, 'Off');
      expect(utils.getSwitchState(telephony.voicemailSwitch)).toBeFalsy();
    });

    it('should save the enabled state', function () {
      utils.click(telephony.voicemailFeature);

      utils.expectText(telephony.voicemailStatus, 'Off');
      expect(utils.getSwitchState(telephony.voicemailSwitch)).toBeFalsy();

      utils.enableSwitch(telephony.voicemailSwitch);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Voicemail configuration saved successfully');

      utils.expectText(telephony.voicemailStatus, 'On');
      expect(utils.getSwitchState(telephony.voicemailSwitch)).toBeTruthy();
    });
  });

  describe('Single Number Reach', function () {

    it('should save the enabled state', function () {
      utils.click(telephony.snrFeature);
      expect(utils.getSwitchState(telephony.snrSwitch)).toBeFalsy();
      utils.expectIsNotDisplayed(telephony.snrNumber);

      utils.enableSwitch(telephony.snrSwitch);
      utils.expectIsDisplayed(telephony.snrNumber);

      telephony.snrNumber.sendKeys(snrLine);
      utils.click(telephony.saveButton);
      notifications.assertSuccess('Single Number Reach configuration saved successfully');

      expect(utils.getSwitchState(telephony.snrSwitch)).toBeTruthy();
      utils.expectText(telephony.snrStatus, 'On');
    });

    it('should save the disabled state', function () {
      utils.click(telephony.snrFeature);
      utils.expectIsDisplayed(telephony.snrNumber);
      utils.expectIsDisplayed(telephony.snrNumber);

      utils.disableSwitch(telephony.snrSwitch);
      utils.expectIsNotDisplayed(telephony.snrNumber);

      utils.click(telephony.saveButton);
      notifications.assertSuccess('Single Number Reach configuration removed successfully');

      expect(utils.getSwitchState(telephony.snrSwitch)).toBeFalsy();
      utils.expectText(telephony.snrStatus, 'Off');
    });
  });

  it('should delete added user', function () {
    expect(deleteUtils.deleteSquaredUCUser(currentUser.meta.organizationID, currentUser.id, currentUser.userName)).toEqual(204);
    expect(deleteUtils.deleteUser(user)).toEqual(200);
  });

  it('should log out', function () {
    navigation.logout();
  });
});
