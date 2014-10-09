'use strict';

var testuser = {
  username: 'adminTestUser@wx2.example.com',
  password: 'C1sc0123!'
};

var user = "atlasuser501@wx2.example.com";

xdescribe('Telephony Info', function() {
  it('should login', function(){
    login.login(testuser.username,testuser.password);
  });

  it('should navigate to users page', function() {
    users.search(user,0);
    navigation.clickUsers();
    navigation.expectCurrentUrl('/users');
    expect(users.resultUsername.getText()).toContain(user);
    users.resultUsername.click();
    expect(telephony.telephonyPanel.isDisplayed()).toBeTruthy();
  });

  describe('Directory Numbers', function(){
    it('should have a primary directory number', function() {
      expect(telephony.directoryNumbers.count()).toBe(1);
    });
    it('should show directory number select', function(){
      telephony.directoryNumbers.first().click();
      expect(telephony.directoryNumberSelect.isDisplayed).toBeTruthy();
    });
    it('should show call forward all', function(){
      telephony.forwardAllRadio.click();
      expect(telephony.forwardAll.isDisplayed()).toBeTruthy();
      expect(telephony.forwardBusy.isDisplayed()).toBeFalsy();
      expect(telephony.forwardAway.isDisplayed()).toBeFalsy();
      expect(telephony.forwardExternalCalls.isDisplayed()).toBeFalsy();
    });
    it('should show call forward busy/away', function(){
      telephony.forwardBusyAwayRadio.click();
      expect(telephony.forwardAll.isDisplayed()).toBeFalsy();
      expect(telephony.forwardBusy.isDisplayed()).toBeTruthy();
      expect(telephony.forwardAway.isDisplayed()).toBeTruthy();
      expect(telephony.forwardExternalCalls.isDisplayed()).toBeTruthy();
    });
    it('should show external call forwarding', function(){
      telephony.forwardExternalCalls.click();
    });
    xit('should save', function(){
      telephony.saveButton.click();
    });
  });

  describe('Voicemail', function() {
    it('should click voicemail', function(){
      telephony.voicemailFeature.click();
      expect(telephony.voicemailSwitch.isDisplayed()).toBeTruthy();
    });
    it('should switch state', function(){
      utils.disableSwitch(telephony.voicemailSwitch);
      expect(utils.getSwitchState(telephony.voicemailSwitch)).toBeFalsy();
      utils.enableSwitch(telephony.voicemailSwitch);
      expect(utils.getSwitchState(telephony.voicemailSwitch)).toBeTruthy();
    });
    xit('should save', function(){
      telephony.saveButton.click();
    });
  });

  describe('Single Number Reach', function() {
    it('should click single number reach',function(){
      telephony.snrFeature.click();
      expect(telephony.snrSwitch.isDisplayed()).toBeTruthy();
    });
    it('should switch state', function(){
      utils.disableSwitch(telephony.snrSwitch);
      expect(telephony.snrNumber.isDisplayed()).toBeFalsy();
      utils.enableSwitch(telephony.snrSwitch);
      expect(telephony.snrNumber.isDisplayed()).toBeTruthy();
    });
    xit('should save', function(){
      telephony.saveButton.click();
    });
  });

  it('should log out', function() {
    navigation.logout();
  });
});
