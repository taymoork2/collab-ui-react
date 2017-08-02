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

  beforeAll(function () {

    deleteUtils.testAAName = deleteUtils.testAAName + "_" + Date.now();

    testAAName = element(by.css('p[title="' + deleteUtils.testAAName + '"]'));
    testCardClick = testAAName.element(by.xpath('ancestor::article')).element(by.css('.card-body'));
    testCardClose = testAAName.element(by.xpath('ancestor::article')).element(by.css('.header-with-right-icon')).element(by.css('.card-icon-div')).element(by.css('.close'));

    browser.setFileDetector(new remote.FileDetector());

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
      utils.wait(autoattendant.featureTypeAA, 20000);

      utils.click(autoattendant.featureTypeAA);

      utils.wait(autoattendant.basicAA, 120000);
      utils.click(autoattendant.basicAA);

      utils.wait(autoattendant.newAAname, 120000);
      // enter AA name
      utils.sendKeys(autoattendant.newAAname, deleteUtils.testAAName);
      utils.wait(autoattendant.newAAname, 120000);
      utils.sendKeys(autoattendant.newAAname, protractor.Key.ENTER);

      // assert we see the create successful message
      autoattendant.assertCreateSuccess(deleteUtils.testAAName);

      // we should see the AA edit page now
      utils.expectIsDisplayed(autoattendant.addAANumbers);
      autoattendant.scrollIntoView(autoattendant.sayMessage);
      utils.expectIsDisplayed(autoattendant.sayMessage);

    }, 120000);

    it('should add a single phone number to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      autoattendant.scrollIntoView(autoattendant.lanesWrapper);
      utils.click(autoattendant.addAANumbers);

      // we are going to arbitrarily select the last one
      utils.click(autoattendant.numberDropDownOptions.last());

      // No save and until valid Phone Menu - see AutoAttn 922

    }, 120000);

    it('should delete a phone number from the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.wait(autoattendant.numberByNameCloseAll, 120000);

      utils.click(autoattendant.numberByNameClose);

      expect(autoattendant.numberByNameCloseAll.count()).toEqual(0);

      // No save and until valid Phone Menu - see AutoAttn 922

    }, 120000);


    it('should add a second phone number to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.click(autoattendant.addAANumbers);

      // we are going to arbitrarily select the last one
      utils.click(autoattendant.numberDropDownOptions.last());

      // No save and until valid Phone Menu - see AutoAttn 922

    }, 120000);

    it('should add Play Message, select Language and Voice to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      var absolutePath = utils.resolvePath(autoattendant.mediaFileToUpload);

      autoattendant.scrollIntoView(autoattendant.sayMessageBody);

      // media upload

      utils.click(autoattendant.messageOptions);

      utils.click(autoattendant.playMessageOption);

      utils.wait(autoattendant.sayMediaUploadInput, 120000);

      $(autoattendant.mediaUploadSend).sendKeys(absolutePath);

      // No save and until valid Phone Menu - see AutoAttn 922

      // and delete -- once clio local upload is working -- CORS ISSUE TODO
      //utils.click(autoattendant.deleteMedia);
      //utils.click(autoattendant.deleteConfirmationModalClose);

      utils.click(autoattendant.messageOptions);

      // No save and until valid Phone Menu - see AutoAttn 922

      utils.click(autoattendant.sayMessageOption);
    }, 120000);

    it('should add SayMessage Message, select Language and Voice to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      utils.click(autoattendant.messageOptions);
      utils.click(autoattendant.sayMessageOption);

      autoattendant.scrollIntoView(autoattendant.sayMessage);

      // say message
      utils.click(autoattendant.sayMessageInput);
      utils.sendKeys(autoattendant.sayMessageInput, "Welcome to the AA");

      // language
      autoattendant.scrollIntoView(autoattendant.sayMessageLanguage);
      utils.click(autoattendant.sayMessageLanguage);
      utils.click(autoattendant.languageDropDownOptions);

      // voice
      utils.click(autoattendant.sayMessageVoice);
      utils.click(autoattendant.sayMessageVoiceOptions);

      // No save and until valid Phone Menu - see AutoAttn 922

    }, 120000);

    it('should add Phone Menu Say to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      autoattendant.scrollIntoView(autoattendant.phoneMenuSay);

      utils.wait(autoattendant.phoneMenuSay, 120000);

      autoattendant.scrollIntoView(autoattendant.phoneMenuMessageOptions);
      utils.wait(autoattendant.phoneMenuMessageOptions, 120000);

      utils.click(autoattendant.phoneMenuMessageOptions);
      utils.click(autoattendant.phoneMenuSayMessageOption);

      //Add Phone Menu Say Message
      utils.click(autoattendant.phoneMenuSay);
      utils.click(autoattendant.phonesayMessageInput);
      utils.sendKeys(autoattendant.phonesayMessageInput, "Press a key at the menu");
      utils.expectIsEnabled(autoattendant.saveButton);

      // language and voice
      autoattendant.scrollIntoView(autoattendant.phonesayMessageLanguage);
      utils.click(autoattendant.phonesayMessageLanguage);
      utils.click(autoattendant.phonelanguageDropDownOptions);
      utils.click(autoattendant.phonesayMessageVoice);
      utils.click(autoattendant.phonesayMessageVoiceOptions);

    }, 120000);

    it('should add Phone Menu Repeat to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      //Add first Phone repeat Menu
      utils.click(autoattendant.phoneMenuKeys.first());

      autoattendant.scrollIntoView(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).first());
      utils.wait(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).first());

      utils.click(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).first());
      utils.click(autoattendant.phoneMenuAction.first());
      utils.wait(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.repeatMenu)).first(), 120000);

      autoattendant.scrollIntoView(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.repeatMenu)).first());
      utils.wait(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.repeatMenu)).first(), 1200000);

      utils.click(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.repeatMenu)).first());

    }, 120000);

    it('should add Phone Menu Say to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // Press add new key plus sign
      utils.click(autoattendant.repeatPlus);

      //Add Say Message phone menu
      utils.click(autoattendant.phoneMenuKeys.last());
      utils.click(autoattendant.phoneMenuKeyOptions.last().all(by.tagName('li')).last());
      utils.click(autoattendant.phoneMenuAction.last());

      utils.click(autoattendant.phoneMenuActionOptions.last().element(by.linkText('Say Message')));
      utils.wait(autoattendant.phoneMenuActionTargetsMessageOption, 120000);

      autoattendant.scrollIntoView(autoattendant.phoneMenuActionTargetsMessageOption);

      utils.click(autoattendant.phoneMenuActionTargetsMessageOption);

      utils.click(autoattendant.phoneMenuActionTargetMessageOptions);

      utils.sendKeys(autoattendant.phoneMenuActionTargets.last().element(by.name('messageInput')), "This is a phone menu say");

    }, 120000);

    it('should delete one Phone Menu Repeat from the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      autoattendant.clearNotifications().then(function () {
        //Delete one repeatMenu
        utils.click(autoattendant.trash);

        // save and assert successful update message
        utils.expectIsEnabled(autoattendant.saveButton);

        utils.click(autoattendant.saveButton);

        autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

        utils.expectIsDisabled(autoattendant.saveButton);
      });

    }, 120000);

    it('should add Phone Menu Timeout to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      //Add Phone TimeOut Option
      utils.click(autoattendant.phoneMenuTimeout);
      utils.click(autoattendant.phoneMenuTimeoutOptions);

    }, 120000);

    it('should add route to external number to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.click(autoattendant.repeatPlus);
      //Add Route to Phone Number
      utils.click(autoattendant.phoneMenuKeys.last());
      utils.click(autoattendant.phoneMenuKeyOptions.last().all(by.tagName('li')).last());
      utils.click(autoattendant.phoneMenuAction.last());
      utils.click(autoattendant.phoneMenuActionOptions.last().element(by.linkText('Route to Phone Number')));
      utils.click(autoattendant.phoneMenuActionTargets.last().element(by.name('phoneinput')));

      // a bad external number should not allow save
      utils.sendKeys(autoattendant.phoneMenuActionTargets.last().element(by.name('phoneinput')), "1111111111");

      utils.expectIsDisabled(autoattendant.saveButton);

      // but a good phone number should be able to be saved
      utils.clear(autoattendant.phoneMenuActionTargets.last().element(by.name('phoneinput')));
      utils.sendKeys(autoattendant.phoneMenuActionTargets.last().element(by.name('phoneinput')), "4084741234");

      // save and assert successful update message

      utils.expectIsEnabled(autoattendant.saveButton);

      utils.click(autoattendant.saveButton);

      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

      utils.expectIsDisabled(autoattendant.saveButton);

    }, 120000);

    it('should add route to SIP endpoint to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.click(autoattendant.repeatPlus);
      //Add Route to SIP Number
      utils.click(autoattendant.phoneMenuKeys.last());
      utils.click(autoattendant.phoneMenuKeyOptions.last().all(by.tagName('li')).last());
      utils.click(autoattendant.phoneMenuAction.last());
      utils.click(autoattendant.phoneMenuActionOptions.last().element(by.linkText('Route to SIP Endpoint')));
      utils.click(autoattendant.phoneMenuActionTargets.last().element(by.css('input.aa-sip-input')));

      // a bad external number should not allow save
      utils.sendKeys(autoattendant.phoneMenuActionTargets.last().element(by.css('input.aa-sip-input')), "12341234");

      utils.expectIsDisabled(autoattendant.saveButton);

      // but a good phone number should be able to be saved
      utils.clear(autoattendant.phoneMenuActionTargets.last().element(by.css('input.aa-sip-input')));
      utils.sendKeys(autoattendant.phoneMenuActionTargets.last().element(by.css('input.aa-sip-input')), "sip:test123@ciscospark.com");

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
      utils.click(autoattendant.addStep(1));

      utils.expectIsDisplayed(autoattendant.newStep);

      utils.click(autoattendant.newStepMenu);

      // first menu option is Add Say Message
      utils.click(autoattendant.newStepSelectSayMessage);

      // Since the AA already contained 2 Say Message, we should now have 3
      autoattendant.scrollIntoView(autoattendant.sayMessageAll.first());
      utils.expectCount(autoattendant.sayMessageAll, 3);

      // sayMessage code has already been fully tested elsewhere

    }, 120000);

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
      autoattendant.scrollIntoView(autoattendant.phoneMenuAll.first());

      utils.expectCount(autoattendant.phoneMenuAll, 1);

      autoattendant.scrollIntoView(autoattendant.addStep(1));
      utils.click(autoattendant.addStep(1));

      utils.expectIsDisplayed(autoattendant.newStep);

      utils.click(autoattendant.newStepMenu);

      // middle/2nd menu option is Add Phone Menu
      utils.click(autoattendant.newStepSelectPhoneMenu);

      // On timing issues here, see AUTOATTN-556
      utils.expectCount(autoattendant.phoneMenuAll, 2);

      autoattendant.scrollIntoView(autoattendant.phoneMenuAll.first());

      utils.click(autoattendant.saveButton);

      // but leave in a saveable state

      // Press add new key plus sign
      utils.click(autoattendant.repeatPlus);

      //Add Say Message phone menu
      utils.click(autoattendant.phoneMenuKeys.first());
      utils.click(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).last());
      utils.click(autoattendant.phoneMenuAction.first());

      utils.click(autoattendant.phoneMenuActionOptions.first().element(by.linkText('Say Message')));
      utils.wait(autoattendant.phoneMenuActionTargetsFirstMessageOption, 120000);

      autoattendant.scrollIntoView(autoattendant.phoneMenuActionTargetsFirstMessageOption);

      utils.click(autoattendant.phoneMenuActionTargetsFirstMessageOption);

      utils.click(autoattendant.phoneMenuActionTargetFirstMessageOptions);

      utils.sendKeys(autoattendant.phoneMenuActionTargets.first().element(by.name('messageInput')), "Updated the second phone menu??");

    }, 120000);


    it('should add Route Call via New Step action selection to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // We are depending on menu order for this test, so if the Add New Step menu gets new steps or gets
      // rearranged this will break - but again it will fail immediately so it should be clear what's going on.
      //
      // Verify we have 1 Route Call already:

      autoattendant.scrollIntoView(autoattendant.addStepLast);
      utils.click(autoattendant.addStepLast);
      utils.expectIsDisplayed(autoattendant.newStep);
      utils.click(autoattendant.newStepMenu);

      // 4th/last menu option is Route Call
      utils.click(autoattendant.newStepSelectRouteCall);

      // stop here as the complete menu has been tested elsewhere
      utils.expectIsDisplayed(autoattendant.routeCall);

    }, 120000);

    it('should add Dial By Extension via New Step action selection to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // We are depending on menu order for this test, so if the Add New Step menu gets new steps or gets
      // rearranged this will break - but again it will fail immediately so it should be clear what's going on.
      autoattendant.scrollIntoView(autoattendant.addStepLast);
      utils.click(autoattendant.addStepLast);
      utils.expectIsDisplayed(autoattendant.newStep);
      utils.click(autoattendant.newStepMenu);
      // 3rd menu option is Dial By Extension
      utils.click(autoattendant.newStepSelectDialByExt);

      utils.wait(autoattendant.dialByExtension, 120000);

      autoattendant.scrollIntoView(autoattendant.dialByExtension);

      // utils.expectIsDisplayed(autoattendant.dialByExtension);

      utils.click(autoattendant.dialByMessageOptions);
      utils.click(autoattendant.dialBySayMessageOption);

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
      // utils.expectIsEnabled(autoattendant.saveButton);
      utils.click(autoattendant.saveButton);

      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

    }, 120000);

    it('should add a Dial By Extension Play Message to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      autoattendant.clearNotifications().then(function () {

        var absolutePath = utils.resolvePath(autoattendant.mediaFileToUpload);
        autoattendant.scrollIntoView(autoattendant.dialByExtension);

        // media upload

        utils.click(autoattendant.dialByMessageOptions);

        utils.click(autoattendant.dialByPlayMessageOption);

        utils.wait(autoattendant.dialByMediaUploadInput, 120000);

        $(autoattendant.mediaUploadSend).sendKeys(absolutePath);

        // and save
        utils.wait(autoattendant.saveButton, 120000);

        utils.click(autoattendant.saveButton);

        autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

        // use if you are running sauce labs. does not work running locally
        // utils.expectIsDisabled(autoattendant.saveButton);

        utils.click(autoattendant.dialByMessageOptions);
        utils.click(autoattendant.dialBySayMessageOption);

      });

    }, 120000);

    it('should add Caller Input via New Step action selection to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      autoattendant.clearNotifications().then(function() {
        autoattendant.scrollIntoView(autoattendant.addStepLast);
        utils.click(autoattendant.addStepLast);
        utils.expectIsDisplayed(autoattendant.newStep);
        utils.click(autoattendant.newStepMenu);

        // 4th/last menu option is Caller Input
        utils.click(autoattendant.newStepCallerInput);
        utils.wait(autoattendant.callerInputFirst, 120000);
        autoattendant.scrollIntoView(autoattendant.callerInputFirst);
        utils.sendKeys(autoattendant.callerInputNameVariable, "named Variable");
        utils.click(autoattendant.callerInputGetDigits);
        autoattendant.scrollIntoView(autoattendant.callerInputFirst);
        utils.click(autoattendant.callerInputAddAction);
        autoattendant.scrollIntoView(autoattendant.callerInputFirst);
        utils.sendKeys(autoattendant.callerInputTextFirst, "Cisco_");
        utils.wait(autoattendant.saveButton, 120000);
        utils.expectIsDisabled(autoattendant.saveButton);
        utils.clear(autoattendant.callerInputTextFirst);
        utils.sendKeys(autoattendant.callerInputTextFirst, "Auto Attendant");
        utils.wait(autoattendant.saveButton, 120000);
        utils.expectIsEnabled(autoattendant.saveButton);
        utils.click(autoattendant.saveButton);
        autoattendant.assertUpdateSuccess(deleteUtils.testAAName);
      });

    }, 120000);

    it('should add Decision Conditional via New Step action selection to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      autoattendant.scrollIntoView(autoattendant.addStepLast);
      utils.click(autoattendant.addStepLast);
      utils.expectIsDisplayed(autoattendant.newStep);
      utils.click(autoattendant.newStepMenu);

      // 2nd menu option is Decision
      utils.click(autoattendant.newStepDecision);
      utils.wait(autoattendant.decisionFirst, 120000);
      autoattendant.scrollIntoView(autoattendant.decisionFirst);

      utils.click(autoattendant.decisionIf);

      utils.wait(autoattendant.decisionIf, 120000);

      utils.click(autoattendant.decisionIfDropDownOptions);

      utils.click(autoattendant.decisionIfSession);

      utils.wait(autoattendant.decisionIfSessionVarDropDownOptions, 120000);

      utils.click(autoattendant.decisionIfSessionVarDropDownOptions);

      utils.sendKeys(autoattendant.decisionVariableIsTextArea, "My variable input");

      utils.click(autoattendant.decisionThen);

      utils.wait(autoattendant.decisionThen, 120000);

      utils.click(autoattendant.decisionThenDropDownOptions);

      utils.wait(autoattendant.decisionPhoneNumber, 120000);
      utils.sendKeys(autoattendant.decisionPhoneNumber, "2065551234");

    }, 120000);

    it('should delete Caller Input and bring up confirming Modal', function () {
      autoattendant.scrollIntoView(autoattendant.callerInputFirst);

      utils.click(autoattendant.callerInputRemoveAction);

      utils.expectIsEnabled(autoattendant.varNameSave);
      utils.click(autoattendant.varNameSave);

    }, 120000);

    it('should add a Schedule to AA', function () {
      autoattendant.scrollIntoView(autoattendant.schedule);

      utils.click(autoattendant.schedule);

      utils.wait(autoattendant.addschedule, 120000);
      utils.click(autoattendant.addschedule);

      utils.click(autoattendant.starttime);
      autoattendant.starttime.sendKeys(autoattendant.starttime, '1', protractor.Key.TAB, '00', protractor.Key.TAB, 'A');

      utils.click(autoattendant.endtime);
      autoattendant.endtime.sendKeys(autoattendant.starttime, '5', protractor.Key.TAB, '00', protractor.Key.TAB, 'P');

      utils.expectIsDisabled(autoattendant.modalsave);
      utils.click(autoattendant.day1);
      utils.wait(autoattendant.toggleHolidays, 120000);
      utils.click(autoattendant.toggleHolidays);
      utils.wait(autoattendant.addholiday, 120000);
      utils.click(autoattendant.addholiday);
      utils.sendKeys(autoattendant.holidayName, 'Thanksgiving');
      utils.expectIsDisabled(autoattendant.modalsave);
      utils.click(autoattendant.date);
      utils.click(autoattendant.selectdate);
      utils.wait(autoattendant.addholiday, 120000);
      utils.click(autoattendant.addholiday);
      utils.click(autoattendant.recurAnnually);
      utils.click(autoattendant.exactDate);
      //utils.sendKeys(autoattendant.exactDate, 'Exact Date');
      utils.sendKeys(autoattendant.holidayName2, 'Some Holiday');
      utils.expectIsDisabled(autoattendant.modalsave);
      utils.click(autoattendant.selectEvery);
      utils.click(autoattendant.selectEveryJanuary);
      utils.click(autoattendant.selectRank);
      utils.click(autoattendant.selectRankFirst);
      utils.click(autoattendant.selectDay);
      utils.click(autoattendant.selectDayMonday);

      autoattendant.scrollIntoView(autoattendant.timeZone);

      utils.click(autoattendant.timeZone);

      utils.click(autoattendant.firstTimeZoneElement);

      utils.expectIsEnabled(autoattendant.modalsave);
      utils.click(autoattendant.modalsave);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

    }, 120000);

    it('verify open/closed/holidays lanes are visible', function () {
      utils.expectIsDisplayed(autoattendant.scheduleInfoOpenHours);
      utils.expectIsDisplayed(autoattendant.scheduleInfoClosedHours);
      utils.expectIsDisplayed(autoattendant.scheduleInfoHolidayHours);
    }, 120000);

    it('should dismiss schedule modal on browser back button', function () {
      utils.wait(autoattendant.schedule, 120000);
      utils.click(autoattendant.schedule);
      utils.expectIsDisplayed(autoattendant.modalsave);
      browser.driver.navigate().back();
      utils.expectIsNotDisplayed(autoattendant.modalsave);
    }, 120000);

    it('should be able to delete open/holiday lane for AA', function () {
      utils.click(autoattendant.schedule);

      utils.click(autoattendant.scheduletrash);

      utils.wait(autoattendant.toggleHolidays, 120000);
      utils.click(autoattendant.toggleHolidays);
      utils.click(autoattendant.deleteHoliday.first()); // Thanksgiving created above
      utils.click(autoattendant.deleteHoliday.first()); // Some Holiday created above

      utils.expectIsEnabled(autoattendant.modalsave);
      utils.click(autoattendant.modalsave);

      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

    }, 120000);

    it('should verify open/closed lanes are not visible', function () {
      utils.expectIsNotDisplayed(autoattendant.scheduleInfoOpenHours);
      utils.expectIsNotDisplayed(autoattendant.scheduleInfoClosedHours);
    }, 120000);

    it('should add REST API via New Step action selection to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // REST API
      autoattendant.scrollIntoView(autoattendant.addStepLast);
      utils.click(autoattendant.addStepLast);
      utils.expectIsDisplayed(autoattendant.newStep);
      utils.click(autoattendant.newStepMenu);

      // 5th menu option is REST API
      utils.click(autoattendant.newStepSelectRestApi);

      utils.expectIsDisplayed(autoattendant.restApi);

    });

    it('should click configureApi hyperlink and a modal is opened with components for rest api url and "' + deleteUtils.testAAName + '"', function () {

      // REST API
      autoattendant.scrollIntoView(autoattendant.restApi);

      utils.click(autoattendant.configureApi);
      utils.expectIsDisplayed(autoattendant.configureApiURL);
      utils.expectIsDisplayed(autoattendant.sessionVar);
      utils.expectIsDisplayed(autoattendant.addVariableToSet);

    });
    it('should add url and it should be visible in REST API new step upon save "' + deleteUtils.testAAName + '"', function () {

      // REST API
      utils.click(autoattendant.configureApiURL);
      utils.sendKeys(autoattendant.configureApiURL, "This is test URL");

      utils.click(autoattendant.restResponseDataBlock);
      utils.sendKeys(autoattendant.restResponseDataBlock, "Test Response Block");

      utils.click(autoattendant.sessionVar);
      utils.click(autoattendant.newSessionVar);

      utils.sendKeys(autoattendant.newVariableName, "123");

      utils.click(autoattendant.addVariableToSet);

      utils.expectCount(autoattendant.sessionVarAll, 2);

      utils.expectIsDisabled(autoattendant.saveBtn);

      utils.click(autoattendant.restApiTrash);

      utils.expectIsEnabled(autoattendant.saveBtn);

      utils.click(autoattendant.saveBtn);

      utils.expectIsDisplayed(autoattendant.restApiUrlLabel);
      utils.waitForText(autoattendant.restApiUrlLabel, "This is test URL");

    });


    it('should close AA edit and return to landing page', function () {

      utils.click(autoattendant.closeEditButton);

    }, 120000);

    it('should find new AA named "' + deleteUtils.testAAName + '" on the landing page', function () {
      utils.wait(testAAName);

      utils.expectIsEnabled(testAAName);

      utils.click(testCardClick);
      utils.wait(autoattendant.addAANumbers, 20000);

      utils.expectIsDisplayed(autoattendant.addAANumbers);
      autoattendant.scrollIntoView(autoattendant.sayMessageAll.first());

      // Verify we have 4 Say Messages (2 sayMessage and PhoneMenu's) already:
      utils.expectCount(autoattendant.sayMessageAll, 4);

      // Verify two phone messages

      autoattendant.scrollIntoView(autoattendant.phoneMenuAll.first());

      utils.expectCount(autoattendant.phoneMenuAll, 2);

      autoattendant.scrollIntoView(autoattendant.dialByExtension);

      utils.expectIsDisplayed(autoattendant.dialByExtension);

      utils.click(autoattendant.closeEditButton);

    }, 120000);

    it('should delete new AA named "' + deleteUtils.testAAName + '" on the landing page', function () {
      // click delete X on the AA card for e2e test AA
      utils.click(testCardClose);

      // confirm dialog with e2e AA test name in it is there, then agree to delete
      utils.expectText(autoattendant.deleteModalConfirmText, 'Are you sure you want to delete the ' + deleteUtils.testAAName + ' Auto Attendant?').then(function () {
        utils.click(autoattendant.deleteModalConfirmButton);
        autoattendant.assertDeleteSuccess(deleteUtils.testAAName);
      });

    }, 120000);

  });

});
