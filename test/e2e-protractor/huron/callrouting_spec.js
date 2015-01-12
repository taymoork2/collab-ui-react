'use strict';

var testuser = {
  username: 'admin@uc.e2e.huron-alpha.com',
  password: 'C1sco123!'
};

var pattern = Math.ceil(Math.random()*10000).toString();

describe('Huron Call Routing', function() {
  it('should login', function(){
    login.login(testuser.username,testuser.password);
  });

  it('should navigate to the page', function(){
    navigation.clickCallRouting();
  });

  describe('Call Park feature', function(){
    it('should cancel creating a new call park', function(){
      callrouting.addCallParkButton.click();
      callrouting.cancelButton.click();
      expect(callrouting.name.isPresent()).toBeFalsey;
    });

    it('should create a new call park with single number', function(){
      callrouting.addCallParkButton.click();
      expect(callrouting.name.isDisplayed()).toBeTruthy;
      callrouting.name.sendKeys(pattern);
      callrouting.singleNumber.click();
      callrouting.pattern.sendKeys(pattern);
      callrouting.retrievalPrefix.sendKeys(pattern);
      callrouting.reversionPattern.sendKeys(pattern);
      callrouting.createButton.click();
      notifications.assertSuccess(pattern + ' added successfully');
    });

    it('should create a new call park with range', function(){
      callrouting.addCallParkButton.click();
      expect(callrouting.name.isDisplayed()).toBeTruthy;
      callrouting.name.sendKeys((pattern + 1) + " through " + (pattern + 2));
      callrouting.rangeMin.sendKeys((pattern + 1));
      callrouting.rangeMax.sendKeys((pattern + 2));
      callrouting.retrievalPrefix.sendKeys(pattern);
      callrouting.reversionPattern.sendKeys(pattern);
      callrouting.createButton.click();
      notifications.assertSuccess((pattern + 1) + ' added successfully', (pattern + 2) + ' added successfully');
    });

    it('should delete all call parks', function(){
      callrouting.deleteCallPark(pattern);
      callrouting.deleteCallPark(pattern + 1);
      callrouting.deleteCallPark(pattern + 2);
    });
  });

// Log Out
  it('should log out', function() {
    navigation.logout();
  });
});