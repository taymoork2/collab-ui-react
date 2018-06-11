'use strict';

/*eslint-disable */

/* sauce labs notes:
 * export these envs:
 * # env vars for use with 'e2e.sh'
 * SAUCE__MAX_INSTANCES=2
 * SAUCE__USERNAME=atlas-web-limited
 * SAUCE__ACCESS_KEY=b99c8bc7-4a28-4d87-8cd8-eba7c688d48c
 *
 * as found in config/env.vars/dev file
 */

describe('Huron Auto Attendant', function () {
  var remote = require('selenium-webdriver/remote');
  var testAAName;
  var testCardClick;
  var testCardClose;
  var flow;
  
  var ceInfos = require('./aaE2ETest.json');

  describe('Hybrid Enabled tenant', function () {
    beforeAll(function () {

      deleteUtils.testAAName = deleteUtils.testAAName + "_" + Date.now();

      testAAName = element(by.css('p[title="' + deleteUtils.testAAName + '"]'));
      testCardClick = testAAName.element(by.xpath('ancestor::article')).element(by.css('.care-sub-header'));
      testCardClose = testAAName.element(by.xpath('ancestor::article')).element(by.css('.header-with-right-icon')).element(by.css('.right')).element(by.css('.close'));

      browser.setFileDetector(new remote.FileDetector());

      login.login('hybrid-org', autoattendant.careFeature);
    }, 120000);

    afterAll(function () {
      flow = protractor.promise.controlFlow();
      flow.execute(deleteUtils.findAndDeleteTestAA);
      return navigation.logout();
    });

    // TEST CASES
    it('should navigate to AA landing page and create AA in a Hybrid enabled tenant named as"' + deleteUtils.testAAName + '"', function () {

      // click new feature
      utils.click(autoattendant.newCareFeatureButton);
      browser.driver.sleep(1000);

      //select Customer Support template
      utils.click(autoattendant.customerSupportTemplate);

      // select AA
      utils.wait(autoattendant.careFeatureTypeAA, 20000);

      utils.click(autoattendant.careFeatureTypeAA);

      utils.wait(autoattendant.basicAA, 120000);
      utils.click(autoattendant.basicAA);

      utils.wait(autoattendant.newAAname, 120000);
      //enter AA name
      utils.sendKeys(autoattendant.newAAname, deleteUtils.testAAName);
      utils.wait(autoattendant.newAAname, 120000);

      utils.sendKeys(autoattendant.newAAname, protractor.Key.ENTER);

      //assert we see the create successful message
      autoattendant.assertCreateSuccess(deleteUtils.testAAName);
      browser.driver.sleep(1000);

      //we should see the AA edit page now
      utils.expectIsDisplayed(autoattendant.addAANumbers);
    }, 120000);

    it('should add Route Call via New Step action selection to the new auto attendant named as"' + deleteUtils.testAAName + '"', function () {
      //We are depending on menu order for this test, so if the Add New Step menu gets new steps or gets
      //rearranged this will break - but again it will fail immediately so it should be clear what's going on.

      autoattendant.scrollIntoView(autoattendant.addStepLast);
      utils.click(autoattendant.addStepLast);
      utils.expectIsDisplayed(autoattendant.newStep);
      utils.click(autoattendant.newStepMenu);

      // 5th menu option is Route Call
      utils.click(autoattendant.newStepSelectRouteCallForHybrid);

      // stop here as the complete menu has been tested elsewhere
      utils.expectIsDisplayed(autoattendant.routeCall);

    }, 120000);


    it('should select route to user from dropdown and select a user, then logout from tenant named"' + deleteUtils.testAAName + '"', function () {
      // clicking on route call dropdown and choosing route to User option
      utils.click(autoattendant.routeCallChoose);     
      utils.wait(autoattendant.routeToUserForHybridTenant, 10000);
      utils.click(autoattendant.routeToUserForHybridTenant);

      // choosing the user from the dropdown list
      utils.click(autoattendant.chooseRoutetoUserOption);
      utils.wait(autoattendant.routeToUserDropdownOption, 1800000);
      utils.click(autoattendant.routeToUserDropdownOption);

      // saving the tenant and closing it
      utils.expectIsEnabled(autoattendant.saveButton);
      utils.click(autoattendant.saveButton);
      utils.wait(autoattendant.saveButton, 120000);
      flow = browser.controlFlow();
      flow.execute(function () {
        return aaGetCeUtils.validateCesDefinitionForHybridOrg(ceInfos.Test7.actionSets);
     });
      //utils.wait(autoattendant.saveButton, 120000);

    }, 120000);

    it('should close AA', function () {
      utils.click(autoattendant.closeEditButton);
    }, 120000);

    it('should find new AA named "' + deleteUtils.testAAName + '" on the landing page', function () {
      utils.wait(testAAName);
      utils.expectIsEnabled(testAAName);

      //selecting the created AA
      utils.click(testCardClick);
      browser.driver.sleep(10000);
      autoattendant.scrollIntoView(autoattendant.routeCall);

      //Verify we have 1 Route Call already
      browser.driver.sleep(10000);
      utils.expectIsDisplayed(autoattendant.routeCall);
      utils.wait(autoattendant.closeEditButton, 20000);
      utils.click(autoattendant.closeEditButton);

    }, 120000);

    it('should delete new AA named "' + deleteUtils.testAAName + '" on the landing page', function () {
      // click delete X on the AA card for e2e test AA
      autoattendant.clearNotifications().then(function () {
        utils.click(testCardClose);

        // confirm dialog with e2e AA test name in it is there, then agree to delete
        utils.expectText(autoattendant.deleteModalConfirmText, 'Are you sure you want to delete the ' + deleteUtils.testAAName + ' Auto Attendant?').then(function () {
          utils.click(autoattendant.deleteModalConfirmButton);
          autoattendant.assertDeleteSuccess(deleteUtils.testAAName);
        });
      });
    }, 120000);
  });
});