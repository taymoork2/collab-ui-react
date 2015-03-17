'use strict';

describe('Huron Call Routing', function () {
  var pattern = callrouting.getPattern();

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
      utils.sendKeys(callrouting.name, pattern);
      utils.click(callrouting.singleNumber);
      utils.sendKeys(callrouting.pattern, pattern);
      utils.sendKeys(callrouting.retrievalPrefix, pattern);
      utils.sendKeys(callrouting.reversionPattern, pattern);
      utils.click(callrouting.createButton);

      notifications.assertSuccess(pattern + ' added successfully');
    });

    it('should create a new call park with range', function () {
      utils.click(callrouting.addCallParkButton);

      utils.expectIsDisplayed(callrouting.name);
      utils.sendKeys(callrouting.name, (pattern + 1) + ' through ' + (pattern + 2));
      utils.click(callrouting.rangeMin);
      utils.sendKeys(callrouting.rangeMin, (pattern + 1));
      utils.click(callrouting.rangeMax);
      utils.sendKeys(callrouting.rangeMax, (pattern + 2));
      utils.click(callrouting.retrievalPrefix);
      utils.sendKeys(callrouting.retrievalPrefix, pattern);
      utils.click(callrouting.reversionPattern);
      utils.sendKeys(callrouting.reversionPattern, pattern);
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
      callrouting.clickDeleteIcon(pattern);
      utils.click(callrouting.cancelButton);
      utils.expectIsNotDisplayed(callrouting.cancelButton);
    });

    it('should delete the previously created call parks', function () {
      callrouting.clickDeleteIcon(pattern);
      utils.click(callrouting.deleteButton);
      notifications.assertSuccess('deleted successfully');

      callrouting.clickDeleteIcon(pattern + 1);
      utils.click(callrouting.deleteButton);
      notifications.assertSuccess('deleted successfully');

      callrouting.clickDeleteIcon(pattern + 2);
      utils.click(callrouting.deleteButton);
      notifications.assertSuccess('deleted successfully');
    });
  });

  // Log Out
  it('should log out', function () {
    navigation.logout();
  });
});
