'use strict';

describe('Test the activateProduct module', function () {
  it('should forward to the success page with a valid oid for an regular user', function () {
    login.loginUsingIntegrationForTesting('test-user', '#/overview');
    navigation.navigateTo('#/activate-product?oid=0b17b44a-4fea-48d4-9660-3da55df5d782');
    navigation.expectCurrentUrl('#/activate-product/success-page');
  });
});
