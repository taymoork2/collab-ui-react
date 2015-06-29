'use strict';

describe('Telephony Info', function () {
  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  var currentUser, currentUser2, token;
  var user = utils.randomTestGmail();
  var user2 = utils.randomTestGmail();

  it('should login', function () {
    login.login('huron-int1');
  });

  it('should retrieve a token', function (done) {
    utils.retrieveToken().then(function (_token) {
      token = _token;
      done();
    });
  });

  it('clicking on users tab should change the view', function () {
    navigation.clickUsers();
  });

  it('should create 2 users', function () {
    utils.click(users.addUsers);
    utils.click(users.addUsersField);
    utils.sendKeys(users.addUsersField, user);
    utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
    utils.sendKeys(users.addUsersField, user2);
    utils.sendKeys(users.addUsersField, protractor.Key.ENTER);
    utils.click(users.nextButton);
    utils.click(users.advancedCommunications);
    utils.click(users.onboardButton);
    notifications.assertSuccess(user, 'onboarded successfully');
    utils.click(users.closeAddUsers);

  });

  it('should verify second added user', function (done) {
    utils.searchAndClick(user2).then(function () {
      users.retrieveCurrentUser().then(function (_currentUser) {
        currentUser2 = _currentUser;
        done();
      });
    });
  });

  it('should verify added user', function (done) {
    utils.searchAndClick(user).then(function () {
      users.retrieveCurrentUser().then(function (_currentUser) {
        currentUser = _currentUser;
        done();
      });
    });
  });

  it('should open the communcations panel', function () {
    utils.expectIsDisplayed(users.servicesPanel);
    utils.click(users.communicationsService);
    utils.expectIsDisplayed(telephony.communicationPanel);
  });

  describe('Directory Numbers', function () {
    it('should have a primary directory number', function () {
      utils.expectIsDisplayed(telephony.directoryNumbers.first());
      utils.expectCount(telephony.directoryNumbers, 1);
    });

    it('should show directory number select', function () {
      utils.click(telephony.directoryNumbers.first());
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

    it('should find the added user and delete them from shared line', function () {
      utils.expectIsDisplayed(telephony.userAccordionGroup(user2));

      telephony.selectSharedLineUser(user2);
      utils.click(telephony.removeMemberLink);
      utils.click(telephony.removeMemberBtn);

      utils.expectIsNotDisplayed(telephony.userAccordionGroup(user2));
    });
  });

  it('should delete added user', function () {
    deleteUtils.deleteSquaredUCUser(currentUser.meta.organizationID, currentUser.id, token);
    deleteUtils.deleteUser(user);
  });

  it('should delete second added user', function () {
    deleteUtils.deleteSquaredUCUser(currentUser2.meta.organizationID, currentUser2.id, token);
    deleteUtils.deleteUser(user2);
  });

  it('should log out', function () {
    navigation.logout();
  });
});
