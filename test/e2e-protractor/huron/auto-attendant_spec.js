'use strict';
/*eslint-disable */

describe('Huron Auto Attendant', function () {

  var initialIgnoreSync = true;

  beforeAll(function () {

    initialIgnoreSync = browser.ignoreSynchronization;

    login.login('huron-int1');

  }, 120000);

  // See AUTOATTN-556
  beforeEach(function () {
    browser.ignoreSynchronization = false;
  });

  afterEach(function () {
    browser.ignoreSynchronization = initialIgnoreSync;
  });

  describe('Create and Delete AA', function () {

    // TEST CASES
    it('should navigate to AA landing page', function () {

      // First ensure the test AA is deleted (in case last test run failed for example)
      var flow = protractor.promise.controlFlow();
      var result = flow.execute(deleteUtils.findAndDeleteTestAA);

      // and navigate to the landing page
      navigation.clickAutoAttendant();
    }, 120000);

    it('should create a new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // click new feature
      utils.click(autoattendant.newFeatureButton);

      // select AA
      utils.wait(autoattendant.featureTypeAA, 20000);

      utils.click(autoattendant.featureTypeAA);

      utils.wait(autoattendant.basicAA, 12000);
      utils.click(autoattendant.basicAA);

      utils.wait(autoattendant.newAAname, 5000);
      // enter AA name
      utils.sendKeys(autoattendant.newAAname, deleteUtils.testAAName);
      utils.wait(autoattendant.newAAname, 5000);
      utils.sendKeys(autoattendant.newAAname, protractor.Key.ENTER);

      // assert we see the create successful message
      autoattendant.assertCreateSuccess(deleteUtils.testAAName);

      // we should see the AA edit page now
      utils.expectIsDisplayed(autoattendant.addAANumbers);
      utils.expectIsDisplayed(autoattendant.sayMessage);

    }, 60000);

    it('should add a single phone number to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      utils.wait(autoattendant.addAANumbers, 12000);

      utils.click(autoattendant.numberDropDownArrow);

      // we are going to arbitrarily select the last one
      utils.click(autoattendant.numberDropDownOptions.last());

      // save and assert we see successful save message and save is disabled
      utils.click(autoattendant.saveButton);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

      utils.expectIsDisabled(autoattendant.saveButton);

    }, 60000);

    it('should delete a phone number from the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.click(autoattendant.numberIconClose);

      // save and assert we see successful save message and save is disabled
      utils.click(autoattendant.saveButton);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);
      utils.expectIsDisabled(autoattendant.saveButton);

    }, 60000);

    it('should add a second phone number to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.click(autoattendant.numberDropDownArrow);

      // we are going to arbitrarily select the last one
      utils.click(autoattendant.numberDropDownOptions.last());

      // save and assert we see successful save message and save is disabled
      utils.click(autoattendant.saveButton);

      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);
      utils.expectIsDisabled(autoattendant.saveButton);

    }, 60000);

    it('should add SayMessage Message, select Language and Voice to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // say message
      utils.click(autoattendant.sayMessageInput);
      utils.sendKeys(autoattendant.sayMessageInput, "Welcome to the AA");

      // language
      utils.click(autoattendant.sayMessageLanguage);
      utils.click(autoattendant.languageDropDownOptions);

      // voice
      utils.click(autoattendant.sayMessageVoice);
      utils.click(autoattendant.sayMessageVoiceOptions);

      // and save
      utils.expectIsEnabled(autoattendant.saveButton);
      utils.click(autoattendant.saveButton);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

      utils.expectIsDisabled(autoattendant.saveButton);
    }, 60000);

    it('should add Phone Menu Say to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      //Add Phone Menu Say Message
      utils.click(autoattendant.phoneMenuSay);
      utils.click(autoattendant.phonesayMessageInput);
      utils.sendKeys(autoattendant.phonesayMessageInput, "Press a key at the menu");
      utils.expectIsEnabled(autoattendant.saveButton);

      // language and voice
      utils.click(autoattendant.phonesayMessageLanguage);
      utils.click(autoattendant.phonelanguageDropDownOptions);
      utils.click(autoattendant.phonesayMessageVoice);
      utils.click(autoattendant.phonesayMessageVoiceOptions);

    });

    it('should add Phone Menu Repeat to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      //Add first Phone repeat Menu
      utils.click(autoattendant.phoneMenuKeys.first());
      utils.click(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).first());
      utils.click(autoattendant.phoneMenuAction.first());
      utils.click(autoattendant.phoneMenuActionOptions.first().all(by.tagName('li')).first());

    });

    it('should add Phone Menu Say to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // Press add new key plus sign
      utils.click(autoattendant.repeatPlus);

      //Add Say Message phone menu
      utils.click(autoattendant.phoneMenuKeys.last());
      utils.click(autoattendant.phoneMenuKeyOptions.last().all(by.tagName('li')).last());
      utils.click(autoattendant.phoneMenuAction.last());
      utils.click(autoattendant.phoneMenuActionOptions.last().element(by.linkText('Say Message')));
      utils.click(autoattendant.phoneMenuActionTargets.last().element(by.tagName('textarea')));
      utils.sendKeys(autoattendant.phoneMenuActionTargets.last().element(by.tagName('textarea')), "This is a phone menu say");

    });

    it('should delete one Phone Menu Repeat from the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      //Delete one repeatMenu
      utils.click(autoattendant.trash);

      // save and assert successful update message
      utils.expectIsEnabled(autoattendant.saveButton);

      utils.click(autoattendant.saveButton);

      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

      utils.expectIsDisabled(autoattendant.saveButton);

    }, 60000);

    it('should add Phone Menu Timeout to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      //Add Phone TimeOut Option
      utils.click(autoattendant.phoneMenuTimeout);
      utils.click(autoattendant.phoneMenuTimeoutOptions);

    });

    it('should add route to external number to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.click(autoattendant.repeatPlus);
      //Add Route to Phone Number
      utils.click(autoattendant.phoneMenuKeys.last());
      utils.click(autoattendant.phoneMenuKeyOptions.last().all(by.tagName('li')).last());
      utils.click(autoattendant.phoneMenuAction.last());
      utils.click(autoattendant.phoneMenuActionOptions.last().element(by.linkText('Route to Phone Number')));
      utils.click(autoattendant.phoneMenuActionTargets.last().element(by.css('input.phone-number')));

      // a bad external number should not allow save
      utils.sendKeys(autoattendant.phoneMenuActionTargets.last().element(by.css('input.phone-number')), "1111111111");

      utils.expectIsDisabled(autoattendant.saveButton);

      // but a good phone number should be able to be saved
      utils.clear(autoattendant.phoneMenuActionTargets.last().element(by.css('input.phone-number')));
      utils.sendKeys(autoattendant.phoneMenuActionTargets.last().element(by.css('input.phone-number')), "4084741234");

      // save and assert successful update message

      utils.expectIsEnabled(autoattendant.saveButton);

      utils.click(autoattendant.saveButton);

      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

      utils.expectIsDisabled(autoattendant.saveButton);

    }, 120000);

    it('should add a 2nd Say Message via Add New Step to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // Bit of a kludge. We currently have 2 Say messages & will add a third.
      // If anybody adds more before this test case then things get dicey.
      // Adding code to verify we start with 1 & end with 2. If another test adds more this test fails immediately
      // and clearly, so fix this when/if that happens. Positive break is better than a silent problem...
      //
      // Also we are depending on menu order for this test, so if the Add New Step menu gets new steps or
      // gets rearranged this will break - but again it will fail immediately so it should be clear what's going on.
      //
      // Verify we have 2 Say Messages (sayMessage and PhoneMenu) already:
      utils.expectCount(autoattendant.sayMessageAll, 2);

      // OK, now add another via Add New Step
      utils.click(autoattendant.addStep);

      utils.expectIsDisplayed(autoattendant.newStep);

      utils.click(autoattendant.newStepMenu);

      // first menu option is Add Say Message
      utils.click(autoattendant.newStepSelectFirst);

      // Since the AA already contained 2 Say Message, we should now have 3
      utils.expectCount(autoattendant.sayMessageAll, 3);

      // sayMessage code has already been fully tested elsewhere

    }, 60000);

    it('should add a 2nd Phone Menu via Add New Step to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // Bit of a kludge part 2. We currently have 1 Phone menu & will add a second.
      // If anybody adds more before this test case then things get dicey.
      // Adding code to verify we start with 1 & end with 2. If another test adds more this test fails immediately
      // and clearly, so fix this when/if that happens. Positive break is better than a silent problem...
      //
      // Also we are depending on menu order for this test, so if the Add New Step menu gets new steps or
      // gets rearranged this will break - but again it will fail immediately so it should be clear what's going on.
      //

      // Verify we have 1 Say Message already:
      // On timing issues here, see AUTOATTN-556
      utils.expectCount(autoattendant.phoneMenuAll, 1);

      utils.click(autoattendant.addStep);

      utils.expectIsDisplayed(autoattendant.newStep);

      utils.click(autoattendant.newStepMenu);

      // middle/2nd menu option is Add Phone Menu
      utils.click(autoattendant.newStepSelectSecond);

      utils.click(autoattendant.saveButton);

      // On timing issues here, see AUTOATTN-556
      utils.expectCount(autoattendant.phoneMenuAll, 2);

      // Click on the language for the new (first) Phone Menu we just added
      utils.click(autoattendant.phoneSayMessageLanguageFirst);

      // Set langauage to Galician
      utils.click(autoattendant.phoneLanguageDropDownOptionsTenth);

      // phone menu has been completely tested elsewhere

    }, 120000);

    it('should add Route Call via New Step action selection to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // We are depending on menu order for this test, so if the Add New Step menu gets new steps or gets
      // rearranged this will break - but again it will fail immediately so it should be clear what's going on.
      //
      // Verify we have 1 Route Call already:

      utils.click(autoattendant.addStep);
      utils.expectIsDisplayed(autoattendant.newStep);
      utils.click(autoattendant.newStepMenu);

      // 4th/last menu option is Route Call
      utils.click(autoattendant.newStepSelectLast);

      // stop here as the complete menu has been tested elsewhere
      utils.expectIsDisplayed(autoattendant.routeCall);

    });

    it('should add Dial By Extension via New Step action selection to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // We are depending on menu order for this test, so if the Add New Step menu gets new steps or gets
      // rearranged this will break - but again it will fail immediately so it should be clear what's going on.
      //
      //console.log('Expect 0 Dial by Extensions');
      //utils.expectCount(autoattendant.dialByExtensionAll, 0);
      utils.click(autoattendant.addStep);
      utils.expectIsDisplayed(autoattendant.newStep);
      utils.click(autoattendant.newStepMenu);
      // 3rd menu option is Dial By Extension 
      utils.click(autoattendant.newStepSelectThird);

      utils.expectIsDisplayed(autoattendant.dialByExtension);

      // say message
      utils.click(autoattendant.dialByMessageInput);
      utils.sendKeys(autoattendant.dialByMessageInput, "Enter the Extension");

      // language
      utils.click(autoattendant.dialByMessageLanguage);
      utils.click(autoattendant.dialBylanguageDropDownOptions);

      // voice
      utils.click(autoattendant.dialByMessageVoice);
      utils.click(autoattendant.dialByMessageVoiceOptions);

      // and save
      utils.expectIsEnabled(autoattendant.saveButton);
      utils.click(autoattendant.saveButton);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

      utils.expectIsDisabled(autoattendant.saveButton);

    }, 120000);

    it('should add a Schedule to AA', function () {
      utils.click(autoattendant.schedule);
      utils.wait(autoattendant.addschedule, 12000);
      utils.click(autoattendant.addschedule);

      utils.click(autoattendant.starttime);
      autoattendant.starttime.sendKeys(autoattendant.starttime, '1', protractor.Key.TAB, '00', protractor.Key.TAB, 'A');

      utils.click(autoattendant.endtime);
      autoattendant.endtime.sendKeys(autoattendant.starttime, '5', protractor.Key.TAB, '00', protractor.Key.TAB, 'P');

      utils.expectIsDisabled(autoattendant.modalsave);
      utils.click(autoattendant.day1);
      utils.expectIsEnabled(autoattendant.modalsave);
      utils.click(autoattendant.modalsave);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

    }, 60000);

    it('should add a Holiday Schedule to AA', function () {
      utils.click(autoattendant.schedule);
      utils.wait(autoattendant.toggleHolidays, 12000);
      utils.click(autoattendant.toggleHolidays);
      utils.click(autoattendant.addholiday);
      utils.sendKeys(autoattendant.holidayName, 'Thanksgiving');
      utils.expectIsDisabled(autoattendant.modalsave);
      utils.sendKeys(autoattendant.date, new Date());
      utils.click(autoattendant.selectdate);
      utils.expectIsEnabled(autoattendant.modalsave);
      utils.click(autoattendant.modalsave);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

    }, 60000);

    it('should add a Recurring Holiday Schedule to AA', function () {
      utils.click(autoattendant.schedule);
      utils.wait(autoattendant.toggleHolidays, 12000);
      utils.click(autoattendant.toggleHolidays);
      utils.click(autoattendant.addholiday);
      utils.sendKeys(autoattendant.recurAnnually, 'Recur Annually');
      utils.sendKeys(autoattendant.exactDate, 'Exact Date');
      utils.sendKeys(autoattendant.holidayName2, 'Some Holiday');
      utils.expectIsDisabled(autoattendant.modalsave);
      utils.click(autoattendant.selectEvery);
      utils.click(autoattendant.selectEveryJanuary);
      utils.click(autoattendant.selectRank);
      utils.click(autoattendant.selectRankFirst);
      utils.click(autoattendant.selectDay);
      utils.click(autoattendant.selectDayMonday);
      utils.expectIsEnabled(autoattendant.modalsave);
      utils.click(autoattendant.modalsave);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

    }, 120000);

    it('verify open/closed/holidays lanes are visible', function () {
      utils.expectIsDisplayed(autoattendant.scheduleInfoOpenHours);
      utils.expectIsDisplayed(autoattendant.scheduleInfoClosedHours);
      utils.expectIsDisplayed(autoattendant.scheduleInfoHolidayHours);
    }, 60000); 

    it('should update a AA Schedule', function () {
      utils.wait(autoattendant.schedule, 12000);
      utils.click(autoattendant.schedule);
      // utils.wait(autoattendant.starttime);
      utils.click(autoattendant.starttime);
      utils.sendKeys(autoattendant.starttime, '2:30AM');
      utils.expectIsEnabled(autoattendant.modalsave);
      utils.click(autoattendant.modalsave);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);
    }, 60000);

    it('should delete a AA Schedule', function () {
      utils.click(autoattendant.schedule);
      utils.expectIsDisabled(autoattendant.modalsave);
      utils.click(autoattendant.scheduletrash);

      utils.wait(autoattendant.toggleHolidays, 12000);
      utils.click(autoattendant.toggleHolidays);
      utils.click(autoattendant.deleteHoliday.first()); // Thanksgiving created above
      utils.click(autoattendant.deleteHoliday.first()); // Some Holiday created above

      utils.expectIsEnabled(autoattendant.modalsave);
      utils.click(autoattendant.modalsave);

      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

    }, 60000);

    it('should verify open/closed lanes are not visible', function () {
      utils.expectIsNotDisplayed(autoattendant.scheduleInfoOpenHours);
      utils.expectIsNotDisplayed(autoattendant.scheduleInfoClosedHours);
    }, 60000);

    it('should close AA edit and return to landing page', function () {

      utils.click(autoattendant.closeEditButton);

    });

    it('should find new AA named "' + deleteUtils.testAAName + '" on the landing page', function () {

      utils.expectIsEnabled(autoattendant.testCardName);

    });

    it('should delete new AA named "' + deleteUtils.testAAName + '" on the landing page', function () {

      // click delete X on the AA card for e2e test AA
      utils.click(autoattendant.testCardDelete);

      // confirm dialog with e2e AA test name in it is there, then agree to delete
      utils.expectText(autoattendant.deleteModalConfirmText, 'Are you sure you want to delete the ' + deleteUtils.testAAName + ' Auto Attendant?').then(function () {
        utils.click(autoattendant.deleteModalConfirmButton);
      });

    });

  });

});
