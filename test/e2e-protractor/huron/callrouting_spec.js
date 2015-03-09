'use strict';

var testuser = {
  username: 'admin@int2.huron-alpha.com',
  password: 'Cisco123!'
};

var pattern = Math.ceil(Math.random() * Math.pow(10, 4)).toString();

xdescribe('Huron Call Routing', function () {
  it('should login', function () {
    login.login(testuser.username, testuser.password);
  });

  it('should navigate to the Call Park page', function () {
    navigation.clickCallRouting();
    browser.sleep(1000);
    expect(callrouting.callParkCount.isDisplayed()).toBe(true);
    callrouting.callParkSelect.click();
  });

  describe('Call Park feature', function () {
    it('should cancel creating a new call park', function () {
      callrouting.addCallParkButton.click();
      browser.sleep(1000);
      callrouting.cancelButton.click();
      browser.sleep(1000);
      expect(callrouting.name.isPresent()).toBeFalsy();
    });

    it('should create a new call park with single number', function () {
      callrouting.addCallParkButton.click();
      browser.sleep(1000);
      expect(callrouting.name.isDisplayed()).toBeTruthy();
      callrouting.name.sendKeys(pattern);
      callrouting.singleNumber.click();
      callrouting.pattern.sendKeys(pattern);
      callrouting.retrievalPrefix.sendKeys(pattern);
      callrouting.reversionPattern.sendKeys(pattern);
      callrouting.createButton.click();
      browser.sleep(1000);
      notifications.assertSuccess(pattern + ' added successfully');
    });

    it('should create a new call park with range', function () {
      callrouting.addCallParkButton.click();
      browser.sleep(1000);
      expect(callrouting.name.isDisplayed()).toBeTruthy();
      callrouting.name.sendKeys((pattern + 1) + " through " + (pattern + 2));
      callrouting.rangeMin.click();
      callrouting.rangeMin.sendKeys((pattern + 1));
      callrouting.rangeMax.click();
      callrouting.rangeMax.sendKeys((pattern + 2));
      callrouting.retrievalPrefix.click();
      callrouting.retrievalPrefix.sendKeys(pattern);
      callrouting.reversionPattern.click();
      callrouting.reversionPattern.sendKeys(pattern);
      callrouting.createButton.click();
      browser.sleep(1000);
      notifications.assertSuccess((pattern + 1) + ' added successfully', (pattern + 2) + ' added successfully');
    });

    it('should only display info message when info icon is active', function () {
      // info message should have been automatically turned off
      expect(callrouting.callParkInfoTextOne.isDisplayed()).toBe(false);
      expect(callrouting.callParkInfoTextTwo.isDisplayed()).toBe(false);

      // Turn info message on
      callrouting.callParkInfo.click();
      expect(callrouting.callParkInfoTextOne.isDisplayed()).toBe(true);
      expect(callrouting.callParkInfoTextTwo.isDisplayed()).toBe(true);

      // Turn info message back off
      callrouting.callParkInfo.click();
      expect(callrouting.callParkInfoTextOne.isDisplayed()).toBe(false);
      expect(callrouting.callParkInfoTextTwo.isDisplayed()).toBe(false);
    });

    it('should cancel a delete', function () {
      callrouting.callParks.get(0).element(by.css('.delete-icon')).click();
      expect(callrouting.cancelButton.isDisplayed()).toBeTruthy();
      callrouting.cancelButton.click();
      expect(callrouting.cancelButton.isPresent()).toBe(false);
    });

    it('should delete the previously created call parks', function () {
      callrouting.deleteCallPark(pattern);
      callrouting.deleteCallPark(pattern + 1);
      callrouting.deleteCallPark(pattern + 2);
    });
  });

  // Log Out
  it('should log out', function () {
    navigation.logout();
  });
});
