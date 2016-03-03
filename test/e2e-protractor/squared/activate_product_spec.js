'use strict';

describe('Test the activateProduct module', function () {
  var validOid = '0b17b44a-4fea-48d4-9660-3da55df5d782';
  var wellFormattedInvalidOid = validOid + '1234';
  var unwellFormattedInvalidOid = 'FOO' + validOid;

  it('should forward to the success page with a valid oid for an regular user', function () {
    login.login('test-user', '#/overview');
    navigation.navigateTo('#/activate-product?oid=' + validOid);
    navigation.expectCurrentUrl('#/activate-product/success-page');
  });
});
