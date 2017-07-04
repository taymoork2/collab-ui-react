'use strict';

describe('Huron Call Routing', function () {
  var pattern = callrouting.getPattern();

  beforeAll(function () {
    login.login('huron-e2e');
  }, 120000);

  //TODO Call Park is hidden
  xdescribe('Call Park feature', function () {
    it('should navigate to the Call Park page', function () {
      navigation.clickCallRouting();

      utils.expectIsDisplayed(callrouting.callParkCount);
      utils.click(callrouting.callParkSelect);
    });

    it('should cancel creating a new call park', function () {
      utils.click(callrouting.addCallParkButton);
      utils.expectIsDisplayed(callrouting.cancelButton);
      utils.click(callrouting.cancelButton);
      utils.expectIsNotDisplayed(callrouting.cancelButton);
    });

    it('should create a new call park with single number', function () {
      utils.click(callrouting.addCallParkButton);
      utils.sendKeys(callrouting.name, pattern);
      utils.click(callrouting.singleNumber);
      utils.click(callrouting.pattern);
      utils.sendKeys(callrouting.pattern, pattern);
      utils.click(callrouting.createButton);

      notifications.assertSuccess(pattern + ' added successfully');
    });

    it('should create a new call park with range', function () {
      utils.click(callrouting.addCallParkButton);

      utils.expectIsDisplayed(callrouting.name);
      utils.sendKeys(callrouting.name, (pattern + 1) + ' through ' + (pattern + 2));
      utils.click(callrouting.range);
      utils.click(callrouting.rangeMin);
      utils.sendKeys(callrouting.rangeMin, (pattern + 1));
      utils.click(callrouting.rangeMax);
      utils.sendKeys(callrouting.rangeMax, (pattern + 2));
      utils.click(callrouting.reversionOption);
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
      //Delete the single call park with the name equal to pattern variable value
      callrouting.clickDeleteIcon(pattern);
      utils.click(callrouting.deleteButton);
      notifications.assertSuccess('deleted successfully');

      //Delete the range of call parks
      callrouting.clickDeleteIcon((pattern + 1) + ' - ' + (pattern + 2));
      utils.click(callrouting.deleteButton);
      notifications.assertSuccess('deleted successfully');
    });
  });
});
