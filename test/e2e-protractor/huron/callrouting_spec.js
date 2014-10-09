'use strict';

var testuser = {
  username: 'adminTestUser@wx2.example.com',
  password: 'C1sc0123!'
};

xdescribe('Call Routing', function() {
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

    var pattern = Math.ceil(Math.random()*10000);
    it('should create a new call park', function(){
      callrouting.name.sendKeys(pattern);
      callrouting.singleNumber.click();
      callrouting.pattern.sendKeys(pattern);
      callrouting.retrievalPrefix.sendKeys(pattern);
      callrouting.reversionPatternRadio.click();
      callrouting.reversionPattern.sendKeys(pattern);
      callrouting.createButton.click();
      notifications.assertSuccess('added successfully');
    });

    it('should delete call park', function(){
      callrouting.deleteCallPark(pattern);
    });
  });

// Log Out
  it('should log out', function() {
    navigation.logout();
  });

});