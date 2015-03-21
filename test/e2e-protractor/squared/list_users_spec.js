'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */

describe('List users flow', function () {

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });
  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  it('should login as non-sso admin user', function () {
    login.login('pbr-admin');
  });

  it('clicking on users tab should change the view', function () {
    navigation.clickUsers();
  });

  it('should search and click on user', function () {
    utils.search(users.inviteTestUser.username);
    users.clickOnUser();
  });

  it('should display user admin settings panel when clicking on next arrow', function () {
    utils.click(users.rolesChevron);

    utils.expectIsDisplayed(roles.rolesDetailsPanel);

    utils.click(users.closeSidePanel);
  });

  //TODO Comment out until we decide what to do with the profile page
  xdescribe('Display user profile', function () {
    it('display user profile page when clicking on the user link', function () {
      users.clickOnUser();
      utils.click(users.userLink);

      navigation.expectCurrentUrl('/userprofile');
      utils.expectIsDisplayed(users.fnameField);
      utils.expectIsDisplayed(users.lnameField);
      utils.expectIsDisplayed(users.displayField);
      utils.expectIsDisplayed(users.emailField);
      utils.expectIsDisplayed(users.orgField);
      utils.expectIsDisplayed(users.titleField);
    });
  });

  //TODO What does this test even do?
  xdescribe('Exporting to CSV', function () {
    it('should display the CSV export button', function () {
      utils.click(users.userTab);
      users.clickOnUser();
      utils.expectIsDisplayed(users.exportButton);
    });
  });

  xdescribe('logout', function () {
    it('should log out', function () {
      navigation.logout();
    });
  });
});
