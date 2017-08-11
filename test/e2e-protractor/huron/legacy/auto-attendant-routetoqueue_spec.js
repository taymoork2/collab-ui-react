'use strict';

/*eslint-enable */


describe('Huron Auto Attendant', function () {
  var remote = require('selenium-webdriver/remote');
  deleteUtils.testAAName = deleteUtils.testAAName + '_' + Date.now();

  var testAAName = element(by.css('p[title="' + deleteUtils.testAAName + '"]'));
  var testCardClick = testAAName.element(by.xpath('ancestor::article')).element(by.css('.card-body'));
  var testCardClose = testAAName.element(by.xpath('ancestor::article')).element(by.css('.header-with-right-icon')).element(by.css('.card-icon-div')).element(by.css('.close'));

  beforeAll(function () {
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
      browser.driver.sleep(1000);

      // select AA

      utils.click(autoattendant.featureTypeAA);

      utils.click(autoattendant.basicAA);

      // enter AA name
      utils.sendKeys(autoattendant.newAAname, deleteUtils.testAAName);
      utils.sendKeys(autoattendant.newAAname, protractor.Key.ENTER);
      // create the queue with the name Sunlight 1
      var flow = browser.controlFlow();
      flow.execute(createUtils.createRouteToQueue);

      // assert we see the create successful message
      autoattendant.assertCreateSuccess(deleteUtils.testAAName);

      // we should see the AA edit page now
      utils.expectIsDisplayed(autoattendant.addAANumbers);
      utils.scrollIntoView(autoattendant.sayMessage);
      utils.expectIsDisplayed(autoattendant.sayMessage);
    }, 60000);

    /*
     * Test case to check Queue Settings modal opens (with Language and Voice options)
     * when opened from New Step -> Route Call -> Queue Call
     */
    it('should display Language and Voice options in Queue Settings opened from New Step', function () {
      utils.scrollIntoView(autoattendant.addStepFirst);
      //Click on the + icon to open New Step
      utils.click(autoattendant.addStepFirst);
      utils.expectIsDisplayed(autoattendant.newStepForm);

      //Select Route Call from New Step drop down menu
      utils.click(autoattendant.newStepDropDownActionSelectopenHours0);
      utils.click(autoattendant.newStepSelectRouteCall);
      utils.expectIsDisplayed(autoattendant.routeCall);

      //Select Queue Call from Route Call drop down menu
      utils.click(autoattendant.routeCallChoose);
      utils.click(autoattendant.routeQueueCall);
      utils.expectIsDisplayed(autoattendant.queueSetting);

      //Click on Queue Settings link to open Queue Settings modal
      utils.click(autoattendant.queueSetting);
      utils.expectIsDisplayed(autoattendant.queueSettingsModal);

      // Check that Language and Voice options should be displayed.
      utils.expectIsDisplayed(autoattendant.languageSelectopenHours0);
      utils.expectIsDisplayed(autoattendant.voiceSelectopenHours0);

      // Click cancel to close Queue Settings modal and come back to main menu to continue further tests
      utils.scrollIntoView(autoattendant.cancelTreatmentFeature);
      utils.click(autoattendant.cancelTreatmentFeature);
    });

    it('should add Phone Menu Say to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      utils.scrollIntoView(autoattendant.phoneMenuSay);
      //Add Phone Menu Say Message
      utils.click(autoattendant.phoneMenuMessageOptions);
      utils.click(autoattendant.phoneMenuSayMessageOption);
      utils.click(autoattendant.phoneMenuSay);
      utils.click(autoattendant.phonesayMessageInput);
      utils.sendKeys(autoattendant.phonesayMessageInput, 'Press a key at the menu');
      utils.expectIsEnabled(autoattendant.saveButton);

      // language and voice
      utils.click(autoattendant.phonesayMessageLanguage);
      utils.scrollIntoView(autoattendant.phonelanguageDropDownOptions);
      utils.click(autoattendant.phonelanguageDropDownOptions);
      utils.click(autoattendant.phonesayMessageVoice);
      utils.click(autoattendant.phonesayMessageVoiceOptions);
    });

    it('should add Phone Menu route to queue to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      // Main menu key 0 - route to queue
      utils.click(autoattendant.phoneMenuKeys.first());
      utils.scrollIntoView(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).first());
      utils.click(autoattendant.phoneMenuKeyOptions.all(by.linkText(autoattendant.key0)).first());

      utils.click(autoattendant.phoneMenuAction.first());
      utils.click(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.routeToQueue)).first());

      // it is for selecting the queue for route to queue option
      utils.scrollIntoView(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).first());
    });

    it('should click queue setting hyperlink and set and play periodic message and add dynamic text to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      // it is for selecting the queue for route to queue option
      utils.scrollIntoView(autoattendant.repeatPlus);
      utils.scrollIntoView(autoattendant.repeatPlus);
      utils.click(autoattendant.queueSetting);
      utils.scrollIntoView(autoattendant.repeatPlus);
      // select say message
      utils.click(autoattendant.periodicSayMessageOption);
      utils.click(autoattendant.periodicSayMessageSelectOption);
      utils.click(autoattendant.periodicMessageTypeSelect);
      utils.sendKeys(autoattendant.periodicMessageTypeSelect, 'Welcome to Queue Settings Periodic Message');

      utils.click(autoattendant.periodicDynamicButton);
      utils.wait(autoattendant.dynamicVariable, 120000);
      utils.click(autoattendant.dynamicVariable);
      utils.wait(autoattendant.dynamicVariable, 120000);
      utils.click(autoattendant.variable);
      utils.wait(autoattendant.dynamicVariable, 120000);
      utils.click(autoattendant.readAs);
      utils.click(autoattendant.readAsVariable);
      utils.click(autoattendant.okButton);
      utils.wait(autoattendant.okButton, 1200);

      utils.wait(autoattendant.okQueueTreatment, 12000);
      utils.click(autoattendant.okQueueTreatment);
      utils.click(autoattendant.saveButton);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);
    });

    it('should click queue setting hyperlink and set and play initial message and add dynamic text to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      // it is for selecting the queue for route to queue option
      utils.scrollIntoView(autoattendant.repeatPlus);
      utils.scrollIntoView(autoattendant.repeatPlus);
      utils.click(autoattendant.queueSetting);
      utils.scrollIntoView(autoattendant.repeatPlus);

      // select say message
      utils.click(autoattendant.initialSayMessageOption);
      utils.click(autoattendant.initialSayMessageSelectOption);
      utils.click(autoattendant.initialMessageTypeSelect);
      utils.sendKeys(autoattendant.initialMessageTypeSelect, 'Welcome to Queue Settings Initial Message');

      utils.click(autoattendant.initialDynamicButton);
      utils.wait(autoattendant.dynamicVariable, 120000);
      utils.click(autoattendant.dynamicVariable);
      utils.wait(autoattendant.dynamicVariable, 120000);
      utils.click(autoattendant.variable);
      utils.wait(autoattendant.dynamicVariable, 120000);
      utils.click(autoattendant.readAs);
      utils.click(autoattendant.readAsVariable);
      utils.click(autoattendant.okButton);
      utils.wait(autoattendant.okButton, 1200);

      utils.wait(autoattendant.okQueueTreatment, 12000);
      utils.click(autoattendant.okQueueTreatment);
      utils.click(autoattendant.saveButton);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);
    });

    xit('should click queue setting hyperlink and set and play periodic message and upload media to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      // it is for selecting the queue for route to queue option
      utils.scrollIntoView(autoattendant.repeatPlus);
      var absolutePath = utils.resolvePath(autoattendant.mediaFileToUpload);
      utils.scrollIntoView(autoattendant.repeatPlus);
      utils.click(autoattendant.queueSetting);
      utils.scrollIntoView(autoattendant.repeatPlus);

      // select say message
      /*utils.click(autoattendant.periodicSayMessageOption);
      utils.click(autoattendant.periodicSayMessageSelectOption);
      utils.click(autoattendant.periodicMessageTypeSelect);
      utils.sendKeys(autoattendant.periodicMessageTypeSelect, 'Welcome to Queue Settings Periodic Message');
      */
      //select media upload
      utils.click(autoattendant.periodicSayMessageOption);
      utils.click(autoattendant.periodicMediaUploadSelectOption);
      utils.click(autoattendant.periodicMediaUploadInput);
      $(autoattendant.mediaUploadSend).sendKeys(absolutePath);
      utils.scrollIntoView(autoattendant.repeatPlus);
      utils.click(autoattendant.periodicMin);
      utils.click(autoattendant.periodicMinOption.get(1));
      utils.click(autoattendant.periodicSec);
      utils.click(autoattendant.periodicSecOption.get(2));
      utils.wait(autoattendant.okQueueTreatment, 12000);
      utils.click(autoattendant.okQueueTreatment);
      utils.click(autoattendant.saveButton);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);
    });

    xit('should click queue setting hyperlink and set and play music on hold and upload media to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      var absolutePath = utils.resolvePath(autoattendant.mediaFileToUpload);
      utils.scrollIntoView(autoattendant.repeatPlus);
      utils.click(autoattendant.queueSetting);
      expect(utils.isSelected(autoattendant.mohDefaultUpload)).toBeTruthy();
      $(autoattendant.mediaUploadSend).sendKeys(absolutePath);
      utils.wait(autoattendant.okQueueTreatment, 12000);
      utils.click(autoattendant.okQueueTreatment);
      utils.click(autoattendant.saveButton);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);
    });

    xit('should reopen queue setting hyperlink and see custom music on hold set, for the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      utils.scrollIntoView(autoattendant.repeatPlus);
      utils.click(autoattendant.queueSetting);
      utils.expectIsEnabled(autoattendant.okQueueTreatment);
      expect(utils.isSelected(autoattendant.mohCustomUpload)).toBeTruthy();
      utils.click(autoattendant.okQueueTreatment);
    });

    it('should add another route to queue to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      // Main menu key 1 - route to queue
      utils.scrollIntoView(autoattendant.repeatPlus);

      utils.click(autoattendant.repeatPlus);

      utils.click(autoattendant.phoneMenuKeys.get(1));
      utils.scrollIntoView(autoattendant.phoneMenu);
      utils.click(autoattendant.phoneMenuKeyOptions.all(by.linkText(autoattendant.key1)).first());

      utils.scrollIntoView(autoattendant.repeatPlus);
      utils.click(autoattendant.phoneMenuAction.get(1));

      // it is for selecting the queue for route to queue option
      utils.click(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.routeToQueue)).first());
    });

    it('should click queue setting hyperlink of route to queue to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      // it is for selecting the queue for route to queue option
      utils.scrollIntoView(autoattendant.repeatPlus);
      utils.click(autoattendant.queueSetting);
      utils.scrollIntoView(autoattendant.fallbacktime);
      utils.click(autoattendant.fallbacktime);
      utils.click(autoattendant.queueMinOption.get(3));
      utils.wait(autoattendant.okQueueTreatment, 12000);
      utils.click(autoattendant.okQueueTreatment);
      utils.click(autoattendant.saveButton);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);
    });

    it('should save AA and return to landing page', function () {
      utils.expectIsDisabled(autoattendant.saveButton);
      utils.click(autoattendant.closeEditButton);
    });

    it('should delete the queue', function () {
      // Delete the queue
      var flow = browser.controlFlow();
      flow.execute(deleteUtils.deleteRouteToQueue);
    });

    it('should find new AA named "' + deleteUtils.testAAName + '" on the landing page', function () {
      utils.expectIsEnabled(testAAName);
    });

    it('should be able to reopen the AA "' + deleteUtils.testAAName, function () {
      utils.click(testCardClick);

      /*
      utils.click(autoattendant.searchBox);
      utils.sendKeys(autoattendant.searchBox, deleteUtils.testAAName);
      utils.click(autoattendant.aaCard);
      */

      utils.expectIsDisplayed(autoattendant.aaTitle);
      expect(autoattendant.aaTitle.getText()).toEqual(deleteUtils.testAAName);
    });

    it('should contain two route to queues previously created in AA "' + deleteUtils.testAAName, function () {
      utils.scrollIntoView(autoattendant.phoneMenuSay);
      utils.scrollIntoView(autoattendant.repeatPlus);
      expect(autoattendant.phoneMenuAction.count()).toBe(2);
      expect(autoattendant.phoneMenuKeyOptions.count()).toBe(2);
      expect(autoattendant.phoneMenuKeysContent.get(0).getInnerHtml()).toContain(autoattendant.key0);
      expect(autoattendant.phoneMenuActionContent.get(0).getInnerHtml()).toContain(autoattendant.routeToQueue);
      expect(autoattendant.phoneMenuKeysContent.get(1).getInnerHtml()).toContain(autoattendant.key1);
      expect(autoattendant.phoneMenuActionContent.get(1).getInnerHtml()).toContain(autoattendant.routeToQueue);
    });

    it('should close AA edit and return to landing page', function () {
      utils.click(autoattendant.closeEditButton);
    });


    it('should delete new AA named "' + deleteUtils.testAAName + '" on the landing page', function () {
      // click delete X on the AA card for e2e test AA
      utils.click(testCardClose);

      // confirm dialog with e2e AA test name in it is there, then agree to delete
      utils.expectText(autoattendant.deleteModalConfirmText, 'Are you sure you want to delete the ' + deleteUtils.testAAName + ' Auto Attendant?').then(function () {
        utils.click(autoattendant.deleteModalConfirmButton);
        autoattendant.assertDeleteSuccess(deleteUtils.testAAName);
      });
    });
  });
});
