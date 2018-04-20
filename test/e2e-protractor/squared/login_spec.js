'use strict';

describe('Login Page', function () {
  it('should login and redirect to the requested users page', function () {
    login.loginThroughGui(helper.auth['account-admin'].user, helper.auth['account-admin'].pass, '#/users');
  });

  it('should logout', function () {
    navigation.logout();
  });
});
