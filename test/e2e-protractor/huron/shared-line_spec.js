'use strict';

describe('Shared Line', function () {
  var user = utils.randomTestGmail();
  var user2 = utils.randomTestGmail();

  beforeAll(function () {
    utils.loginAndCreateHuronUser('huron-int1', user, user2);
  }, 120000);

  it('should open the communcations panel', function () {
    utils.expectIsDisplayed(users.servicesPanel);
    utils.click(users.communicationsService);
    utils.expectIsDisplayed(telephony.communicationPanel);
  });

  it('should have a primary directory number', function () {
    utils.expectCount(telephony.directoryNumbers, 1);
  });

  it('should show directory number select', function () {
    utils.clickFirst(telephony.directoryNumbers);
    utils.expectIsDisplayed(telephony.internalNumber);
  });

  it('should add the second user to the first users shared line', function () {
    utils.click(telephony.userInput);

    utils.sendKeys(telephony.userInput, user2);
    telephony.selectSharedLineOption(user2);

    utils.expectIsDisplayed(telephony.userAccordionGroup(user2));

    utils.click(telephony.saveButton);
    notifications.assertSuccess('Line configuration saved successfully');

    utils.expectIsDisplayed(telephony.userAccordionGroup(user2));
  });

  it('should find the added user, delete from shared line and add back', function () {
    utils.expectIsDisplayed(telephony.userAccordionGroup(user2));

    telephony.selectSharedLineUser(user2);
    utils.click(telephony.removeMemberLink);
    utils.click(telephony.removeMemberBtn);
    utils.expectIsNotDisplayed(telephony.userAccordionGroup(user2));

    utils.click(telephony.userInput);
    utils.sendKeys(telephony.userInput, user2);
    telephony.selectSharedLineOption(user2);

    utils.expectIsDisplayed(telephony.userAccordionGroup(user2));

    utils.click(telephony.saveButton);
    notifications.assertSuccess('Line configuration saved successfully');

    utils.expectIsDisplayed(telephony.userAccordionGroup(user2));
  });

  it('should find the added user and delete them from shared line', function () {
    utils.expectIsDisplayed(telephony.userAccordionGroup(user2));

    telephony.selectSharedLineUser(user2);
    utils.click(telephony.removeMemberLink);
    utils.click(telephony.removeMemberBtn);

    utils.expectIsNotDisplayed(telephony.userAccordionGroup(user2));
  });

  afterAll(function () {
    utils.deleteUser(user, user2);
  });
});
