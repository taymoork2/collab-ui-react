'use strict';

/* global describe */
/* global it */
/* global login,navigation,users,utils,notifications, protractor, deleteUtils */

describe('Convert Users', function () {

  var testEmail = 'testuserone@squared.example.com';

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
    utils.dumpConsoleErrors();
  });

  describe('Display the overview page', function () {
    it('should login as pbr org admin', function () {
      login.login('sqtest-admin');
    });

    it('click on convert button should pop up the convert user modal', function () {
      utils.click(landing.convertButton);
      utils.expectIsDisplayed(landing.convertDialog);
      utils.expectIsDisplayed(landing.convertModalClose);
      utils.expectIsDisplayed(landing.convertCancelButton);
      utils.expectIsDisplayed(landing.convertActionButton);
    });
  });

  describe('convert users', function () {
    it('convert user failed', function () {
      utils.clickUser(testEmail);
      utils.scrollBottom('.modal');
      utils.click(landing.convertActionButton);
      notifications.assertError('not');
    });
  });

  it('should log out', function () {
    navigation.logout();
  });
});
