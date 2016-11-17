'use strict'

/* global LONG_TIMEOUT */

describe('GSS-(Global Service Status) Management', function () {

  it('should login as GSS test admin', function () {
    login.login('gss-testAdmin');
  }, LONG_TIMEOUT);

  //It will be ignored when push it to Jenkins. (We are not currently running this because the pages are behind feature toggle and sometime feature toggle doesn't loads fast. We will enable them when we remove feature toggle.)
  xdescribe('Service page', function () {

    it('should navigate to service page', function () {
      utils.expectIsDisplayed(navigation.gssTab);
      gssService.clickService();
    });

    it('should have the services selector displayed', function () {
      utils.expectIsDisplayed(gssService.serviceSelector);
    });

    it('should select the last service-select option', function () {
      utils.click(gssService.serviceSelector);
      utils.expectIsDisplayed(gssService.serviceSelectorLastChild);
      utils.click(gssService.serviceSelectorLastChild);
      utils.isSelected(gssService.serviceSelectorLastChild);
    });

    it('should add service successfully', function () {
      utils.waitForModal().then(function () {
        utils.expectIsDisplayed(gssService.addModalTitle);
        utils.sendKeys(gssService.addServiceNameInputObj, gssService.serviceNameText);
        utils.sendKeys(gssService.addServiceDescInputObj, gssService.serviceDescText);
        utils.click(gssService.addServiceBtn).then(function () {
          notifications.assertSuccess('Service ' + gssService.serviceNameText + ' add succeed.');
        });
      });
    });

    it('should show service list', function () {
      utils.expectIsDisplayed(gssService.serviceList);
    });

    it('should update service successfully', function () {
      utils.waitUntilEnabled(gssService.serviceEditBtn);
      utils.click(gssService.serviceEditBtn);
      utils.waitForModal().then(function () {
        utils.expectIsDisplayed(gssService.updateModalTitle);
        utils.clear(gssService.updateServiceNameInputObj);
        utils.sendKeys(gssService.updateServiceNameInputObj, gssService.serviceNameEditText);
        utils.click(gssService.updateServiceBtn).then(function () {
          notifications.assertSuccess('Service ' + gssService.serviceNameEditText + ' edit succeed.');
        });
      });
    });

    it('should delete service successfully', function () {
      utils.waitUntilEnabled(gssService.serviceDeleteBtn);
      utils.click(gssService.serviceDeleteBtn);
      utils.expectIsDisplayed(gssService.deleteModalInput);
      utils.sendKeys(gssService.deleteModalInput, 'DELETE');
      utils.click(gssService.deleteBtn);
      notifications.assertSuccess('Service ' + gssService.serviceNameEditText + ' delete succeed.');
    });
  });

  describe('Login out', function () {

    it('should login out', function () {
      navigation.logout();
    });

  });
});
