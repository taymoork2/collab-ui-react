'use strict'

/* global LONG_TIMEOUT */

describe('GSS-(Global Service Status) Management', function () {

  it('should login as GSS test admin', function () {
    login.login('gss-testAdmin');
  }, LONG_TIMEOUT);

  //It will be ignored when push it to Jenkins. (We are not currently running this because the pages are behind feature toggle and sometime feature toggle doesn't loads fast. We will enable them when we remove feature toggle.)
  xdescribe('Component page', function () {

    it('should navigate to component page', function () {
      utils.expectIsDisplayed(navigation.gssTab);
      gssComponent.clickComponent();
    });

    it('should have the services selector displayed', function () {
      utils.expectIsDisplayed(gssComponent.serviceSelector);
    });

    it('should select the first service-select option', function () {
      utils.click(gssComponent.serviceSelector);
      utils.expectIsDisplayed(gssComponent.serviceSelectorFirstChild);
      utils.click(gssComponent.serviceSelectorFirstChild);
      utils.isSelected(gssComponent.serviceSelectorFirstChild);
    });

    it('should add component successfully', function () {
      utils.expectIsDisplayed(gssComponent.addComponentBtn);
      utils.click(gssComponent.addComponentBtn);
      utils.expectIsDisplayed(gssComponent.addComponent);
      utils.sendKeys(gssComponent.componentName, gssComponent.newComponentName);
      utils.sendKeys(gssComponent.componentDesc, gssComponent.newComponentName);
      utils.click(gssComponent.addComponentGroupSelect);
      utils.click(gssComponent.createNewGroupOption);
      utils.sendKeys(gssComponent.newGroupNameInput, gssComponent.newGroupName);
      utils.click(gssComponent.createComponentBtn);
      notifications.assertSuccess('Component ' + gssComponent.newComponentName + ' under group ' + gssComponent.newGroupName + ' add succeed.');
    });

    it('should update component successfully', function () {
      utils.waitUntilEnabled(gssComponent.updateComponent);
      utils.click(gssComponent.updateComponent);
      utils.expectIsDisplayed(gssComponent.updateComponentModal);
      utils.clear(gssComponent.upCompName);
      utils.sendKeys(gssComponent.upCompName, gssComponent.updatedGroupName);
      utils.click(gssComponent.updateComponentBtn);
      notifications.assertSuccess('Component ' + gssComponent.updatedGroupName + ' under group update succeed.');
    });

    it('should delete component successfully', function () {
      utils.waitUntilEnabled(gssComponent.deleteComponent);
      utils.click(gssComponent.deleteComponent);
      utils.expectIsDisplayed(gssComponent.deleteInput);
      utils.sendKeys(gssComponent.deleteInput, 'DELETE');
      utils.click(gssComponent.deleteComponentBtn);
      notifications.assertSuccess('Component ' + gssComponent.updatedGroupName + ' delete succeed.');
      utils.waitForPresence(gssComponent.componentMain, 10000);
    });
  });

  describe('Login out', function () {

    it('should login out', function () {
      navigation.logout();
    });

  });
});
