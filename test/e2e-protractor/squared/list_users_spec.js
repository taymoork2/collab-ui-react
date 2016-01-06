'use strict';

describe('List users flow', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as non-sso admin user and view users', function () {
    login.login('pbr-admin', '#/users');
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
});
