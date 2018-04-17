'use strict';

/*eslint-disable */

describe('Huron Auto Attendant', function () {
  var waitTime = 12000;

  var testAAName;
  var testAAImportName;
  var testCardClose;
  var testImportCardClose;

  beforeAll(function () {
    deleteUtils.testAAName = deleteUtils.testAAName + "_" + Date.now();
    deleteUtils.testAAImportName = deleteUtils.testAAImportName + "_" + Date.now();

    testAAName = element(by.css('p[title="' + deleteUtils.testAAName + '"]'));
    testAAImportName = element(by.css('p[title="' + deleteUtils.testAAImportName + '"]'));
    testCardClose = testAAName.element(by.xpath('ancestor::article')).element(by.css('.header-with-right-icon')).element(by.css('.card-icon-div')).element(by.css('.close'));
    testImportCardClose = testAAImportName.element(by.xpath('ancestor::article')).element(by.css('.header-with-right-icon')).element(by.css('.card-icon-div')).element(by.css('.close'));
 
    login.login('aa-admin', autoattendant.callFeature);
  }, 120000);
  
  afterAll(function () {
    var flow = protractor.promise.controlFlow();
    return flow.execute(deleteUtils.findAndDeleteTestAA);
  });


  describe('Create and Delete AA', function () {

    // TEST CASES
    it('should navigate to AA landing page and create AA', function () {
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

    }, 120000);

    it('should add a Schedule to AA', function () {
      utils.click(autoattendant.schedule);
      utils.wait(autoattendant.addschedule, waitTime);
      utils.click(autoattendant.toggleHolidays);
      utils.click(autoattendant.addholiday);
      utils.click(autoattendant.holidayBehaviour);
      utils.sendKeys(autoattendant.holidayName, 'Thanksgiving');
      utils.expectIsDisabled(autoattendant.modalsave);
      utils.click(autoattendant.date);
      utils.click(autoattendant.selectdate);
      utils.expectIsEnabled(autoattendant.modalsave);
      utils.click(autoattendant.modalsave);
      autoattendant.assertCalendarUpdateSuccess(deleteUtils.testAAImportName);
    }, 60000);

    it('should expect a lane with Closed/Holiday Label', function () {
      utils.expectIsDisplayed(autoattendant.closedHoursLane);
      utils.click(autoattendant.closeEditButton);
    });

    it('should create a new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // ensure prior create/update messages are cleared
      notifications.clearNotifications();

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
      // ensure prior create/update messages are cleared
      notifications.clearNotifications();

      utils.wait(autoattendant.addAANumbers, waitTime);
      utils.click(autoattendant.schedule);
      utils.wait(autoattendant.addschedule, waitTime);
      utils.click(autoattendant.importSchedule);
      utils.wait(autoattendant.importScheduleTitle, waitTime);
      utils.expectIsDisabled(autoattendant.importContinue);
      utils.selectDropdown('.import-schedule-modal', deleteUtils.testAAImportName);
      utils.expectIsEnabled(autoattendant.importContinue);
      utils.click(autoattendant.importContinue);

      autoattendant.assertImportSuccess(0, 1);

      // verify open/close and holiday bars are clickable
      utils.click(autoattendant.selectHolidaysBar);
      utils.expectIsDisplayed(autoattendant.holidayBehaviour);
      utils.click(autoattendant.selectOpenCloseBar);
      utils.expectIsDisplayed(autoattendant.addschedule);

      utils.expectIsEnabled(autoattendant.modalsave);
      utils.click(autoattendant.modalsave);

    }, 120000);

    it('should click schdule lane header boxes and see the schedule config page can be opened', function () {

      notifications.clearNotifications();

      utils.click(autoattendant.selectOpenHoursBox);
      utils.click(autoattendant.scheduleCloseButton);
      utils.click(autoattendant.selectHolidayHoursBox);
      utils.click(autoattendant.scheduleCloseButton);

    });

    it('should close AA edit and return to landing page', function () {

      utils.click(autoattendant.closeEditButton);

    });

    it('should delete new AAs named "' + deleteUtils.testAAName + '" and "' + deleteUtils.testAAImportName + '"', function () {

      notifications.clearNotifications();

      // click delete X on the AA card for e2e test AA
      utils.click(testCardClose);

      // confirm dialog with e2e AA test name in it is there, then agree to delete
      utils.expectText(autoattendant.deleteModalConfirmText, 'Are you sure you want to delete the ' + deleteUtils.testAAName + ' Auto Attendant?').then(function () {
        utils.click(autoattendant.deleteModalConfirmButton);
        autoattendant.assertDeleteSuccess(deleteUtils.testAAName);
      });

      // click delete X on the AA card for import schedule test AA
      utils.click(testImportCardClose);

      // confirm dialog with import schedule test name in it is there, then agree to delete
      utils.expectText(autoattendant.deleteModalConfirmText, 'Are you sure you want to delete the ' + deleteUtils.testAAImportName + ' Auto Attendant?').then(function () {
        utils.click(autoattendant.deleteModalConfirmButton);
        autoattendant.assertDeleteSuccess(deleteUtils.testAAImportName);
      });

    }, 60000);

  });

});
