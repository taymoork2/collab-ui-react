'use strict';

var pattern = Math.ceil(Math.random() * Math.pow(10, 4)).toString();

xdescribe('Huron Call Routing', function () {
  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  it('should login', function () {
    login.login('huron-int1');
  });

  it('should navigate to the Call Park page', function () {
    navigation.clickCallRouting();

    utils.expectIsDisplayed(callrouting.callParkCount);
    utils.click(callrouting.callParkSelect);
  });

  describe('Call Park feature', function () {
    it('should cancel creating a new call park', function () {
      utils.click(callrouting.addCallParkButton);
      utils.expectIsDisplayed(callrouting.name);

      utils.click(callrouting.cancelButton);
      utils.expectIsNotDisplayed(callrouting.name);
    });

    it('should create a new call park with single number', function () {
      utils.click(callrouting.addCallParkButton);

      utils.expectIsDisplayed(callrouting.name);
      callrouting.name.sendKeys(pattern);
      utils.click(callrouting.singleNumber);
      callrouting.pattern.sendKeys(pattern);
      callrouting.retrievalPrefix.sendKeys(pattern);
      callrouting.reversionPattern.sendKeys(pattern);
      utils.click(callrouting.createButton);

      notifications.assertSuccess(pattern + ' added successfully');
    });

    it('should create a new call park with range', function () {
      utils.click(callrouting.addCallParkButton);

      utils.expectIsDisplayed(callrouting.name);
      callrouting.name.sendKeys((pattern + 1) + " through " + (pattern + 2));
      utils.click(callrouting.rangeMin);
      callrouting.rangeMin.sendKeys((pattern + 1));
      utils.click(callrouting.rangeMax);
      callrouting.rangeMax.sendKeys((pattern + 2));
      utils.click(callrouting.retrievalPrefix);
      callrouting.retrievalPrefix.sendKeys(pattern);
      utils.click(callrouting.reversionPattern);
      callrouting.reversionPattern.sendKeys(pattern);
      utils.click(callrouting.createButton);

      notifications.assertSuccess((pattern + 1) + ' added successfully', (pattern + 2) + ' added successfully');
    });

    it('should only display info message when info icon is active', function () {
      // info message should have been automatically turned off
      utils.expectIsNotDisplayed(callrouting.callParkInfoTextOne);
      utils.expectIsNotDisplayed(callrouting.callParkInfoTextTwo);

      // Turn info message on
      utils.click(callrouting.callParkInfo);
      utils.expectIsDisplayed(callrouting.callParkInfoTextOne);
      utils.expectIsDisplayed(callrouting.callParkInfoTextTwo);

      // Turn info message back off
      utils.click(callrouting.callParkInfo);
      utils.expectIsNotDisplayed(callrouting.callParkInfoTextOne);
      utils.expectIsNotDisplayed(callrouting.callParkInfoTextTwo);
    });

    it('should cancel a delete', function () {
      utils.click(callrouting.callParks.get(0).element(by.css('.delete-icon')));
      utils.expectIsDisplayed(callrouting.cancelButton);
      utils.click(callrouting.cancelButton);
      utils.expectIsNotDisplayed(callrouting.cancelButton);
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
