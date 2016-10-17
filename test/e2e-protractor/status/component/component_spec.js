/**
 * Created by snzheng on 16/9/30.
 */

'use strict';

describe('update4 Incident', function () {

  describe('Log In', function () {
    it('should login to component page', function () {
      login.login('sjsite14-test', '#/status/components');
    });
  });

  describe('component page', function () {
    it('site should be set first', function () {
      //utils.selectDropdown('.status', 'Cisco Spark');
      utils.click(element(by.css('.status a.select-toggle')));
      browser.sleep(2000);
      utils.click(element(by.css('.status a.select-toggle')));
      utils.click(element(by.cssContainingText('.status .select-options li a', 'WebEx Meetings')));
      //utils.click(element(by.css('.status .select-options li a:nth-child')));
       // utils.click(element(by.cssContainingText('.status .select-options li a', 'Cisco Spark')));
    });

    it('addComponent should be active', function () {
      utils.click(componentPage.addComponentBtn);
      utils.expectIsDisplayed(componentPage.addComponent);
      utils.sendKeys(componentPage.componentName, 'helloWorld');
      utils.sendKeys(componentPage.componentDesc, 'test one');
      utils.click(element(by.css('.dropdown a.select-toggle')));
      utils.click(element(by.cssContainingText('.dropdown-menu .select-options li a', 'WebEx Meetings')));
      //utils.sendKeys(element(by.model('addComponent.groupName')),'test');
      utils.click(componentPage.createComponentBtn);
     // utils.click(componentPage.closeAddComponent);
    });
    it('update component should success', function () {
      utils.waitUntilEnabled(componentPage.updateComponent);
      utils.click(componentPage.updateComponent);
      //utils.sendKeys(componentPage.upCompName, 'logins');
      utils.click(componentPage.updateComponentBtn);
      navigation.navigateTo('#/status/components');
     });
    it('delete component should be success', function () {
     navigation.navigateTo('#/status/components');
      browser.sleep(3500);
      utils.click(element(by.css('.status a.select-toggle')));
      browser.sleep(3000);
      utils.click(element(by.cssContainingText('.status .select-options li a', 'WebEx Meetings')));
    //  navigation.navigateUsingIntegrationBackend('#/status/components');

      utils.click(componentPage.deleteComponent);
      utils.sendKeys(componentPage.DELETEInput, 'DELETE');
      utils.wait(componentPage.deleteComponentBtn, 5000);
      utils.click(componentPage.deleteComponentBtn);
      utils.waitForPresence(element(by.css('.componentPage')), 10000);
    });
  });
});
