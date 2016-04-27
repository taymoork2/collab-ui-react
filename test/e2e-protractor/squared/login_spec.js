'use strict';

describe('Login Page', function () {
  it('should login and redirect to the requested users page', function () {
    login.loginThroughGui(helper.auth['pbr-admin'].user, helper.auth['pbr-admin'].pass, '#/users');
  });

  it('should logout', function () {
    navigation.logout();
  });
});
