'use strict';

var testuser = {
  username: 'admin@uc.e2e.huron-alpha.com',
  password: 'C1sco123!'
};

describe('Telephony Info', function() {
  var currentUser;
  var user = utils.randomTestGmail();
  var dropdownVariables = {
    voicemail: 'Voicemail',
    addNew: 'Add New'
  };
  var snrLine = Math.ceil(Math.random()*Math.pow(10,10)).toString();

  it('should login', function(){
    login.login(testuser.username,testuser.password);
  });

  it('should create user', function() {
    navigation.clickUsers();
    users.addUsers.click();
    browser.sleep(1000);
    users.addUsersField.sendKeys(user);
    users.squaredUCCheckBox.click();
    users.addButton.click();
    notifications.assertSuccess(user, 'added successfully');
    users.closeAddUsers.click();
    browser.sleep(3000);
  });

  it('should verify added user', function() {
    users.search(user);
    users.returnUser(user).click();
    element(by.binding('currentUser.userName')).evaluate('currentUser').then(function(_currentUser){
      currentUser = _currentUser;
      expect(currentUser).not.toBeNull();
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
      });
      telephony.forwardAllRadio.click();
      expect(telephony.forwardAll.isDisplayed()).toBeTruthy();
      expect(telephony.forwardBusy.isDisplayed()).toBeFalsy();
      expect(telephony.forwardAway.isDisplayed()).toBeFalsy();
      expect(telephony.forwardExternalCalls.isDisplayed()).toBeFalsy();
      telephony.selectOption(telephony.forwardAll, dropdownVariables.voicemail);
      telephony.saveButton.click();
      notifications.assertSuccess('Line configuration saved successfully');

      telephony.voicemailFeature.click();
      telephony.primary.click();
      browser.wait(function(){
        return telephony.forwardAllRadio.isPresent().then(function(present){
          return present;
        });
      });
      expect(telephony.forwardAll.isDisplayed()).toBeTruthy();
      expect(telephony.forwardBusy.isDisplayed()).toBeFalsy();
      expect(telephony.forwardAway.isDisplayed()).toBeFalsy();
      expect(telephony.forwardAll.element(by.css('input')).getAttribute('value')).toEqual(dropdownVariables.voicemail);
    });

    it('should save call forward all to an outside number', function(){
        telephony.selectOption(telephony.forwardAll, dropdownVariables.addNew);
        telephony.setNumber(telephony.forwardAll, snrLine);
        telephony.saveButton.click();
        notifications.assertSuccess('Line configuration saved successfully');

        telephony.voicemailFeature.click();
        telephony.primary.click();
        browser.wait(function(){
          return telephony.forwardAllRadio.isPresent().then(function(present){
            return present;
          });
        });
        expect(telephony.forwardAll.element(by.css('input')).getAttribute('value')).toEqual(snrLine);
    });

    it('should save call forward busy/away to voicemail and an outside number', function(){
      telephony.directoryNumbers.first().click();
      telephony.forwardBusyAwayRadio.click();
      expect(telephony.forwardAll.isDisplayed()).toBeFalsy();
      expect(telephony.forwardBusy.isDisplayed()).toBeTruthy();
      expect(telephony.forwardAway.isDisplayed()).toBeTruthy();
      expect(telephony.forwardExternalCalls.isDisplayed()).toBeTruthy();

      telephony.selectOption(telephony.forwardBusy, dropdownVariables.addNew);
      telephony.setNumber(telephony.forwardBusy, snrLine);
      telephony.forwardBusyAwayRadio.click();
      telephony.selectOption(telephony.forwardAway, dropdownVariables.voicemail);
      telephony.saveButton.click();
      notifications.assertSuccess('Line configuration saved successfully');

      telephony.voicemailFeature.click();
      telephony.primary.click();
      browser.wait(function(){
        return telephony.forwardBusyAwayRadio.isPresent().then(function(present){
          return present;
        });
      });
      expect(telephony.forwardAll.isDisplayed()).toBeFalsy();
      expect(telephony.forwardBusy.isDisplayed()).toBeTruthy();
      expect(telephony.forwardAway.isDisplayed()).toBeTruthy();
      expect(telephony.forwardExternalCalls.isDisplayed()).toBeTruthy();
      expect(telephony.forwardBusy.element(by.css('input')).getAttribute('value')).toEqual(snrLine);
      expect(telephony.forwardAway.element(by.css('input')).getAttribute('value')).toEqual(dropdownVariables.voicemail);
    });

    it('should save external call forwarding to voicemail and an outside number', function(){
      expect(telephony.forwardExternalBusy.isDisplayed()).toBeFalsy();
      expect(telephony.forwardExternalAway.isDisplayed()).toBeFalsy();
      telephony.forwardExternalCalls.click();

      expect(telephony.forwardExternalBusy.isDisplayed()).toBeTruthy();
      expect(telephony.forwardExternalAway.isDisplayed()).toBeTruthy();
      telephony.selectOption(telephony.forwardExternalBusy, dropdownVariables.voicemail);
      telephony.selectOption(telephony.forwardExternalAway, dropdownVariables.addNew);
      telephony.setNumber(telephony.forwardExternalAway, snrLine);
      telephony.saveButton.click();
      notifications.assertSuccess('Line configuration saved successfully');

      telephony.voicemailFeature.click();
      telephony.primary.click();
      browser.wait(function(){
        return telephony.forwardBusyAwayRadio.isPresent().then(function(present){
          return present;
        });
      });
      expect(telephony.forwardExternalBusy.isDisplayed()).toBeTruthy();
      expect(telephony.forwardExternalAway.isDisplayed()).toBeTruthy();
      expect(telephony.forwardExternalBusy.element(by.css('input')).getAttribute('value')).toEqual(dropdownVariables.voicemail);
      expect(telephony.forwardExternalAway.element(by.css('input')).getAttribute('value')).toEqual(snrLine);
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
      telephony.verifyNewNumber().then(function(number){
        telephony.selectOption(telephony.forwardBusy, dropdownVariables.addNew);
        telephony.setNumber(telephony.forwardBusy, snrLine);
        telephony.forwardBusyAwayRadio.click();
        telephony.selectOption(telephony.forwardAway, dropdownVariables.addNew);
        telephony.setNumber(telephony.forwardAway, snrLine);
        telephony.saveButton.click();
        notifications.assertSuccess('Line configuration saved successfully');

        var numberElement = element.all(by.cssContainingText('span', number));
        browser.wait(function() {
          return numberElement.count().then(function(count) {
            return count > 0;
          });
        });
        expect(numberElement.first().isDisplayed()).toBeTruthy();
        telephony.directoryNumbers.get(1).click();
        telephony.verifyExistingNumber().then(function(verificationNumber){
          expect(number).toEqual(verificationNumber);
          expect(element(by.cssContainingText('span', number)).isPresent()).toBeTruthy();
        });
      });
    });

    it('should update directory number', function(){
      telephony.verifyExistingNumber().then(function(number){
        telephony.internalNumber.click();
        telephony.internalNumber.all(by.css('option')).get(1).click();
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
  });

  describe('Voicemail', function() {

    it('should save the disabled state', function(){
      telephony.voicemailFeature.click();

      expect(telephony.voicemailStatus.getText()).toEqual('On');
      expect(utils.getSwitchState(telephony.voicemailSwitch)).toBeTruthy();

      utils.disableSwitch(telephony.voicemailSwitch);
      telephony.saveButton.click();
      notifications.assertSuccess('Voicemail configuration saved successfully');

      expect(telephony.voicemailStatus.getText()).toEqual('Off');
      expect(utils.getSwitchState(telephony.voicemailSwitch)).toBeFalsy();
    });

    it('should save the enabled state', function(){
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

  describe('Single Number Reach', function() {

    it('should save the enabled state', function(){
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

    it('should save the disabled state', function(){
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

  it('should delete added user', function() {
      expect(deleteUtils.deleteSquaredUCUser(currentUser.meta.organizationID, currentUser.id, currentUser.userName)).toEqual(204);
      expect(deleteUtils.deleteUser(user)).toEqual(200);
  });

  it('should log out', function() {
    navigation.logout();
  });
});