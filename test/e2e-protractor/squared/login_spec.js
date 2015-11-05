'use strict';

describe('Login Page', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login and redirect to the requested users page', function () {
    login.loginThroughGui(helper.auth['pbr-admin'].user, helper.auth['pbr-admin'].pass, '#/users');
  });

  it('should logout', function () {
    navigation.logout();
  });

});
