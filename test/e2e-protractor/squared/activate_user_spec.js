'use strict';

/* global describe, utils */

describe('Test the activateUser module', function () {

  var validUuid = 'f402f03e-9bc9-47c5-9443-3e9fa70951aa'; // foo@bar.com, created 1/19/2015

  it('should forward to the success page with a valid uuid', function () {
    browser.get('#/activate-user?uuid=' + validUuid);
    navigation.expectCurrentUrl('#/activate-user/success-page');
  });

  it('should forward to the error page with an invalid, well-formatted uuid', function () {
    browser.get('#/activate-user?uuid=' + validUuid + '1234');
    navigation.expectCurrentUrl('#/activate-user/error-page');
  });

  it('should forward to the error page with an invalid, un-well-formatted uuid', function () {
    browser.get('#/activate-user?uuid=FOO' + validUuid);
    navigation.expectCurrentUrl('#/activate-user/error-page');
  });

});
