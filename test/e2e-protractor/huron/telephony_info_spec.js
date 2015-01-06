'use strict';

var testuser = {
  username: 'admin@uc.e2e.huron-alpha.com',
  password: 'C1sco123!'
};

var user = "squaredUcTestUser@uc.e2e.huron-alpha.com";

var dropdownVariables = {
  voicemail: 'Voicemail',
  addNew: 'Add New'
};

var snrLine = '2145555555';

var numberText = {
  first: '4039',
  second: '4040'
};

xdescribe('Telephony Info', function() {
  it('should login', function(){
    login.login(testuser.username,testuser.password);
  });

  describe('Initial Setup', function(){
    // verify everything is in the default state for the tests, or return to the default state
    afterEach( function() {
      // set voicemail to 'On' if it is 'Off'
      telephony.voicemailStatus.getText().then(function(text) {
        if (text === 'Off') {
          telephony.voicemailFeature.click();
          // use mousemove to force clicking the radio button regardless of overlaid tag
          browser.actions().mouseMove(telephony.voicemailSwitch, 50, 50).click().perform();
          telephony.saveButton.click();
          notifications.assertSuccess('Voicemail configuration saved successfully');
          expect(telephony.voicemailStatus.getText()).toEqual('On');
        }
      });

      // set snr to 'Off' if it is 'On'
      telephony.snrStatus.getText().then(function(text){
        if (text === 'On') {
          telephony.snrFeature.click();
          // use mousemove to force clicking the radio button regardless of overlaid tag
          browser.actions().mouseMove(telephony.snrSwitch, 50, 50).click().perform();
          telephony.saveButton.click();
          notifications.assertSuccess('Single Number Reach configuration removed successfully');
          expect(telephony.snrStatus.getText()).toEqual('Off');
        }
      });

      // delete any lines other than the primary line
      element(by.binding('currentUser.title')).evaluate('currentUser').then(function(currentUser){
        element(by.cssContainingText('span', numberText.first)).isPresent().then(function(present){
          if(present){
            expect(deleteUtils.deleteDirectoryNumber(currentUser.meta.organizationID, currentUser.id,numberText.first)).toEqual(204);
            browser.sleep(10000);
          }
        });
        element(by.cssContainingText('span', numberText.second)).isPresent().then(function(present){
          if(present){
            expect(deleteUtils.deleteDirectoryNumber(currentUser.meta.organizationID, currentUser.id,numberText.second)).toEqual(204);
            browser.sleep(10000);
          }
        });
      });
    });

    it('should navigate to user', function() {
      navigation.clickUsers();
      users.search(user,0);
      users.returnUser(user).click();
      browser.sleep(2000).then(function(){
        expect(telephony.telephonyPanel.isDisplayed()).toBeTruthy();
      });
    });
  });

  describe('Directory Numbers', function(){
    it('should have a primary directory number', function() {
      telephony.directoryNumbers.count().then(function(count) {
        if (count > 1) {
          telephony.close.click();
          users.returnUser(user).click();
          browser.sleep(2000).then(function(){
            expect(telephony.telephonyPanel.isDisplayed()).toBeTruthy();
          });
          expect(telephony.directoryNumbers.count()).toBe(1);
        } else {
          expect(count).toBe(1);
        }
      });
    });

    it('should show directory number select', function(){
      telephony.directoryNumbers.first().all(by.css('span')).first().click();
      expect(telephony.directoryNumberSelect.isDisplayed).toBeTruthy();
    });

    it('should save call forward all to voicemail', function(){
      browser.wait(function(){
        return telephony.forwardAllRadio.isPresent().then(function(present){
          return present;
        });
      }).then(function(){
        telephony.forwardAllRadio.click();
        expect(telephony.forwardAll.isDisplayed()).toBeTruthy();
        expect(telephony.forwardBusy.isDisplayed()).toBeFalsy();
        expect(telephony.forwardAway.isDisplayed()).toBeFalsy();
        expect(telephony.forwardExternalCalls.isDisplayed()).toBeFalsy();
        telephony.selectOption(telephony.forwardAll, dropdownVariables.voicemail);
        telephony.saveButton.click();
        notifications.assertSuccess('Line configuration saved successfully');

        telephony.directoryNumbers.first().click();
        expect(telephony.forwardAll.isDisplayed()).toBeTruthy();
        expect(telephony.forwardBusy.isDisplayed()).toBeFalsy();
        expect(telephony.forwardAway.isDisplayed()).toBeFalsy();
        expect(telephony.forwardAll.element(by.css('input')).getAttribute('value')).toEqual(dropdownVariables.voicemail);
      });
    });

    it('should save call forward all to an outside number', function(){
        expect(telephony.forwardExternalCalls.isDisplayed()).toBeFalsy();
        telephony.selectOption(telephony.forwardAll, dropdownVariables.addNew);
        telephony.setNumber(telephony.forwardAll, snrLine);
        telephony.saveButton.click();
        notifications.assertSuccess('Line configuration saved successfully');

        telephony.voicemailFeature.click();
        element(by.cssContainingText('span', 'Primary')).click();
        browser.wait(function(){
          return telephony.forwardAllRadio.isPresent().then(function(present){
            return present;
          });
        }).then(function(){
          expect(telephony.forwardAll.isDisplayed()).toBeTruthy();
          expect(telephony.forwardBusy.isDisplayed()).toBeFalsy();
          expect(telephony.forwardAway.isDisplayed()).toBeFalsy();
          expect(telephony.forwardAll.element(by.css('input')).getAttribute('value')).toEqual(snrLine);
        });
    });

    it('should save call forward busy/away to voicemail', function(){
      telephony.directoryNumbers.first().click();
      telephony.forwardBusyAwayRadio.click();
      expect(telephony.forwardAll.isDisplayed()).toBeFalsy();
      expect(telephony.forwardBusy.isDisplayed()).toBeTruthy();
      expect(telephony.forwardAway.isDisplayed()).toBeTruthy();
      expect(telephony.forwardExternalCalls.isDisplayed()).toBeTruthy();

      telephony.selectOption(telephony.forwardBusy, dropdownVariables.voicemail);
      telephony.selectOption(telephony.forwardAway, dropdownVariables.voicemail);
      telephony.saveButton.click();
      notifications.assertSuccess('Line configuration saved successfully');

      telephony.directoryNumbers.first().click();
      expect(telephony.forwardAll.isDisplayed()).toBeFalsy();
      expect(telephony.forwardBusy.isDisplayed()).toBeTruthy();
      expect(telephony.forwardAway.isDisplayed()).toBeTruthy();
      expect(telephony.forwardExternalCalls.isDisplayed()).toBeTruthy();
      expect(telephony.forwardBusy.element(by.css('input')).getAttribute('value')).toEqual(dropdownVariables.voicemail);
      expect(telephony.forwardAway.element(by.css('input')).getAttribute('value')).toEqual(dropdownVariables.voicemail);
    });

    it('should save external call forwarding to voicemail', function(){
      expect(telephony.forwardExternalBusy.isDisplayed()).toBeFalsy();
      expect(telephony.forwardExternalAway.isDisplayed()).toBeFalsy();
      telephony.forwardExternalCalls.click();

      expect(telephony.forwardExternalBusy.isDisplayed()).toBeTruthy();
      expect(telephony.forwardExternalAway.isDisplayed()).toBeTruthy();
      telephony.selectOption(telephony.forwardExternalBusy, dropdownVariables.voicemail);
      telephony.selectOption(telephony.forwardExternalAway, dropdownVariables.voicemail);
      telephony.saveButton.click();
      notifications.assertSuccess('Line configuration saved successfully');
    });

    it('should change caller id to custom display', function(){
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

    it('should change caller id to default display', function(){
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

    it('should cancel a new directory number add', function(){
      expect(telephony.threeDotButton.isDisplayed()).toBeTruthy();
      telephony.threeDotButton.click();
      expect(telephony.addNewLine.isDisplayed()).toBeTruthy();
      telephony.addNewLine.click();
      expect(telephony.directoryNumberSelect.isDisplayed).toBeTruthy();
      var number = telephony.verifyNewNumber();
      telephony.directoryNumbers.first().click();
      var primary = telephony.verifyExistingNumber();
      expect(number).not.toEqual(primary);
      expect(element(by.cssContainingText('span', number)).isPresent()).toBeFalsy();
    });

    it('should add a new directory number', function(){
      expect(telephony.threeDotButton.isDisplayed()).toBeTruthy();
      telephony.threeDotButton.click();
      expect(telephony.addNewLine.isDisplayed()).toBeTruthy();
      telephony.addNewLine.click();
      expect(telephony.directoryNumberSelect.isDisplayed).toBeTruthy();
      telephony.internalNumber.click();
      telephony.internalNumber.element(by.cssContainingText('option',numberText.first)).click();
      telephony.verifyNewNumber().then(function(number){
        telephony.saveButton.click();
        notifications.assertSuccess('Line configuration saved successfully');

        var numberElement = element.all(by.cssContainingText('span', number));
        browser.wait(function() {
          return numberElement.count().then(function(count) {
            return count > 0;
          });
        }).then(function() {
          expect(numberElement.first().isDisplayed()).toBeTruthy();
          telephony.directoryNumbers.get(1).click();
          telephony.verifyExistingNumber().then(function(verificationNumber){
            expect(number).toEqual(verificationNumber);
            expect(element(by.cssContainingText('span', number)).isPresent()).toBeTruthy();
          });
        });
      });
    });

    it('should update directory number', function(){
      telephony.verifyExistingNumber().then(function(number){
        telephony.internalNumber.click();
        telephony.internalNumber.element(by.cssContainingText('option',numberText.second)).click();
        telephony.saveButton.click();
        notifications.assertSuccess('Line configuration saved successfully');

        telephony.directoryNumbers.get(1).click();
        telephony.verifyExistingNumber().then(function(newNumber){
          expect(number).not.toEqual(newNumber);
          expect(element(by.cssContainingText('span', number)).isPresent()).toBeFalsy();
          expect(element(by.cssContainingText('span', newNumber)).isPresent()).toBeTruthy();
        });
      });
    });

    it('should save adding an external number', function(){
      telephony.externalNumber.click();
      telephony.externalNumber.all(by.css('option')).get(1).click();
      var extNumber = '';
      telephony.externalNumber.element(by.css('option:checked')).getText().then(function(text){
        extNumber = text;
      });
      telephony.saveButton.click();
      notifications.assertSuccess('Line configuration saved successfully');

      telephony.directoryNumbers.get(1).click();
      var verifyNumber = '';
      telephony.externalNumber.element(by.css('option:checked')).getText().then(function(text){
        verifyNumber = text;
      });
      expect(extNumber).toEqual(verifyNumber);
    });

    it('should delete a directory number', function(){
      element(by.id('exit-details-btn')).click();
      users.returnUser(user).click();
      element(by.binding('currentUser.title')).evaluate('currentUser').then(function(currentUser){
        // checks for numberText.first in case there were errors during the directory number update
        element(by.cssContainingText('span', numberText.first)).isPresent().then(function(present){
          if(present){
            expect(deleteUtils.deleteDirectoryNumber(currentUser.meta.organizationID, currentUser.id,numberText.first)).toEqual(204);
            browser.sleep(10000);
          }
        });
        element(by.cssContainingText('span', numberText.second)).isPresent().then(function(present){
          if(present){
            expect(deleteUtils.deleteDirectoryNumber(currentUser.meta.organizationID, currentUser.id,numberText.second)).toEqual(204);
            browser.sleep(10000);
          }
        });
      });
    });
  });

  describe('Voicemail', function() {
    it('should click voicemail', function(){
      telephony.voicemailFeature.click();
      expect(telephony.voicemailSwitch.isPresent()).toBeTruthy();
    });

    it('should save the disabled state', function(){
      expect(telephony.voicemailStatus.getText()).toEqual('On');
      expect(telephony.voicemailSwitch.getAttribute('value')).toBeTruthy();
      // use mousemove to force clicking the radio button regardless of overlaid tag
      browser.actions().mouseMove(telephony.voicemailSwitch, 50, 50).click().perform();
      expect(telephony.voicemailSwitch.getAttribute('value')).toEqual('on');
      telephony.saveButton.click();
      notifications.assertSuccess('Voicemail configuration saved successfully');

      expect(telephony.voicemailStatus.getText()).toEqual('Off');
      telephony.voicemailFeature.click();
      expect(telephony.voicemailSwitch.getAttribute('value')).toEqual('on');
    });

    it('should save the enabled state', function(){
      expect(telephony.voicemailSwitch.getAttribute('value')).toEqual('on');
      // use mousemove to force clicking the radio button regardless of overlaid tag
      browser.actions().mouseMove(telephony.voicemailSwitch, 50, 50).click().perform();
      expect(telephony.voicemailSwitch.getAttribute('value')).toBeTruthy();
      telephony.saveButton.click();
      notifications.assertSuccess('Voicemail configuration saved successfully');

      expect(telephony.voicemailStatus.getText()).toEqual('On');
      telephony.voicemailFeature.click();
      expect(telephony.voicemailSwitch.getAttribute('value')).toBeTruthy();
    });
  });

  describe('Single Number Reach', function() {
    it('should click single number reach',function(){
      telephony.snrFeature.click();
      expect(telephony.snrSwitch.isPresent()).toBeTruthy();
    });

    it('should save the enabled state', function(){
      expect(telephony.snrSwitch.getAttribute('value')).toEqual('on');
      expect(telephony.snrNumber.isDisplayed()).toBeFalsy();
      // use mousemove to force clicking the radio button regardless of overlaid tag
      browser.actions().mouseMove(telephony.snrSwitch, 50, 50).click().perform();
      expect(telephony.snrSwitch.getAttribute('value')).toBeTruthy();
      expect(telephony.snrNumber.isDisplayed()).toBeTruthy();
      telephony.snrNumber.sendKeys(snrLine);
      telephony.saveButton.click();
      notifications.assertSuccess('Single Number Reach configuration saved successfully');

      expect(telephony.snrStatus.getText()).toEqual('On');
      telephony.snrFeature.click();
      expect(telephony.snrSwitch.getAttribute('value')).toBeTruthy();
      expect(telephony.snrNumber.isDisplayed()).toBeTruthy();
      expect(telephony.snrNumber.getAttribute('value')).toEqual(snrLine);
    });

    it('should save the disabled state', function(){
      // use mousemove to force clicking the radio button regardless of overlaid tag
      browser.actions().mouseMove(telephony.snrSwitch, 50, 50).click().perform();
      expect(telephony.snrSwitch.getAttribute('value')).toEqual('on');
      expect(telephony.snrNumber.isDisplayed()).toBeFalsy();
      telephony.saveButton.click();
      notifications.assertSuccess('Single Number Reach configuration removed successfully');

      expect(telephony.snrStatus.getText()).toEqual('Off');
      telephony.snrFeature.click();
      expect(telephony.snrSwitch.getAttribute('value')).toEqual('on');
      expect(telephony.snrNumber.isDisplayed()).toBeFalsy();
    });
  });

  it('should log out', function() {
    navigation.logout();
  });
});