'use strict';

var testuser = {
  username: 'admin@int2.huron-alpha.com',
  password: 'Cisco123!'
};

xdescribe('Telephony Info', function () {
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
    users.addUsers.click();
    browser.wait(function () {
      return users.addUsersField.isPresent().then(function (present) {
        return present;
      });
    });

    users.addUsersField.clear();
    users.addUsersField.click();
    users.addUsersField.sendKeys(user);
    users.addUsersField.sendKeys(protractor.Key.ENTER);

    users.collabRadio1.click();

    browser.wait(function () {
      return users.squaredUCCheckBox.isPresent().then(function (present) {
        return present;
      });
    });

    users.squaredUCCheckBox.click();
    users.onboardButton.click();
    notifications.assertSuccess(user, 'added successfully');
    users.closeAddUsers.click();
    browser.sleep(3000);
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
          telephony.close.click();
          users.returnUser(user).click();
          browser.sleep(2000).then(function () {
            expect(telephony.telephonyPanel.isDisplayed()).toBeTruthy();
          });
          expect(telephony.directoryNumbers.count()).toBe(1);
        } else {
          expect(count).toBe(1);
        }
      });
    });

    it('should show directory number select', function () {
      telephony.directoryNumbers.first().all(by.css('span')).first().click();
      expect(telephony.internalNumber.isDisplayed()).toBeTruthy();
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
      telephony.forwardNoneRadio.click();
      expect(telephony.forwardAll.isDisplayed()).toBeFalsy();
      expect(telephony.forwardBusyNoAnswer.isDisplayed()).toBeFalsy();
      expect(telephony.forwardExternalCalls.isDisplayed()).toBeFalsy();
      telephony.saveButton.click();
      notifications.assertSuccess('Line configuration saved successfully');

      telephony.voicemailFeature.click();
      telephony.primary.click();
      browser.wait(function () {
        return telephony.forwardNoneRadio.isPresent().then(function (present) {
          return present;
        });
      });
      expect(telephony.forwardAll.isDisplayed()).toBeFalsy();
      expect(telephony.forwardBusyNoAnswer.isDisplayed()).toBeFalsy();
      expect(telephony.forwardExternalCalls.isDisplayed()).toBeFalsy();
    });

    it('should save call forward all to voicemail', function () {
      browser.wait(function () {
        return telephony.forwardAllRadio.isPresent().then(function (present) {
          return present;
        });
      });
      telephony.forwardAllRadio.click();
      expect(telephony.forwardAll.isDisplayed()).toBeTruthy();
      expect(telephony.forwardBusyNoAnswer.isDisplayed()).toBeFalsy();
      expect(telephony.forwardExternalCalls.isDisplayed()).toBeFalsy();
      telephony.selectOption(telephony.forwardAll, dropdownVariables.voicemail);
      telephony.saveButton.click();
      notifications.assertSuccess('Line configuration saved successfully');

      telephony.voicemailFeature.click();
      telephony.primary.click();
      browser.wait(function () {
        return telephony.forwardAllRadio.isPresent().then(function (present) {
          return present;
        });
      });
      expect(telephony.forwardAll.isDisplayed()).toBeTruthy();
      expect(telephony.forwardBusyNoAnswer.isDisplayed()).toBeFalsy();
      expect(telephony.forwardAll.element(by.css('input')).getAttribute('value')).toEqual(dropdownVariables.voicemail);
    });

    it('should save call forward all to an outside number', function () {
      telephony.selectOption(telephony.forwardAll, dropdownVariables.addNew);
      telephony.setNumber(telephony.forwardAll, snrLine);
      telephony.saveButton.click();
      notifications.assertSuccess('Line configuration saved successfully');

      telephony.voicemailFeature.click();
      telephony.primary.click();
      browser.wait(function () {
        return telephony.forwardAllRadio.isPresent().then(function (present) {
          return present;
        });
      });
      expect(telephony.forwardAll.element(by.css('input')).getAttribute('value')).toEqual(snrLine);
    });

    it('should save call forward busy/no answer to voicemail', function () {
      telephony.directoryNumbers.first().click();
      telephony.forwardBusyNoAnswerRadio.click();
      expect(telephony.forwardAll.isDisplayed()).toBeFalsy();
      expect(telephony.forwardBusyNoAnswer.isDisplayed()).toBeTruthy();
      expect(telephony.forwardExternalCalls.isDisplayed()).toBeTruthy();

      telephony.selectOption(telephony.forwardBusyNoAnswer, dropdownVariables.voicemail);
      telephony.saveButton.click();
      notifications.assertSuccess('Line configuration saved successfully');

      telephony.voicemailFeature.click();
      telephony.primary.click();
      browser.wait(function () {
        return telephony.forwardBusyNoAnswerRadio.isPresent().then(function (present) {
          return present;
        });
      });
      expect(telephony.forwardAll.isDisplayed()).toBeFalsy();
      expect(telephony.forwardBusyNoAnswer.isDisplayed()).toBeTruthy();
      expect(telephony.forwardExternalCalls.isDisplayed()).toBeTruthy();
      expect(telephony.forwardBusyNoAnswer.element(by.css('input')).getAttribute('value')).toEqual(dropdownVariables.voicemail);
    });

    it('should save call forward busy/no answer to an outside number', function () {
      telephony.directoryNumbers.first().click();
      telephony.forwardBusyNoAnswerRadio.click();
      expect(telephony.forwardAll.isDisplayed()).toBeFalsy();
      expect(telephony.forwardBusyNoAnswer.isDisplayed()).toBeTruthy();
      expect(telephony.forwardExternalCalls.isDisplayed()).toBeTruthy();

      telephony.selectOption(telephony.forwardBusyNoAnswer, dropdownVariables.addNew);
      telephony.setNumber(telephony.forwardBusyNoAnswer, snrLine);
      telephony.saveButton.click();
      notifications.assertSuccess('Line configuration saved successfully');

      telephony.voicemailFeature.click();
      telephony.primary.click();
      browser.wait(function () {
        return telephony.forwardBusyNoAnswerRadio.isPresent().then(function (present) {
          return present;
        });
      });
      expect(telephony.forwardAll.isDisplayed()).toBeFalsy();
      expect(telephony.forwardBusyNoAnswer.isDisplayed()).toBeTruthy();
      expect(telephony.forwardExternalCalls.isDisplayed()).toBeTruthy();
      expect(telephony.forwardBusyNoAnswer.element(by.css('input')).getAttribute('value')).toEqual(snrLine);
    });

    it('should save external call forwarding to voicemail', function () {
      expect(telephony.forwardExternalBusyNoAnswer.isDisplayed()).toBeFalsy();
      telephony.forwardExternalCalls.click();

      expect(telephony.forwardExternalBusyNoAnswer.isDisplayed()).toBeTruthy();
      telephony.selectOption(telephony.forwardExternalBusyNoAnswer, dropdownVariables.voicemail);
      telephony.saveButton.click();
      notifications.assertSuccess('Line configuration saved successfully');

      telephony.voicemailFeature.click();
      telephony.primary.click();
      browser.wait(function () {
        return telephony.forwardBusyNoAnswerRadio.isPresent().then(function (present) {
          return present;
        });
      });
      expect(telephony.forwardExternalBusyNoAnswer.isDisplayed()).toBeTruthy();
      expect(telephony.forwardExternalBusyNoAnswer.element(by.css('input')).getAttribute('value')).toEqual(dropdownVariables.voicemail);
    });

    it('should save external call forwarding to an outside number', function () {
      expect(telephony.forwardExternalBusyNoAnswer.isDisplayed()).toBeTruthy();
      telephony.selectOption(telephony.forwardExternalBusyNoAnswer, dropdownVariables.addNew);
      telephony.setNumber(telephony.forwardExternalBusyNoAnswer, externalCFLine);
      telephony.saveButton.click();
      notifications.assertSuccess('Line configuration saved successfully');

      telephony.voicemailFeature.click();
      telephony.primary.click();
      browser.wait(function () {
        return telephony.forwardBusyNoAnswerRadio.isPresent().then(function (present) {
          return present;
        });
      });
      expect(telephony.forwardExternalBusyNoAnswer.isDisplayed()).toBeTruthy();
      expect(telephony.forwardExternalBusyNoAnswer.element(by.css('input')).getAttribute('value')).toEqual(externalCFLine);
    });

    it('should change caller id to custom display', function () {
      expect(telephony.callerIdDefault.isDisplayed()).toBeTruthy();
      expect(telephony.callerIdCustom.isDisplayed()).toBeTruthy();
      expect(telephony.callerId.isEnabled()).toBeFalsy();

      // use mousemove to force clicking the radio button regardless of overlaid <span>
      browser.actions().mouseMove(telephony.callerIdCustom, 50, 50).click().perform();
      expect(telephony.callerId.isEnabled()).toBeTruthy();
      telephony.callerId.sendKeys(user);
      telephony.saveButton.click();
      notifications.assertSuccess('Line configuration saved successfully');

      telephony.directoryNumbers.first().click();
      expect(telephony.callerId.isEnabled()).toBeTruthy();
      expect(telephony.callerId.getAttribute('value')).toEqual(user);
    });

    it('should change caller id to default display', function () {
      expect(telephony.callerIdDefault.isDisplayed()).toBeTruthy();
      expect(telephony.callerIdCustom.isDisplayed()).toBeTruthy();
      expect(telephony.callerId.isEnabled()).toBeTruthy()

      // use mousemove to force clicking the radio button regardless of overlaid <span>
      browser.actions().mouseMove(telephony.callerIdDefault, 50, 50).click().perform();
      expect(telephony.callerId.isEnabled()).toBeFalsy();
      telephony.saveButton.click();
      notifications.assertSuccess('Line configuration saved successfully');

      telephony.directoryNumbers.first().click();
      expect(telephony.callerId.isEnabled()).toBeFalsy();
    });

    it('should cancel a new directory number add', function () {
      expect(telephony.threeDotButton.isDisplayed()).toBeTruthy();
      telephony.threeDotButton.click();
      expect(telephony.addNewLine.isDisplayed()).toBeTruthy();
      telephony.addNewLine.click();
      expect(telephony.internalNumber.isDisplayed).toBeTruthy();
      var number = telephony.verifyNewNumber();
      telephony.primary.click();
      var primaryNum = telephony.verifyExistingNumber();
      expect(number).not.toEqual(primaryNum);
      expect(element(by.cssContainingText('span', number)).isPresent()).toBeFalsy();
    });

    it('should add a new directory number', function () {
      expect(telephony.threeDotButton.isDisplayed()).toBeTruthy();
      telephony.threeDotButton.click();
      expect(telephony.addNewLine.isDisplayed()).toBeTruthy();
      telephony.addNewLine.click();
      expect(telephony.internalNumber.isDisplayed).toBeTruthy();
      telephony.internalNumber.click();
      telephony.verifyNewNumber().then(function (number) {
        telephony.forwardBusyNoAnswerRadio.click();
        telephony.selectOption(telephony.forwardBusyNoAnswer, dropdownVariables.addNew);
        telephony.setNumber(telephony.forwardBusyNoAnswer, snrLine);
        expect(telephony.removeButton.isPresent()).toBeFalsy();
        telephony.saveButton.click();
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
        telephony.internalNumber.click();
        telephony.internalNumber.all(by.css('option')).get(1).click();
        telephony.saveButton.click();
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
      telephony.externalNumber.click();
      telephony.externalNumber.all(by.css('option')).get(1).click();
      var extNumber = '';
      telephony.externalNumber.element(by.css('option:checked')).getText().then(function (text) {
        extNumber = text;
      });
      telephony.saveButton.click();
      notifications.assertSuccess('Line configuration saved successfully');

      telephony.verifyExistingNumber().then(function (number) {
        telephony.primary.click();
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
      telephony.removeButton.click();
      telephony.cancelDisassociation.click();

      telephony.verifyExistingNumber().then(function (number) {
        var numberElement = element.all(by.cssContainingText('span', number));
        browser.wait(function () {
          return numberElement.count().then(function (count) {
            return count > 0;
          });
        });
        telephony.primary.click();
        numberElement.first().click();
      });
      expect(telephony.removeButton.isPresent()).toBeTruthy();
    });

    it('should delete the non-primary number', function () {
      expect(telephony.removeButton.isPresent()).toBeTruthy();
      telephony.removeButton.click();
      telephony.disassociateLine.click();
      notifications.assertSuccess('Line successfully unassigned from user');

      browser.sleep(2000);
      expect(telephony.telephonyPanel.isDisplayed()).toBeTruthy();
      expect(telephony.directoryNumbers.count()).toBe(1);
    });
  });

  describe('Voicemail', function () {

    it('should save the disabled state', function () {
      telephony.voicemailFeature.click();

      expect(telephony.voicemailStatus.getText()).toEqual('On');
      expect(utils.getSwitchState(telephony.voicemailSwitch)).toBeTruthy();

      utils.disableSwitch(telephony.voicemailSwitch);
      telephony.saveButton.click();
      notifications.assertSuccess('Voicemail configuration saved successfully');

      expect(telephony.voicemailStatus.getText()).toEqual('Off');
      expect(utils.getSwitchState(telephony.voicemailSwitch)).toBeFalsy();
    });

    it('should save the enabled state', function () {
      telephony.voicemailFeature.click();

      expect(telephony.voicemailStatus.getText()).toEqual('Off');
      expect(utils.getSwitchState(telephony.voicemailSwitch)).toBeFalsy();

      utils.enableSwitch(telephony.voicemailSwitch);
      telephony.saveButton.click();
      notifications.assertSuccess('Voicemail configuration saved successfully');

      expect(telephony.voicemailStatus.getText()).toEqual('On');
      expect(utils.getSwitchState(telephony.voicemailSwitch)).toBeTruthy();
    });
  });

  describe('Single Number Reach', function () {

    it('should save the enabled state', function () {
      telephony.snrFeature.click();
      expect(utils.getSwitchState(telephony.snrSwitch)).toBeFalsy();
      expect(telephony.snrNumber.isDisplayed()).toBeFalsy();

      utils.enableSwitch(telephony.snrSwitch);
      expect(telephony.snrNumber.isDisplayed()).toBeTruthy();

      telephony.snrNumber.sendKeys(snrLine);
      telephony.saveButton.click();
      notifications.assertSuccess('Single Number Reach configuration saved successfully');

      expect(utils.getSwitchState(telephony.snrSwitch)).toBeTruthy();
      expect(telephony.snrStatus.getText()).toEqual('On');
    });

    it('should save the disabled state', function () {
      telephony.snrFeature.click();
      expect(telephony.snrNumber.isDisplayed()).toBeTruthy();
      expect(telephony.snrNumber.isDisplayed()).toBeTruthy();

      utils.disableSwitch(telephony.snrSwitch);
      expect(telephony.snrNumber.isDisplayed()).toBeFalsy();

      telephony.saveButton.click();
      notifications.assertSuccess('Single Number Reach configuration removed successfully');

      expect(utils.getSwitchState(telephony.snrSwitch)).toBeFalsy();
      expect(telephony.snrStatus.getText()).toEqual('Off');
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
