'use strict';
/*eslint-disable */

/* global describe */
/* global it */
/* global browser */
/* global utils */
/* global login */
/* global navigation */
/* global notifications */
/* global protractor */

describe('Huron Auto Attendant', function () {

  beforeAll(function () {
    login.login('huron-int1');
  }, 120000);

  describe('Create AA', function () {

    // TEST CASES
    it('should navigate to "Add new Auto Attendant" and create a new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      // Cleanup the leftover (from last test run) auto-attendant
      var flow = protractor.promise.controlFlow();
      var result = flow.execute(deleteUtils.findAndDeleteTestAA);

      navigation.clickAutoAttendant();

      utils.wait(autoattendant.newFeatureButton, 12000);
      utils.click(autoattendant.newFeatureButton);

      utils.wait(autoattendant.featureTypeAA, 8000);
      utils.click(autoattendant.featureTypeAA);

      utils.sendKeys(autoattendant.name, deleteUtils.testAAName);
      utils.sendKeys(autoattendant.name, protractor.Key.ENTER);

      utils.wait(autoattendant.addAANumbers, 8000);
      utils.expectIsDisplayed(autoattendant.addAANumbers);
    });
  });

});
