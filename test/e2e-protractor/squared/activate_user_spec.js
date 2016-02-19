'use strict';

/* global describe, utils */

describe('Test the activateUser module', function () {

  var validUuid = '0b17b44a-4fea-48d4-9660-3da55df5d782';

  it('should forward to the success page with a valid uuid', function () {
    browser.get('#/activate-user?uuid=' + validUuid);
    navigation.expectCurrentUrl('#/activated-user-success-page');
  });

  it('should forward to the error page with an invalid, well-formatted uuid', function () {
    browser.get('#/activate-user?uuid=' + validUuid + '1234');
    navigation.expectCurrentUrl('#/activate-user-error-page');
  });

  it('should forward to the error page with an invalid, un-well-formatted uuid', function () {
    browser.get('#/activate-user?uuid=FOO' + validUuid);
    navigation.expectCurrentUrl('#/activate-user-error-page');
  });

  it('should forward to the error page when no uuid (all variants)', function () {
    browser.get('#/activate-user');
    navigation.expectCurrentUrl('#/activate-user-error-page');
    browser.get('#/activate-user?uuid');
    navigation.expectCurrentUrl('#/activate-user-error-page');
    browser.get('#/activate-user?uuid=');
    navigation.expectCurrentUrl('#/activate-user-error-page');
  });

});
