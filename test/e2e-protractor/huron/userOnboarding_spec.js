'use strict';

describe('Manual User Onboard with Numbers basic Test', function () {

  var user = utils.randomTestGmail();

  beforeAll(function () {
    utils.loginToOnboardUsers('huron-int1', user);
  }, 120000);

  afterAll(function () {
    utils.deleteUser(user);
  });

  it('Next button is enabled on Manual Add Users/Service page if advancedCommunications chosen', function () {
    utils.click(users.advancedCommunications);
    utils.expectIsEnabled(users.nextButton);
  });

  it('Next button on Manual Add Users/Service page is clickable', function () {
    utils.click(users.nextButton);
    utils.expectIsDisplayed(users.addDnAndExtToUser);
  });

  it('On Manual Add users/Assign Numbers page, internal Numbers list is populated', function () {
    utils.click(users.internalNumber);
    utils.click(users.internalNumberOptionFirst);
  });

  it('onboard User with preassigned Dn and No DID', function () {
    users.retrieveInternalNumber().then(function (number) {
      if (number) {
        utils.click(users.onboardButton);
        notifications.assertSuccess(user, 'onboarded successfully');
        utils.expectIsNotDisplayed(users.manageDialog);

        utils.searchAndClick(user);
        utils.expectIsDisplayed(users.servicesPanel);
        utils.click(users.communicationsService);

        utils.expectIsDisplayed(telephony.communicationPanel);
        utils.expectCount(telephony.directoryNumbers, 1);

      }
    });
  });

});

//TODO fix hardcoded test user
xdescribe('User Onboarding with DN Mapping', function () {

  var user = 'userwithdnmap@gmail.com';

  beforeEach(function () {
    utils.getUserWithDn(user);
    utils.click(users.advancedCommunications);
    utils.click(users.nextButton);

  });

  afterEach(function () {
    utils.deleteUser(user);
  });

  it('update the internalNumber and onboard User', function () {
    utils.click(users.internalNumber);
    utils.click(users.internalNumberOptionLast);
    var testNumber = users.retrieveInternalNumber().then(function (number) {
      utils.click(users.onboardButton);
      notifications.assertSuccess(user, 'onboarded successfully');
      return number;
    });
    utils.searchAndClick(user);
    utils.expectIsDisplayed(users.servicesPanel);
    utils.click(users.communicationsService);
    utils.expectIsDisplayed(telephony.communicationPanel);
    utils.expectCount(telephony.directoryNumbers, 1);
    utils.expectText(telephony.directoryNumbers.first(), testNumber);

  });

  it('update ExternalNumber and onboard User', function () {
    utils.click(users.externalNumber);
    utils.click(users.externalNumberOptionLast);
    var testNumber = users.retrieveExternalNumber().then(function (number) {
      utils.click(users.onboardButton);
      notifications.assertSuccess(user, 'onboarded successfully');
      return number;
    });
    utils.searchAndClick(user);
    utils.expectIsDisplayed(users.servicesPanel);
    utils.click(users.communicationsService);
    utils.expectIsDisplayed(telephony.communicationPanel);
    utils.expectIsDisplayed(telephony.directoryNumbers);
    utils.clickLastBreadcrumb();
    utils.expectIsDisplayed(telephony.directoryNumbers.last());
    utils.expectText(telephony.directoryNumbers.last(), testNumber);
  });

  it('clik Map User', function () {
    utils.click(users.mapDn);

    utils.click(users.onboardButton);
    notifications.assertSuccess(user, 'onboarded successfully');
  });
});
