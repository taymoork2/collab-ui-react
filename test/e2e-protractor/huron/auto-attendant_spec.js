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

      utils.wait(autoattendant.newFeatureButton, 15000);
      utils.click(autoattendant.newFeatureButton);

      utils.wait(autoattendant.featureTypeAA, 12000);
      utils.click(autoattendant.featureTypeAA);

      utils.sendKeys(autoattendant.newAAname, deleteUtils.testAAName);
      utils.sendKeys(autoattendant.newAAname, protractor.Key.ENTER);

      utils.wait(autoattendant.addAANumbers, 12000);
      utils.expectIsDisplayed(autoattendant.addAANumbers);

    });

    it('should add a single phone number to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.click(autoattendant.numberDropDownArrow);

      // we are going to arbitrarily select the first one
      utils.click(autoattendant.numberDropDownOptions.get(0));

      utils.click(autoattendant.saveButton);

      notifications.assertSuccess(deleteUtils.testAAName + ' updated successfully');

    });

  });

});
