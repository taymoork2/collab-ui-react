'use strict';
/*eslint-disable */

describe('Huron Auto Attendant', function () {

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

    it('should create a new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // click new feature
      utils.click(autoattendant.newFeatureButton);

      // select AA
      utils.wait(autoattendant.featureTypeAA, 12000);
      utils.click(autoattendant.featureTypeAA);

      // enter AA name
      utils.sendKeys(autoattendant.newAAname, deleteUtils.testAAName);
      utils.sendKeys(autoattendant.newAAname, protractor.Key.ENTER);

      // assert we see the create successful message
      autoattendant.assertCreateSuccess();

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
      autoattendant.assertUpdateSuccess();
      utils.expectIsDisabled(autoattendant.saveButton);

    }, 60000);

    it('should delete a phone number from the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.click(autoattendant.numberIconClose);

      // save and assert we see successful save message and save is disabled
      utils.click(autoattendant.saveButton);
      autoattendant.assertUpdateSuccess();
      utils.expectIsDisabled(autoattendant.saveButton);

    }, 60000);

    it('should add a second phone number to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.click(autoattendant.numberDropDownArrow);

      // we are going to arbitrarily select the last one
      utils.click(autoattendant.numberDropDownOptions.last());

      // save and assert we see successful save message and save is disabled
      utils.click(autoattendant.saveButton);
      autoattendant.assertUpdateSuccess();
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
      utils.expectIsDisabled(autoattendant.saveButton);

    }, 60000);

    it('should add Phone Menu Say to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      //Add Phone Menu Say Message
      utils.click(autoattendant.phoneMenu);
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
      utils.expectIsDisabled(autoattendant.saveButton);
      autoattendant.assertUpdateSuccess();

    }, 60000);

    it('should add Phone Menu Timeout to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      //Add Phone TimeOut Option
      utils.click(autoattendant.phoneMenuTimeout);
      utils.click(autoattendant.phoneMenuTimeoutOptions);

    });

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
