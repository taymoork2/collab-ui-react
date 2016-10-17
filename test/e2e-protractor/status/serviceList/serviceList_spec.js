/**
 * Created by snzheng on 16/10/12.
 */

'use strict';

describe('update4 Incident', function () {
  it('should login to dashboard page', function () {
    login.login('sjsite14-test', '#/status/serviceList');
  });

  describe('serviceList page', function () {
    it('data should be accessed', function () {
      utils.click(element(by.css('.status a.select-toggle')));
      browser.sleep(3000);
      navigation.navigateUsingIntegrationBackend('#/status/serviceList');
    });
    it('each service should be exsist', function () {
      utils.expectIsDisplayed(serviceListPage.serviceListPage);
      utils.expectIsDisplayed(serviceListPage.serviceList);
    });

    it('edit service should be active', function () {
      utils.click(element(by.cssContainingText('.row div a', 'Edit')));
      utils.expectIsDisplayed(serviceListPage.editServiceModal);
      utils.click(serviceListPage.editButton);
    });

    it('delete service should be active', function () {
      utils.click(element(by.cssContainingText('.row div a', 'Delete')));
      utils.expectIsDisplayed(serviceListPage.deleteServiceModal);
      utils.sendKeys(serviceListPage.inputDelete, 'DELETE');
      utils.expectIsEnabled(serviceListPage.deleteButton);
    });
  });
});
