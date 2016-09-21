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
      utils.scroll(autoattendant.sayMessage);
      utils.expectIsDisplayed(autoattendant.sayMessage);

    }, 60000);
    

    it('should add Phone Menu Say to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.scroll(autoattendant.phoneMenuSay);
      //Add Phone Menu Say Message
      utils.click(autoattendant.phoneMenuSay);
      utils.click(autoattendant.phonesayMessageInput);
      utils.sendKeys(autoattendant.phonesayMessageInput, "Press a key at the menu");
      utils.expectIsEnabled(autoattendant.saveButton);

      // language and voice
      utils.click(autoattendant.phonesayMessageLanguage);
      utils.scroll(autoattendant.phonelanguageDropDownOptions);
      utils.click(autoattendant.phonelanguageDropDownOptions);
      utils.click(autoattendant.phonesayMessageVoice);
      utils.click(autoattendant.phonesayMessageVoiceOptions);

    });

    it('should add Phone Menu route to queue to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // Main menu key 0 - route to queue 
      utils.click(autoattendant.phoneMenuKeys.first());
      utils.scroll(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).first());
      utils.click(autoattendant.phoneMenuKeyOptions.all(by.linkText(autoattendant.key0)).first());

      utils.click(autoattendant.phoneMenuAction.first());
      utils.click(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.routeToQueue)).first());

      // it is for selecting the queue for route to queue option
      utils.scroll(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).first());
      utils.click(autoattendant.rqDropDownArrow);
      utils.click(autoattendant.rqDropDownOptionSunlight.first());  //// select by name
      
    });

    it('should click queue setting hyperlink of route to queue to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
        // it is for selecting the queue for route to queue option
      utils.scroll(autoattendant.repeatPlus);
      utils.click(autoattendant.queueSetting);
      utils.click(autoattendant.queueMin);
      utils.click(autoattendant.queueMinOption.get(1));
      // for now close the modal. when backend will come we will save the modal before closing. 
      utils.click(autoattendant.scheduleCloseButton);
    });
    
    it('should add another route to queue to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
        
        // Main menu key 1 - route to queue
      utils.scroll(autoattendant.repeatPlus);

      utils.click(autoattendant.repeatPlus);

      utils.click(autoattendant.phoneMenuKeys.get(1));
      utils.scroll(autoattendant.phoneMenu);
      utils.click(autoattendant.phoneMenuKeyOptions.all(by.linkText(autoattendant.key1)).first());

      utils.scroll(autoattendant.repeatPlus);
      utils.click(autoattendant.phoneMenuAction.get(1));
        
        // it is for selecting the queue for route to queue option
      utils.click(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.routeToQueue)).first());
      utils.click(autoattendant.rqDropDownArrow);
      utils.click(autoattendant.rqDropDownOptionSunlight.get(1));

    });  

    it('should click queue setting hyperlink of route to queue to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
        // it is for selecting the queue for route to queue option
      utils.scroll(autoattendant.repeatPlus);
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
      utils.click(autoattendant.testCardDelete);
        
        // confirm dialog with e2e AA test name in it is there, then agree to delete
      utils.expectText(autoattendant.deleteModalConfirmText, 'Are you sure you want to delete the ' + deleteUtils.testAAName + ' Auto Attendant?').then(function () {
        utils.click(autoattendant.deleteModalConfirmButton);
        autoattendant.assertDeleteSuccess(deleteUtils.testAAName);
      });
    });
  });
});
