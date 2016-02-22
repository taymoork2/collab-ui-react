'use strict';

/* global describe, utils */

// TODO: Activate this test once the REST API is no longer a stub.
xdescribe('Test the activateProduct module', function () {

  var validOid = '0b17b44a-4fea-48d4-9660-3da55df5d782';

  it('should forward to the success page with a valid oid', function () {
    browser.get('#/activate-product?oid=' + validOid);
    navigation.expectCurrentUrl('#/activated-product-success-page');
  });

  it('should forward to the error page with an invalid, well-formatted oid', function () {
    browser.get('#/activate-product?oid=' + validOid + '1234');
    navigation.expectCurrentUrl('#/activate-product-error-page');
  });

  it('should forward to the error page with an invalid, un-well-formatted oid', function () {
    browser.get('#/activate-product?uuid=FOO' + validOid);
    navigation.expectCurrentUrl('#/activate-product-error-page');
  });

});
