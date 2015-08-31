/**
 * Created by sundravi on 17/08/15.
 */
'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */
/* global expect */
/* global protractor */

describe('Configuring Contact Center services per user', function () {
  // We need to use an existing user since only they will have an activated profile'
  var testUser = 'kalanka.arunanchal@outlook.com';

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as an account admin', function () {
    login.login('contactcenter-admin', '#/users');
  });

  it('should show contact center service configuration page', function () {
    utils.searchAndClick(testUser);
    utils.click(users.contactCenterService);
  });

})
