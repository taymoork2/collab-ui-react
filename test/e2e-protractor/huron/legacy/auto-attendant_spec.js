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

/* globals TIMEOUT, LONG_TIMEOUT, VERY_LONG_TIMEOUT */

describe('Huron Auto Attendant', function () {
  var remote = require('selenium-webdriver/remote');
  var testAAName;
  var testCardClick;
  var testCardClose;
  var flow;

  var ceInfos = require('./aaE2ETest.json');

  describe('Multisite enabled tenant', function () {
    beforeAll(function () {

      deleteUtils.testAAName = deleteUtils.testAAName + "_" + Date.now();

      testAAName = element(by.css('p[title="' + deleteUtils.testAAName + '"]'));
      testCardClick = testAAName.element(by.xpath('ancestor::article')).element(by.css('.card-body'));
      testCardClose = testAAName.element(by.xpath('ancestor::article')).element(by.css('.header-with-right-icon')).element(by.css('.card-icon-div')).element(by.css('.close'));

      browser.setFileDetector(new remote.FileDetector());

      login.login('aa-multisite-admin', autoattendant.callFeature);
    }, LONG_TIMEOUT);

    afterAll(function () {
      flow = protractor.promise.controlFlow();
      flow.execute(deleteUtils.findAndDeleteTestAA);
      return navigation.logout();
    });

    // TEST CASES
    it('should navigate to AA landing page and create AA in a MultiSite enabled tenant', function () {

      // click new feature
      utils.click(autoattendant.newFeatureButton);

      // select AA
      utils.expectIsDisplayed(autoattendant.featureTypeAA, LONG_TIMEOUT);

      utils.click(autoattendant.featureTypeAA);

      utils.expectIsDisplayed(autoattendant.basicAA, LONG_TIMEOUT);
      utils.click(autoattendant.basicAA);

      utils.expectIsDisplayed(autoattendant.newAAname, LONG_TIMEOUT);
      // enter AA name
      utils.sendKeys(autoattendant.newAAname, deleteUtils.testAAName);
      utils.expectIsDisplayed(autoattendant.newAAname, LONG_TIMEOUT);
      utils.sendKeys(autoattendant.newAAname, protractor.Key.ENTER);

      // assert we see the create successful message
      autoattendant.assertCreateSuccess(deleteUtils.testAAName);

      // we should see the AA edit page now
      utils.expectIsDisplayed(autoattendant.addAANumbers);
      autoattendant.scrollIntoView(autoattendant.sayMessage);
      utils.expectIsDisplayed(autoattendant.sayMessage);

    }, LONG_TIMEOUT);

    it('should add Dial By Extension (in MultiSite Enabled tenant) via New Step action selection to the new auto attendant named' + deleteUtils.testAAName + '"', function () {

      // We are depending on menu order for this test, so if the Add New Step menu gets new steps or gets
      // rearranged this will break - but again it will fail immediately so it should be clear what's going on.
      autoattendant.scrollIntoView(autoattendant.addStepLast);
      utils.click(autoattendant.addStepLast);
      utils.expectIsDisplayed(autoattendant.newStep);
      utils.click(autoattendant.newStepMenu);
      // 3rd menu option is Dial By Extension
      utils.click(autoattendant.newStepSelectDialByExt);

      utils.expectIsDisplayed(autoattendant.dialByExtension, LONG_TIMEOUT);

      autoattendant.scrollIntoView(autoattendant.dialByExtension);


      utils.click(autoattendant.dialByMessageOptions);
      utils.click(autoattendant.dialBySayMessageOption);

      // say message
      utils.click(autoattendant.dialByMessageInput);
      utils.sendKeys(autoattendant.dialByMessageInput, "Enter the Extension");
      utils.click(autoattendant.dialByExtensionDynamicButton);
      utils.expectIsDisplayed(autoattendant.dynamicVariable, LONG_TIMEOUT);
      utils.click(autoattendant.dynamicVariable);
      utils.expectIsDisplayed(autoattendant.dynamicVariable, LONG_TIMEOUT);
      utils.click(autoattendant.variable);
      utils.expectIsDisplayed(autoattendant.dynamicVariable, LONG_TIMEOUT);
      utils.click(autoattendant.readAs);
      utils.click(autoattendant.readAsVariable);
      utils.click(autoattendant.okButton);
      utils.expectIsDisplayed(autoattendant.okButton, TIMEOUT);

      // language
      utils.click(autoattendant.dialByMessageLanguage);
      utils.click(autoattendant.dialBylanguageDropDownOptions);

      // voice
      utils.click(autoattendant.dialByMessageVoice);
      utils.click(autoattendant.dialByMessageVoiceOptions);

      //ESN checkbox
      utils.click(autoattendant.dialByESNCheckBox);
      utils.expectIsDisplayed(autoattendant.dialByESNCheckBox, LONG_TIMEOUT);
      utils.expectIsDisplayed(autoattendant.dialByESNRoutingPrefixText);
      utils.click(autoattendant.dialByESNDropDown);
      utils.expectIsDisplayed(autoattendant.dialByESNDropDown, LONG_TIMEOUT);
      utils.click(autoattendant.selectedESN);

      // and save
      // utils.expectIsEnabled(autoattendant.saveButton);
      utils.click(autoattendant.saveButton);
      utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT); 

    }, LONG_TIMEOUT);

    it('should close AA (from the MultiSite enabled tenant) edit and return to landing page and then logout from this tenant', function () {

      utils.click(autoattendant.closeEditButton);

    }, LONG_TIMEOUT);
    it('should find new AA named "' + deleteUtils.testAAName + '" on the landing page', function () {
      utils.expectIsDisplayed(testAAName);

      utils.expectIsEnabled(testAAName);

      utils.click(testCardClick);
      utils.expectIsDisplayed(autoattendant.addAANumbers, TIMEOUT);

      autoattendant.scrollIntoView(autoattendant.dialByExtension);

      utils.expectIsDisplayed(autoattendant.dialByExtension);

      utils.click(autoattendant.closeEditButton);

    }, LONG_TIMEOUT);

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
    }, LONG_TIMEOUT);
  });

  describe('MultiSite disabled tenant', function () {
    beforeAll(function () {

      deleteUtils.testAAName = deleteUtils.testAAName + "_" + Date.now();

      testAAName = element(by.css('p[title="' + deleteUtils.testAAName + '"]'));
      testCardClick = testAAName.element(by.xpath('ancestor::article')).element(by.css('.card-body'));
      testCardClose = testAAName.element(by.xpath('ancestor::article')).element(by.css('.header-with-right-icon')).element(by.css('.card-icon-div')).element(by.css('.close'));

      browser.setFileDetector(new remote.FileDetector());

      login.login('aa-admin', autoattendant.callFeature);
    }, LONG_TIMEOUT);

    afterAll(function () {
      flow = protractor.promise.controlFlow();
      return flow.execute(deleteUtils.findAndDeleteTestAA);
    });

    //describe('Create and Delete AA', function () {

    // TEST CASES
    it('should navigate to AA landing page and create AA', function () {

      autoattendant.clearNotifications().then(function () {
        // click new feature
        utils.click(autoattendant.newFeatureButton);

        // select AA
        utils.expectIsDisplayed(autoattendant.featureTypeAA, LONG_TIMEOUT);

        utils.click(autoattendant.featureTypeAA);

        utils.expectIsDisplayed(autoattendant.basicAA, LONG_TIMEOUT);
        utils.click(autoattendant.basicAA);

        utils.expectIsDisplayed(autoattendant.newAAname, LONG_TIMEOUT);
        // enter AA name
        utils.sendKeys(autoattendant.newAAname, deleteUtils.testAAName);
        utils.expectIsDisplayed(autoattendant.newAAname, LONG_TIMEOUT);
        utils.sendKeys(autoattendant.newAAname, protractor.Key.ENTER);

        // assert we see the create successful message
        autoattendant.assertCreateSuccess(deleteUtils.testAAName);

        // we should see the AA edit page now
        utils.expectIsDisplayed(autoattendant.addAANumbers, LONG_TIMEOUT);
        autoattendant.scrollIntoView(autoattendant.sayMessage);
        utils.expectIsDisplayed(autoattendant.sayMessage, LONG_TIMEOUT);
      });

    }, LONG_TIMEOUT);

    it('should add a single phone number to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      autoattendant.scrollIntoView(autoattendant.lanesWrapper);
      utils.click(autoattendant.addAANumbers);

      // we are going to arbitrarily select the last one
      utils.click(autoattendant.numberDropDownOptions.last());

      // No save and until valid Phone Menu - see AutoAttn 922

    }, LONG_TIMEOUT);

    it('should delete a phone number from the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.expectIsDisplayed(autoattendant.numberByNameCloseAll, LONG_TIMEOUT);

      utils.click(autoattendant.numberByNameClose);

      expect(autoattendant.numberByNameCloseAll.count()).toBe(0);

      // No save and until valid Phone Menu - see AutoAttn 922

    }, LONG_TIMEOUT);


    it('should add a second phone number to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.click(autoattendant.addAANumbers);

      // we are going to arbitrarily select the last one
      utils.click(autoattendant.numberDropDownOptions.last());

      // No save and until valid Phone Menu - see AutoAttn 922

    }, LONG_TIMEOUT);

    it('should add Play Message, select Language and Voice to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      var absolutePath = utils.resolvePath(autoattendant.mediaFileToUpload);

      autoattendant.scrollIntoView(autoattendant.sayMessageBody);

      // media upload

      utils.click(autoattendant.messageOptions);

      utils.click(autoattendant.playMessageOption);

      utils.expectIsDisplayed(autoattendant.sayMediaUploadInput, LONG_TIMEOUT);

      $(autoattendant.mediaUploadSend).sendKeys(absolutePath);

      // No save and until valid Phone Menu - see AutoAttn 922

      // and delete -- once clio local upload is working -- CORS ISSUE TODO
      //utils.click(autoattendant.deleteMedia);
      //utils.click(autoattendant.deleteConfirmationModalClose);
      utils.expectIsEnabled(autoattendant.deleteMedia, LONG_TIMEOUT);
      utils.click(autoattendant.messageOptions);

      // No save and until valid Phone Menu - see AutoAttn 922

      utils.click(autoattendant.sayMessageOption);
    }, LONG_TIMEOUT);

    it('should add SayMessage Message, select Language and Voice to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      utils.click(autoattendant.messageOptions);
      utils.click(autoattendant.sayMessageOption);

      autoattendant.scrollIntoView(autoattendant.sayMessage);

      // say message
      utils.click(autoattendant.sayMessageInput);
      utils.sendKeys(autoattendant.sayMessageInput, "Welcome to the AA");
      utils.click(autoattendant.sayMessageDynamicButton)
      utils.expectIsDisplayed(autoattendant.dynamicVariable, VERY_LONG_TIMEOUT);
      utils.click(autoattendant.readAs);
      utils.click(autoattendant.readAsVariable);
      utils.click(autoattendant.dynamicVariable);
      utils.expectIsDisplayed(autoattendant.dynamicVariable, LONG_TIMEOUT);
      utils.click(autoattendant.variable);
      utils.expectIsDisplayed(autoattendant.dynamicVariable, LONG_TIMEOUT);

      utils.click(autoattendant.okButton);
      utils.expectIsDisplayed(autoattendant.okButton, TIMEOUT);


      // language
      autoattendant.scrollIntoView(autoattendant.sayMessageLanguage);
      utils.click(autoattendant.sayMessageLanguage);
      utils.click(autoattendant.languageDropDownOptions);

      // voice
      utils.click(autoattendant.sayMessageVoice);
      utils.click(autoattendant.sayMessageVoiceOptions);

      // No save and until valid Phone Menu - see AutoAttn 922

    }, LONG_TIMEOUT);

    it('should add Phone Menu Say to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      autoattendant.scrollIntoView(autoattendant.phoneMenuSay);

      utils.expectIsDisplayed(autoattendant.phoneMenuSay, LONG_TIMEOUT);

      autoattendant.scrollIntoView(autoattendant.phoneMenuMessageOptions);
      utils.expectIsDisplayed(autoattendant.phoneMenuMessageOptions, LONG_TIMEOUT);

      utils.click(autoattendant.phoneMenuMessageOptions);
      utils.click(autoattendant.phoneMenuSayMessageOption);

      //Add Phone Menu Say Message
      utils.click(autoattendant.phoneMenuSay);
      utils.click(autoattendant.phonesayMessageInput);
      utils.sendKeys(autoattendant.phonesayMessageInput, "Press a key at the menu");
      utils.click(autoattendant.phoneMenuAddDynamicTextButton);
      utils.expectIsDisplayed(autoattendant.dynamicVariable, VERY_LONG_TIMEOUT);
      utils.click(autoattendant.readAs);
      utils.click(autoattendant.readAsVariable);
      utils.click(autoattendant.dynamicVariable);
      utils.expectIsDisplayed(autoattendant.dynamicVariable, LONG_TIMEOUT);
      utils.click(autoattendant.variable);
      utils.expectIsDisplayed(autoattendant.dynamicVariable, LONG_TIMEOUT);
      utils.click(autoattendant.okButton);
      utils.expectIsDisplayed(autoattendant.okButton, TIMEOUT);
      utils.expectIsEnabled(autoattendant.saveButton);

      // language and voice
      autoattendant.scrollIntoView(autoattendant.phonesayMessageLanguage);
      utils.click(autoattendant.phonesayMessageLanguage);
      utils.click(autoattendant.phonelanguageDropDownOptions);
      utils.click(autoattendant.phonesayMessageVoice);
      utils.click(autoattendant.phonesayMessageVoiceOptions);

    }, LONG_TIMEOUT);

    it('should add Phone Menu Repeat to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      //Add first Phone repeat Menu
      utils.click(autoattendant.phoneMenuKeys.first());

      autoattendant.scrollIntoView(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).first());
      utils.expectIsDisplayed(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).first());

      utils.click(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).first());
      utils.click(autoattendant.phoneMenuAction.first());
      utils.expectIsDisplayed(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.repeatMenu)).first(), LONG_TIMEOUT);

      autoattendant.scrollIntoView(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.repeatMenu)).first());
      utils.expectIsDisplayed(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.repeatMenu)).first(), LONG_TIMEOUT);

      utils.click(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.repeatMenu)).first());

    }, LONG_TIMEOUT);

    it('should add Phone Menu Say to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // Press add new key plus sign
      utils.click(autoattendant.repeatPlus);

      //Add Say Message phone menu
      utils.click(autoattendant.phoneMenuKeys.last());
      utils.click(autoattendant.phoneMenuKeyOptions.last().all(by.tagName('li')).last());
      utils.click(autoattendant.phoneMenuAction.last());

      utils.click(autoattendant.phoneMenuActionOptions.last().element(by.linkText('Say Message')));
      utils.expectIsDisplayed(autoattendant.phoneMenuActionTargetsMessageOption, LONG_TIMEOUT);

      autoattendant.scrollIntoView(autoattendant.phoneMenuActionTargetsMessageOption);

      utils.click(autoattendant.phoneMenuActionTargetsMessageOption);

      utils.click(autoattendant.phoneMenuActionTargetMessageOptions);

      utils.sendKeys(autoattendant.phoneMenuActionTargets.last().element(by.name('messageInput')), "This is a phone menu say");

    }, LONG_TIMEOUT);

    it('should delete one Phone Menu Repeat from the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      autoattendant.clearNotifications().then(function () {
        //Delete one repeatMenu
        utils.click(autoattendant.trash);

        // save and assert successful update message
        utils.expectIsEnabled(autoattendant.saveButton);

        utils.click(autoattendant.saveButton);
        autoattendant.assertUpdateSuccess(deleteUtils.testAAName);
        utils.expectIsDisabled(autoattendant.saveButton);
        utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);
        flow = browser.controlFlow();
        flow.execute(function () {
          return aaGetCeUtils.validateCesDefinition(ceInfos.Test0.actionSets);
        });
        utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);
      });

    }, LONG_TIMEOUT);

    it('should add Phone Menu Timeout to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      //Add Phone TimeOut Option
      utils.click(autoattendant.phoneMenuTimeout);
      utils.click(autoattendant.phoneMenuTimeoutOptions);

    }, LONG_TIMEOUT);

    it('should add route to external number to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.click(autoattendant.repeatPlus);
      //Add Route to Phone Number
      utils.click(autoattendant.phoneMenuKeys.last());
      utils.click(autoattendant.phoneMenuKeyOptions.last().all(by.tagName('li')).last());
      utils.click(autoattendant.phoneMenuAction.last());
      utils.click(autoattendant.phoneMenuActionOptions.last().element(by.linkText('Route to Phone Number')));
      utils.click(autoattendant.selectPhoneNumberViaPhoneMenu);
      utils.click(autoattendant.selectPhoneDropdownViaPhoneMenu);
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
      utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);

      flow = browser.controlFlow();
      flow.execute(function () {
        return aaGetCeUtils.validateCesDefinition(ceInfos.Test1.actionSets);
      });
      utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);
      utils.expectIsDisabled(autoattendant.saveButton);

    }, LONG_TIMEOUT);

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
      
      flow = browser.controlFlow();
      flow.execute(function () {
        return aaGetCeUtils.validateCesDefinition(ceInfos.Test2.actionSets);
      });
      utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);

      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);
      utils.expectIsDisabled(autoattendant.saveButton);

    }, LONG_TIMEOUT);

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

    }, LONG_TIMEOUT);

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
      utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);
      flow = browser.controlFlow();
      flow.execute(function () {
        return aaGetCeUtils.validateCesDefinition(ceInfos.Test3.actionSets);
      });
      utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);

      // but leave in a saveable state

      // Press add new key plus sign
      utils.click(autoattendant.repeatPlus);

      //Add Say Message phone menu
      utils.click(autoattendant.phoneMenuKeys.first());
      utils.click(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).last());
      utils.click(autoattendant.phoneMenuAction.first());

      utils.click(autoattendant.phoneMenuActionOptions.first().element(by.linkText('Say Message')));
      utils.expectIsDisplayed(autoattendant.phoneMenuActionTargetsFirstMessageOption, LONG_TIMEOUT);

      autoattendant.scrollIntoView(autoattendant.phoneMenuActionTargetsFirstMessageOption);

      utils.click(autoattendant.phoneMenuActionTargetsFirstMessageOption);

      utils.click(autoattendant.phoneMenuActionTargetFirstMessageOptions);

      utils.sendKeys(autoattendant.phoneMenuActionTargets.first().element(by.name('messageInput')), "Updated the second phone menu??");

    }, LONG_TIMEOUT);


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

    }, LONG_TIMEOUT);

    it('should add Dial By Extension via New Step action selection to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // We are depending on menu order for this test, so if the Add New Step menu gets new steps or gets
      // rearranged this will break - but again it will fail immediately so it should be clear what's going on.
      autoattendant.scrollIntoView(autoattendant.addStepLast);
      utils.click(autoattendant.addStepLast);
      utils.expectIsDisplayed(autoattendant.newStep);
      utils.click(autoattendant.newStepMenu);
      // 3rd menu option is Dial By Extension
      utils.click(autoattendant.newStepSelectDialByExt);

      utils.expectIsDisplayed(autoattendant.dialByExtension, LONG_TIMEOUT);

      autoattendant.scrollIntoView(autoattendant.dialByExtension);

      // utils.expectIsDisplayed(autoattendant.dialByExtension);

      utils.click(autoattendant.dialByMessageOptions);
      utils.click(autoattendant.dialBySayMessageOption);

      // say message
      utils.click(autoattendant.dialByMessageInput);
      utils.sendKeys(autoattendant.dialByMessageInput, "Enter the Extension");
      utils.click(autoattendant.dialByExtensionDynamicButton);
      utils.expectIsDisplayed(autoattendant.dynamicVariable, VERY_LONG_TIMEOUT);
      utils.click(autoattendant.dynamicVariable);
      utils.expectIsDisplayed(autoattendant.dynamicVariable, LONG_TIMEOUT);
      utils.click(autoattendant.variable);
      utils.expectIsDisplayed(autoattendant.dynamicVariable, LONG_TIMEOUT);
      utils.click(autoattendant.readAs);
      utils.click(autoattendant.readAsVariable);
      utils.click(autoattendant.okButton);
      utils.expectIsDisplayed(autoattendant.okButton, TIMEOUT);


      // language
      utils.click(autoattendant.dialByMessageLanguage);
      utils.click(autoattendant.dialBylanguageDropDownOptions);

      // voice
      utils.click(autoattendant.dialByMessageVoice);
      utils.click(autoattendant.dialByMessageVoiceOptions);

      // and save
      // utils.expectIsEnabled(autoattendant.saveButton);
      utils.click(autoattendant.saveButton);
      utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);
      flow = browser.controlFlow();
      flow.execute(function () {
        return aaGetCeUtils.validateCesDefinition(ceInfos.Test4.actionSets);
      });
      utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

    }, LONG_TIMEOUT);

    it('should add a Dial By Extension Play Message to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      autoattendant.clearNotifications().then(function () {

        var absolutePath = utils.resolvePath(autoattendant.mediaFileToUpload);
        autoattendant.scrollIntoView(autoattendant.dialByExtension);

        // media upload

        utils.click(autoattendant.dialByMessageOptions);

        utils.click(autoattendant.dialByPlayMessageOption);

        utils.expectIsDisplayed(autoattendant.dialByMediaUploadInput, LONG_TIMEOUT);

        $(autoattendant.mediaUploadSend).sendKeys(absolutePath);

        // and save
        utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);

        utils.click(autoattendant.saveButton);
        utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);
        flow = browser.controlFlow();
        flow.execute(function () {
          return aaGetCeUtils.validateCesDefinition(ceInfos.Test5.actionSets);
        });
        utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);

        autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

        // use if you are running sauce labs. does not work running locally
        // utils.expectIsDisabled(autoattendant.saveButton);

        utils.click(autoattendant.dialByMessageOptions);
        utils.click(autoattendant.dialBySayMessageOption);

      });

    }, LONG_TIMEOUT);

    it('should add Caller Input via New Step action selection to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      autoattendant.clearNotifications().then(function () {
        autoattendant.scrollIntoView(autoattendant.addStepLast);
        utils.click(autoattendant.addStepLast);
        utils.expectIsDisplayed(autoattendant.newStep);
        utils.click(autoattendant.newStepMenu);

        // 4th/last menu option is Caller Input
        utils.click(autoattendant.newStepCallerInput);
        utils.expectIsDisplayed(autoattendant.callerInputFirst, LONG_TIMEOUT);
        autoattendant.scrollIntoView(autoattendant.callerInputFirst);
        utils.sendKeys(autoattendant.callerInputNameVariable, "named Variable");
        utils.click(autoattendant.callerInputMessageOptions);
        utils.click(autoattendant.callerInputSayMessageOption);
        //utils.sendKeys(autoattendant.callerMessageInput, "Extension");
        utils.click(autoattendant.callerInputDynamicButton);
        utils.expectIsDisplayed(autoattendant.dynamicVariable, VERY_LONG_TIMEOUT);
        utils.click(autoattendant.dynamicVariable);
        utils.expectIsDisplayed(autoattendant.dynamicVariable, LONG_TIMEOUT);
        utils.click(autoattendant.variable);
        utils.expectIsDisplayed(autoattendant.dynamicVariable, LONG_TIMEOUT);
        utils.click(autoattendant.readAs);
        utils.click(autoattendant.readAsVariable);
        utils.click(autoattendant.okButton);
        utils.expectIsDisplayed(autoattendant.okButton, TIMEOUT);
        utils.click(autoattendant.callerInputGetDigits);
        autoattendant.scrollIntoView(autoattendant.callerInputFirst);
        utils.click(autoattendant.callerInputAddAction);
        autoattendant.scrollIntoView(autoattendant.callerInputFirst);
        utils.sendKeys(autoattendant.callerInputTextFirst, "Cisco_");
        utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);
        utils.expectIsDisabled(autoattendant.saveButton);
        utils.clear(autoattendant.callerInputTextFirst);
        utils.sendKeys(autoattendant.callerInputTextFirst, "Auto Attendant");
        utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);
        utils.expectIsEnabled(autoattendant.saveButton);
        utils.click(autoattendant.saveButton);
        utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);
        flow = browser.controlFlow();
        flow.execute(function () {
          return aaGetCeUtils.validateCesDefinition(ceInfos.Test6.actionSets);
        });
        utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);
        autoattendant.assertUpdateSuccess(deleteUtils.testAAName);
      });

    }, LONG_TIMEOUT);

    it('should add Decision Conditional via New Step action selection to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      autoattendant.scrollIntoView(autoattendant.addStepLast);
      utils.click(autoattendant.addStepLast);
      utils.expectIsDisplayed(autoattendant.newStep);
      utils.click(autoattendant.newStepMenu);

      // 2nd menu option is Decision
      utils.click(autoattendant.newStepDecision);
      utils.expectIsDisplayed(autoattendant.decisionFirst, LONG_TIMEOUT);
      autoattendant.scrollIntoView(autoattendant.decisionFirst);

      utils.click(autoattendant.decisionIf);

      utils.expectIsDisplayed(autoattendant.ifDropDown, VERY_LONG_TIMEOUT);

      utils.click(autoattendant.decisionIfDropDownOptions);

      utils.click(autoattendant.decisionIfSession);

      utils.expectIsDisplayed(autoattendant.decisionIfSessionVarDropDownOptions, LONG_TIMEOUT);

      utils.click(autoattendant.decisionIfSessionVarDropDownOptions);

      utils.sendKeys(autoattendant.decisionVariableIsTextArea, "My variable input");

      utils.click(autoattendant.decisionThen);

      utils.expectIsDisplayed(autoattendant.decisionThen, LONG_TIMEOUT);

      utils.click(autoattendant.decisionThenDropDownOptions);
      autoattendant.scrollIntoView(autoattendant.addStepLast);

      utils.click(autoattendant.selectPhoneNumberViaDecision);
      utils.click(autoattendant.selectPhoneDropdownViaDecision);
      utils.expectIsDisplayed(autoattendant.decisionPhoneNumber, LONG_TIMEOUT);
      utils.sendKeys(autoattendant.decisionPhoneNumber, "2065551234");

    }, LONG_TIMEOUT);

    it('should delete Caller Input and bring up confirming Modal', function () {
      autoattendant.scrollIntoView(autoattendant.callerInputFirst);

      utils.click(autoattendant.callerInputRemoveAction);

      utils.expectIsEnabled(autoattendant.varNameSave);
      utils.click(autoattendant.varNameSave);

    }, LONG_TIMEOUT);

    it('should add a Schedule to AA', function () {
      autoattendant.scrollIntoView(autoattendant.schedule);

      utils.click(autoattendant.schedule);

      utils.expectIsDisplayed(autoattendant.addschedule, LONG_TIMEOUT);
      utils.click(autoattendant.addschedule);

      utils.click(autoattendant.starttime);
      //autoattendant.starttime.sendKeys(autoattendant.starttime, '1', protractor.Key.TAB, '00', protractor.Key.TAB, 'A');

      utils.click(autoattendant.endtime);
      //autoattendant.endtime.sendKeys(autoattendant.starttime, '5', protractor.Key.TAB, '00', protractor.Key.TAB, 'P');

      utils.expectIsDisabled(autoattendant.modalsave);
      utils.click(autoattendant.day1);
      utils.expectIsDisplayed(autoattendant.toggleHolidays, LONG_TIMEOUT);
      utils.click(autoattendant.toggleHolidays);
      utils.expectIsDisplayed(autoattendant.addholiday, LONG_TIMEOUT);
      utils.click(autoattendant.addholiday);
      utils.sendKeys(autoattendant.holidayName, 'Thanksgiving');
      utils.expectIsDisabled(autoattendant.modalsave);
      utils.click(autoattendant.date);
      utils.click(autoattendant.selectdate);
      utils.expectIsDisplayed(autoattendant.addholiday, LONG_TIMEOUT);
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

    }, LONG_TIMEOUT);

    it('verify open/closed/holidays lanes are visible', function () {
      utils.expectIsDisplayed(autoattendant.scheduleInfoOpenHours);
      utils.expectIsDisplayed(autoattendant.scheduleInfoClosedHours);
      utils.expectIsDisplayed(autoattendant.scheduleInfoHolidayHours);
    }, LONG_TIMEOUT);

    it('should dismiss schedule modal on browser back button', function () {
      utils.expectIsDisplayed(autoattendant.schedule, LONG_TIMEOUT);
      utils.click(autoattendant.schedule);
      utils.expectIsDisplayed(autoattendant.modalsave);
      browser.driver.navigate().back();
      utils.expectIsNotDisplayed(autoattendant.modalsave);
    }, LONG_TIMEOUT);

    it('should be able to delete open/holiday lane for AA', function () {
      utils.click(autoattendant.schedule);

      utils.click(autoattendant.scheduletrash);

      utils.expectIsDisplayed(autoattendant.toggleHolidays, LONG_TIMEOUT);
      utils.click(autoattendant.toggleHolidays);
      utils.click(autoattendant.deleteHoliday.first()); // Thanksgiving created above
      utils.click(autoattendant.deleteHoliday.first()); // Some Holiday created above

      utils.expectIsEnabled(autoattendant.modalsave);
      utils.click(autoattendant.modalsave);

      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

    }, LONG_TIMEOUT);

    it('should verify open/closed lanes are not visible', function () {
      utils.expectIsNotDisplayed(autoattendant.scheduleInfoOpenHours);
      utils.expectIsNotDisplayed(autoattendant.scheduleInfoClosedHours);
    }, LONG_TIMEOUT);

    it('should add REST API via New Step action selection to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // REST API
      autoattendant.scrollIntoView(autoattendant.addStepLast);
      utils.click(autoattendant.addStepLast);
      utils.expectIsDisplayed(autoattendant.newStep);
      utils.click(autoattendant.newStepMenu);

      // 4th menu option is REST API
      utils.click(autoattendant.newStepSelectRestApi);
      utils.expectIsDisplayed(autoattendant.restApi);

    });

    it('should click configureApi hyperlink and a modal is opened with components for rest api url and "' + deleteUtils.testAAName + '"', function () {
      // REST API
      autoattendant.scrollIntoView(autoattendant.restApi);

      utils.click(autoattendant.configureApi);
      utils.expectIsDisplayed(autoattendant.configureApiURL);
      //utils.expectIsDisplayed(autoattendant.sessionVar);
      //utils.expectIsDisplayed(autoattendant.addVariableToSet);

    });
    it('should add url and it should be visible in REST API new step upon save "' + deleteUtils.testAAName + '"', function () {

      // REST API
      utils.click(autoattendant.configureApiURL);
      utils.expectIsDisabled(autoattendant.nextBtn);
      utils.expectIsDisplayed(autoattendant.configureApiURL, TIMEOUT);
      utils.sendKeys(autoattendant.configureApiURL, "http://api.openweathermap.org/data/2.5/weather?zip=80202,us&appid=a422c31ba1d69122814ca7a900a85ab5");
      utils.expectIsDisabled(autoattendant.nextBtn);
      utils.click(autoattendant.authenticationToggleSwitch);
      utils.click(autoattendant.authenticationToggleSwitch);
      utils.expectIsDisplayed(autoattendant.restApiError);
      utils.clear(autoattendant.configureApiURL);
      utils.sendKeys(autoattendant.configureApiURL, "https://api.openweathermap.org/data/2.5/weather?zip=80202,us&appid=a422c31ba1d69122814ca7a900a85ab5");
      utils.expectIsEnabled(autoattendant.nextBtn);
      utils.expectIsEnabled(autoattendant.usernameForAuthentication);
      utils.expectIsEnabled(autoattendant.passwordForAuthentication);
      utils.expectIsDisabled(autoattendant.nextBtn);
      utils.sendKeys(autoattendant.usernameForAuthentication, "testUser");
      utils.expectIsEnabled(autoattendant.nextBtn);
      utils.sendKeys(autoattendant.passwordForAuthentication, "testPassword");
      utils.expectIsEnabled(autoattendant.nextBtn);
      utils.click(autoattendant.nextBtn);
      utils.expectIsEnabled(autoattendant.testBtn);
      utils.click(autoattendant.testBtn);
      utils.expectIsDisplayed(autoattendant.saveBtn, TIMEOUT);
      utils.click(autoattendant.backBtn);
      utils.sendKeys(autoattendant.usernameForAuthentication, "name");
      utils.expectIsEnabled(autoattendant.nextBtn);
      utils.click(autoattendant.nextBtn);
      utils.expectIsDisabled(autoattendant.saveBtn);
      utils.expectIsEnabled(autoattendant.testBtn);
      utils.click(autoattendant.testBtn);
      utils.expectIsDisplayed(autoattendant.saveBtn, TIMEOUT);
      utils.click(autoattendant.assignmentTab);
      utils.expectIsDisplayed(autoattendant.assignmentTab, TIMEOUT);
      utils.click(autoattendant.sessionVarCombo);
      utils.click(autoattendant.sessionVarComboOptions1);
      utils.click(autoattendant.saveBtn);
      utils.expectIsDisplayed(autoattendant.restApiUrlLabel);
      utils.expectIsDisplayedForText(autoattendant.restApiUrlLabel, "https://api.openweathermap.org/data/2.5/weather?zip=80202,us&appid=a422c31ba1d69122814ca7a900a85ab5");
      utils.expectIsDisplayed(autoattendant.restApiVariableLabel1);
      utils.expectIsDisplayedForText(autoattendant.restApiVariableLabel1, "named Variable");
    });

    it('should click configureApi hyperlink again and add dynamic text "' + deleteUtils.testAAName + '"', function () {
      autoattendant.scrollIntoView(autoattendant.restApi);
      utils.click(autoattendant.configureApi);
      utils.expectIsDisplayed(autoattendant.configureApiURL);
      utils.click(autoattendant.configureApiURL);
      utils.clear(autoattendant.configureApiURL);
      utils.sendKeys(autoattendant.configureApiURL, "https://api.openweathermap.org/data/2.5/weather?zip=80202,us&appid=");
      utils.expectIsDisplayed(autoattendant.addDynamicTextButton);
      utils.click(autoattendant.addDynamicTextButton);

      utils.expectIsDisplayed(autoattendant.dynamicVariable1, VERY_LONG_TIMEOUT);
      utils.click(autoattendant.dynamicVariable1);
      //utils.expectIsDisplayed(autoattendant.dynamicVariable1, VERY_LONG_TIMEOUT);
      utils.click(autoattendant.variable1);
      utils.expectIsDisplayed(autoattendant.dynamicVariable1, VERY_LONG_TIMEOUT);

      utils.expectIsEnabled(autoattendant.dynamicModalOkButton);
      utils.click(autoattendant.dynamicModalOkButton);
      utils.expectIsDisplayed(autoattendant.dynamicModalOkButton, TIMEOUT);
      utils.expectIsEnabled(autoattendant.nextBtn);
      utils.click(autoattendant.nextBtn);

      utils.expectIsDisplayed(autoattendant.testBtn);
      utils.expectIsDisabled(autoattendant.testBtn);
      utils.expectIsDisabled(autoattendant.saveBtn);
      utils.sendKeys(autoattendant.restDynamicsValue, 'a422c31ba1d69122814ca7a900a85ab5');
      utils.expectIsDisplayed(autoattendant.restDynamicsValue, TIMEOUT);
      utils.expectIsEnabled(autoattendant.testBtn);
      utils.click(autoattendant.testBtn);
      utils.expectIsEnabled(autoattendant.testBtn);
      utils.click(autoattendant.testBtn);
      utils.click(autoattendant.saveBtn);
      utils.click(autoattendant.saveButton);
    });

    it('should add route call to phone number as well as extension', function () {
      autoattendant.scrollIntoView(autoattendant.addStepLast);
      utils.click(autoattendant.addStepLast);
      utils.expectIsDisplayed(autoattendant.newStep);
      utils.click(autoattendant.newStepMenu);

      // 4th/last menu option is Route Call
      utils.click(autoattendant.newStepSelectRouteCall);

      // stop here as the complete menu has been tested elsewhere
      utils.expectIsDisplayed(autoattendant.routeCall);
      utils.click(autoattendant.routeCallChoose);
      utils.expectIsDisplayed(autoattendant.routeToPhoneNumber, LONG_TIMEOUT);
      utils.click(autoattendant.routeToPhoneNumber);

      //selecting route to phone number in dropdown
      utils.click(autoattendant.selectPhoneNumberViaRouteCall);
      utils.click(autoattendant.selectPhoneDropDownViaRouteCall);
      utils.click(autoattendant.phoneNumberActionTarget);
      utils.sendKeys(autoattendant.phoneNumberActionTarget, '4084741234');

      // save and assert successful update message
      utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);
      utils.expectIsEnabled(autoattendant.saveButton);
      utils.click(autoattendant.saveButton);

      //selecting route to extension in dropdown
      utils.click(autoattendant.selectPhoneNumberViaRouteCall);
      utils.click(autoattendant.selectExtensionViaRouteCall);
      utils.click(autoattendant.extensionActionTarget);

      utils.sendKeys(autoattendant.extensionActionTarget, '2222');
      utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);

      // save and assert successful update message
      utils.expectIsEnabled(autoattendant.saveButton);

      utils.click(autoattendant.saveButton);
      utils.expectIsDisplayed(autoattendant.saveButton, LONG_TIMEOUT);
    }, LONG_TIMEOUT);


    it('should close AA edit and return to landing page', function () {

      utils.click(autoattendant.closeEditButton);

    }, LONG_TIMEOUT);

    it('should find new AA named "' + deleteUtils.testAAName + '" on the landing page', function () {
      utils.expectIsDisplayed(testAAName);

      utils.expectIsEnabled(testAAName);

      utils.click(testCardClick);
      utils.expectIsDisplayed(autoattendant.addAANumbers, LONG_TIMEOUT);

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

    }, LONG_TIMEOUT);

    it('should delete new AA named "' + deleteUtils.testAAName + '" on the landing page', function () {
      // click delete X on the AA card for e2e test AA
      utils.click(testCardClose);

      // confirm dialog with e2e AA test name in it is there, then agree to delete
      utils.expectText(autoattendant.deleteModalConfirmText, 'Are you sure you want to delete the ' + deleteUtils.testAAName + ' Auto Attendant?').then(function () {
        utils.click(autoattendant.deleteModalConfirmButton);
        autoattendant.assertDeleteSuccess(deleteUtils.testAAName);
      });

    }, LONG_TIMEOUT);
  });

});
