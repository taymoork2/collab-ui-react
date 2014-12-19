'use strict';

var testuser = {
  username: 'admin@uc.e2e.huron-alpha.com',
  password: 'C1sco123!'
};

var pattern = Math.ceil(Math.random()*10000);

xdescribe('Huron Call Routing', function() {
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
      expect(callrouting.callParks.count()).toBe(0);
    });

    it('should create a new call park with single number', function(){
      expect(callrouting.callParks.count()).toBe(0);
      callrouting.addCallParkButton.click();
      expect(callrouting.name.isDisplayed()).toBeTruthy;
      callrouting.name.sendKeys(pattern);
      callrouting.singleNumber.click();
      callrouting.pattern.sendKeys(pattern);
      callrouting.retrievalPrefix.sendKeys(pattern);
      callrouting.reversionPattern.sendKeys(pattern);
      callrouting.createButton.click();
      notifications.assertSuccess(pattern + ' added successfully');
      expect(callrouting.callParks.count()).toBe(1);
    });

    it('should create a new call park with range', function(){
      expect(callrouting.callParks.count()).toBe(1);
      callrouting.addCallParkButton.click();
      expect(callrouting.name.isDisplayed()).toBeTruthy;
      callrouting.name.sendKeys((pattern + 1) + " through " + (pattern + 2));
      callrouting.rangeMin.sendKeys((pattern + 1));
      callrouting.rangeMax.sendKeys((pattern + 2));
      callrouting.retrievalPrefix.sendKeys(pattern);
      callrouting.reversionPattern.sendKeys(pattern);
      callrouting.createButton.click();
      notifications.assertSuccess((pattern + 1) + ' added successfully', (pattern + 2) + ' added successfully');
      expect(callrouting.callParks.count()).toBe(3);
    });

    it('should delete all call parks', function(){
      callrouting.callParks.count().then(function(count){
        while(count > 0){
          count = count - 1;
          callrouting.callParks.get(count).element(by.css('button')).click();
        }
      });
      expect(callrouting.callParks.count()).toBe(0);
    });
  });

// Log Out
  it('should log out', function() {
    navigation.logout();
  });
});