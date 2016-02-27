'use strict';

/* global describe, utils */

describe('Test the activateProduct module', function () {

  var validOid = '0b17b44a-4fea-48d4-9660-3da55df5d782';
  var wellFormattedInvalidOid = validOid + '1234';
  var unwellFormattedInvalidOid = 'FOO' + validOid;

  it('should require login', function () {
    browser.get('#/activate-product');
    navigation.expectCurrentUrl('#/login');
  });

  it('should forward to the success page with a valid oid for an regular user', function () {
    login.login('test-user', '#/overview');
    browser.get('#/activate-product?oid=' + validOid);
    navigation.expectCurrentUrl('#/activate-product/success-page');
  });

  // TODO: Uncomment the below once the REST API is no longer a stub.
  it('should forward to the error page with an invalid, well-formatted oid', function () {
    browser.get('#/activate-product?oid=' + wellFormattedInvalidOid);
    // navigation.expectCurrentUrl('#/activate-product/error-page');
  });

  it('should forward to the error page with an invalid, un-well-formatted oid', function () {
    browser.get('#/activate-product?oid=' + unwellFormattedInvalidOid);
    // navigation.expectCurrentUrl('#/activate-product/error-page');
  });

});
