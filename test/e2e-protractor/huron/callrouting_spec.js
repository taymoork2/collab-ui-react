'use strict';

var testuser = {
  username: 'adminTestUser@wx2.example.com',
  password: 'C1sc0123!'
};

describe('Call Routing', function() {
  it('should login', function(){
    login.login(testuser.username,testuser.password);
  });

  it('should navigate to the page', function(){
    navigation.clickCallRouting();
    navigation.expectCurrentUrl('/callrouting');
  });

  describe('Call Park feature', function(){

    it('should click add call park', function(){
      callrouting.addCallParkButton.click();
      utils.expectIsDisplayed(callrouting.name);
    });

    var keys = '8501';
    it('should create a new call park', function(){
      callrouting.name.sendKeys(keys);
      callrouting.singleNumber.click();
      callrouting.pattern.sendKeys(keys);
      callrouting.retrievalPrefix.sendKeys(keys);
      callrouting.reversionPatternRadio.click();
      callrouting.reversionPattern.sendKeys(keys);
      callrouting.createButton.click();
      users.assertSuccess('added successfully');
    });

    xit('should delete call park');

  });

// Log Out
  it('should log out', function() {
    navigation.logout();
  });

});