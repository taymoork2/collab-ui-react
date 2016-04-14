'use strict';
/*eslint-disable */

describe('Huron Auto Attendant', function () {
  var waitTime = 12000;
  beforeAll(function () {
    login.login('huron-int1');
  }, 120000);

  describe('Create and Delete AA', function () {

    // TEST CASES
    it('should navigate to AA landing page', function () {

      // First ensure the test AA is deleted (in case last test run failed for example)
      var flow = protractor.promise.controlFlow();
      var result = flow.execute(deleteUtils.findAndDeleteTestAA);

      // and navigate to the landing page
      navigation.clickAutoAttendant();

    }, 120000);

    it('should create a new auto attendant named "' + deleteUtils.testAAImportName + '"', function () {

      // click new feature
      utils.click(autoattendant.newFeatureButton);

      // select AA
      utils.wait(autoattendant.featureTypeAA, waitTime);
      utils.click(autoattendant.featureTypeAA);

      utils.wait(autoattendant.customAA, waitTime);
      utils.click(autoattendant.customAA);

      // enter AA name
      utils.sendKeys(autoattendant.newAAname, deleteUtils.testAAImportName);
      utils.sendKeys(autoattendant.newAAname, protractor.Key.ENTER);

      // assert we see the create successful message
      autoattendant.assertCreateSuccess(deleteUtils.testAAImportName);

    }, 60000);

    it('should add a Schedule to AA', function () {
      utils.click(autoattendant.schedule);
      utils.wait(autoattendant.addschedule, waitTime);
      utils.click(autoattendant.toggleHolidays);
      utils.click(autoattendant.addholiday);
      utils.sendKeys(autoattendant.holidayName, 'Thanksgiving');
      utils.expectIsDisabled(autoattendant.modalsave);
      utils.sendKeys(autoattendant.date, new Date());
      utils.click(autoattendant.selectdate);
      utils.expectIsEnabled(autoattendant.modalsave);
      utils.click(autoattendant.modalsave);
      utils.click(autoattendant.closeEditButton);
    }, 60000);

    it('should create a new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // click new feature
      utils.click(autoattendant.newFeatureButton);

      // select AA
      utils.wait(autoattendant.featureTypeAA, waitTime);
      utils.click(autoattendant.featureTypeAA);

      utils.wait(autoattendant.customAA, waitTime);
      utils.click(autoattendant.customAA);

      // enter AA name
      utils.sendKeys(autoattendant.newAAname, deleteUtils.testAAName);
      utils.sendKeys(autoattendant.newAAname, protractor.Key.ENTER);

      autoattendant.assertCreateSuccess(deleteUtils.testAAName);

    }, 60000);

    it('should add a Schedule to AA by importing', function () {
      utils.wait(autoattendant.addAANumbers, waitTime);
      utils.click(autoattendant.schedule);
      utils.wait(autoattendant.addschedule, waitTime);
      utils.click(autoattendant.importSchedule);
      utils.wait(autoattendant.importScheduleTitle, waitTime);
      utils.expectIsDisabled(autoattendant.importContinue);
      utils.selectDropdown('.import-schedule-modal', deleteUtils.testAAImportName);
      utils.expectIsEnabled(autoattendant.importContinue);
      utils.click(autoattendant.importContinue);

      utils.expectIsEnabled(autoattendant.modalsave);
      utils.click(autoattendant.modalsave);
      autoattendant.assertImportSuccess(0, 1);

    }, 120000);

    it('should close AA edit and return to landing page', function () {

      utils.click(autoattendant.closeEditButton);

    });

    it('should delete new AAs named "' + deleteUtils.testAAName + '" and "' + deleteUtils.testAAImportName + '"', function () {

      // click delete X on the AA card for e2e test AA
      utils.click(autoattendant.testCardDelete);

      // confirm dialog with e2e AA test name in it is there, then agree to delete
      utils.expectText(autoattendant.deleteModalConfirmText, 'Are you sure you want to delete the ' + deleteUtils.testAAName + ' Auto Attendant?').then(function () {
        utils.click(autoattendant.deleteModalConfirmButton);
      });

      // click delete X on the AA card for import schedule test AA
      utils.click(autoattendant.testImportCardDelete);

      // confirm dialog with import schedule test name in it is there, then agree to delete
      utils.expectText(autoattendant.deleteModalConfirmText, 'Are you sure you want to delete the ' + deleteUtils.testAAImportName + ' Auto Attendant?').then(function () {
        utils.click(autoattendant.deleteModalConfirmButton);
      });

    }, 60000);

  });

});
