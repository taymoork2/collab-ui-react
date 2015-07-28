'use strict';

/* global describe */
/* global it */
/* global login,navigation,users,utils,notifications, protractor, deleteUtils */

describe('Convert Users', function () {

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
      utils.waitUntilEnabled(landing.convertButton);
      utils.click(landing.convertButton);
      utils.expectIsDisplayed(landing.convertDialog);
      utils.expectIsDisplayed(landing.convertModalClose);
      utils.expectIsDisplayed(landing.convertNextButton);
    });
  });

  describe('convert users', function () {
    it('convert user operations', function () {
      utils.expectIsDisabled(landing.convertNextButton);
      //utils.clickUser(testEmail);
      utils.click(landing.unlicensedUserRow);
      utils.expectIsEnabled(landing.convertNextButton);
      utils.scrollBottom('.modal');
      utils.click(landing.convertNextButton);
      utils.expectIsDisplayed(landing.btnConvert);
      utils.expectIsDisplayed(landing.btnBack);
      utils.click(landing.btnBack);
      utils.expectIsEnabled(landing.convertNextButton);
      utils.click(landing.convertNextButton);
      utils.expectIsDisplayed(landing.closeAddUser);
      utils.click(landing.closeAddUser);
      utils.expectIsNotDisplayed(landing.btnConvert);
    });
  });

  it('should log out', function () {
    navigation.logout();
  });
});
