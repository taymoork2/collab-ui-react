'use strict';

/*eslint-enable */


describe('Huron Auto Attendant', function () {

  beforeAll(function () {

    login.login('aa-admin');

  }, 120000);

  describe('Create and Delete AA', function () {

    // TEST CASES
    it('should navigate to AA landing page', function () {

      // First ensure the test AA and queue is deleted (in case last test run failed for example)
      var flow = browser.controlFlow();
      flow.execute(deleteUtils.deleteRouteToQueue);
      flow.execute(deleteUtils.findAndDeleteTestAA);

      // and navigate to the landing page
      navigation.clickAutoAttendant();
    }, 120000);

    it('should create a new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // click new feature
      utils.click(autoattendant.newFeatureButton);

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

    it('should open New Step modal', function () {

      utils.scrollIntoView(autoattendant.addStepFirst);
      //Click on the + icon to open New Step
      utils.click(autoattendant.addStepFirst);
      utils.expectIsDisplayed(autoattendant.newStepForm);

    });
    it('should open Route Call menu from New step', function () {

      //Select Route Call from New Step drop down menu
      utils.click(autoattendant.newStepDropDownActionSelectopenHours0);
      utils.click(autoattendant.newStepSelectRouteCall);
      utils.expectIsDisplayed(autoattendant.routeCall);

    });
    it('should display Queue Call Settings link in Route Call Menu upon choosing Queue Call', function () {

      //Select Queue Call from Route Call drop down menu
      utils.click(autoattendant.routeCallChoose);
      utils.click(autoattendant.routeQueueCall);
      utils.expectIsDisplayed(autoattendant.queueSetting);

    });
    it('should open Queue Settings modal and contain language and voice options', function () {

      //Click on Queue Settings link to open Queue Settings modal
      utils.click(autoattendant.queueSetting);
      utils.expectIsDisplayed(autoattendant.queueSettingsModal);
      utils.expectIsDisplayed(autoattendant.languageSelectopenHours0);
      utils.expectIsDisplayed(autoattendant.voiceSelectopenHours0);
      utils.scrollIntoView(autoattendant.cancelTreatmentFeature);
    //Click cancel to close Queue Settings modal and come back to main menu to continue further tests
      utils.click(autoattendant.cancelTreatmentFeature);

    });

    it('should add Phone Menu Say to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.scrollIntoView(autoattendant.phoneMenuSay);
      //Add Phone Menu Say Message
      utils.click(autoattendant.phoneMenuSay);
      utils.click(autoattendant.phonesayMessageInput);
      utils.sendKeys(autoattendant.phonesayMessageInput, "Press a key at the menu");
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

    it('should click queue setting hyperlink and set and play music on hold and upload media to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
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

    it('should reopen queue setting hyperlink and see custom music on hold set, for the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      utils.scrollIntoView(autoattendant.repeatPlus);
      utils.click(autoattendant.queueSetting);
      utils.expectIsEnabled(autoattendant.okQueueTreatment);
      expect(utils.isSelected(autoattendant.mohCustomUpload)).toBeTruthy();
      utils.click(autoattendant.okQueueTreatment);
    });

    it('should be able to select all fallback options in Call treatment modal of the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
        // it is for selecting all the fallback options in the Call treatment modal
      utils.expectIsDisplayed(autoattendant.queueDestDisconnect);
      utils.click(autoattendant.queueDest);
      utils.click(autoattendant.queueDestOption.get(1));
      utils.click(autoattendant.queueDestAction);
      utils.click(autoattendant.queueDestActionOption.get(1));
      utils.click(autoattendant.queueDest);
      utils.click(autoattendant.queueDestOption.get(2));
      utils.click(autoattendant.queueDestAction);
      utils.click(autoattendant.queueDestActionOption.get(1));
      utils.click(autoattendant.queueDest);
      utils.click(autoattendant.queueDestOption.get(3));
      utils.expectIsDisplayed(autoattendant.queueDestRouteToPhoneNumber);
      utils.click(autoattendant.queueDest);
      utils.click(autoattendant.queueDestOption.get(4));
      utils.click(autoattendant.queueDestAction);
      utils.click(autoattendant.queueDestActionOption.get(1));
      utils.click(autoattendant.queueDest);
      utils.click(autoattendant.queueDestOption.get(5));
      utils.expectIsDisplayed(autoattendant.queueDestAction);
      utils.click(autoattendant.queueDest);
      utils.click(autoattendant.queueDestOption.get(0));
      utils.expectIsDisplayed(autoattendant.queueDestDisconnect);
    });

    it('should open queue treatment modal and set the values of IA to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      utils.scrollIntoView(autoattendant.repeatPlus);

      utils.click(autoattendant.queueSetting);

      //for say message
      utils.click(autoattendant.initialMessage);
      utils.sendKeys(autoattendant.initialMessage, "Enter the IA message");

      //for media upload
      var absolutePath = utils.resolvePath(autoattendant.mediaFileToUpload);
      utils.click(autoattendant.initialMessageOptions);
      utils.click(autoattendant.initialPlayMessageOption);
      utils.wait(autoattendant.initialMediaUploadInput, 12000);
      $(autoattendant.mediaUploadSend).sendKeys(absolutePath);

      // and save
      utils.click(autoattendant.scheduleCloseButton);
      // save AA
      utils.click(autoattendant.saveButton);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);
      utils.expectIsDisabled(autoattendant.saveButton);
    }, 120000);

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
      utils.click(autoattendant.queueMin);
      utils.click(autoattendant.queueMinOption.get(3));
   // for now close the modal. when backend will come we will save the modal before closing.
      utils.click(autoattendant.scheduleCloseButton);
    });

    it('should save AA and return to landing page', function () {
      utils.click(autoattendant.saveButton);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);
      utils.expectIsDisabled(autoattendant.saveButton);
      utils.click(autoattendant.closeEditButton);
    });

    it('should delete the queue', function () {
        // Delete the queue
      var flow = browser.controlFlow();
      flow.execute(deleteUtils.deleteRouteToQueue);

    });

    it('should find new AA named "' + deleteUtils.testAAName + '" on the landing page', function () {
      utils.expectIsEnabled(autoattendant.testCardName);
    });

    it('should be able to reopen the AA "' + deleteUtils.testAAName, function () {
      utils.click(autoattendant.searchBox);
      utils.sendKeys(autoattendant.searchBox, deleteUtils.testAAName);
      utils.click(autoattendant.aaCard);
      utils.expectIsDisplayed(autoattendant.aaTitle);
      expect(autoattendant.aaTitle.getText()).toEqual(deleteUtils.testAAName);
    });

    it('should contain two route to queues previously created in AA "' + deleteUtils.testAAName, function () {
      expect(autoattendant.phoneMenuAction.count()).toBe(2);
      expect(autoattendant.phoneMenuKeyOptions.count()).toBe(2);
      expect(autoattendant.phoneMenuKeysContent.get(0).getAttribute('innerHTML')).toContain(autoattendant.key0);
      expect(autoattendant.phoneMenuActionContent.get(0).getAttribute('innerHTML')).toContain(autoattendant.routeToQueue);
      expect(autoattendant.phoneMenuKeysContent.get(1).getAttribute('innerHTML')).toContain(autoattendant.key1);
      expect(autoattendant.phoneMenuActionContent.get(1).getAttribute('innerHTML')).toContain(autoattendant.routeToQueue);
    });

    it('should close AA edit and return to landing page', function () {
      utils.click(autoattendant.closeEditButton);
    });


    it('should delete new AA named "' + deleteUtils.testAAName + '" on the landing page', function () {
        // click delete X on the AA card for e2e test AA
      utils.click(autoattendant.testCardDelete);

        // confirm dialog with e2e AA test name in it is there, then agree to delete
      utils.expectText(autoattendant.deleteModalConfirmText, 'Are you sure you want to delete the ' + deleteUtils.testAAName + ' Auto Attendant?').then(function () {
        utils.click(autoattendant.deleteModalConfirmButton);
        autoattendant.assertDeleteSuccess(deleteUtils.testAAName);
      });
    });
  });
});
