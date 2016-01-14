'use strict';
/*eslint-disable */

describe('Huron Auto Attendant', function () {

  beforeAll(function () {
    login.login('huron-int1');
  }, 120000);

  describe('Create AA', function () {

    // TEST CASES
    it('should navigate to AA landing page', function () {
      // Cleanup the leftover (from last test run) auto-attendant
      var flow = protractor.promise.controlFlow();
      var result = flow.execute(deleteUtils.findAndDeleteTestAA);

      navigation.clickAutoAttendant();

    });

    it('should create a new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.click(autoattendant.newFeatureButton);

      utils.wait(autoattendant.featureTypeAA, 12000);
      utils.click(autoattendant.featureTypeAA);

      utils.sendKeys(autoattendant.newAAname, deleteUtils.testAAName);
      utils.sendKeys(autoattendant.newAAname, protractor.Key.ENTER);

      //      notifications.assertSuccess(deleteUtils.testAAName + ' created successfully');
      // waitForElementPresent(notifications.successAlert);
      // expect(notifications.successAlert.getText()).toContain(deleteUtils.testAAName + ' updated successfully');
      autoattendant.assertCreateSuccess();

      utils.expectIsDisplayed(autoattendant.addAANumbers);

      utils.expectIsDisplayed(autoattendant.sayMessage);

    }, 60000);

    it('should add a single phone number to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      utils.wait(autoattendant.addAANumbers, 12000);
      utils.click(autoattendant.numberDropDownArrow);

      // we are going to arbitrarily select the first one
      utils.click(autoattendant.numberDropDownOptions.last());

      utils.click(autoattendant.saveButton);

      //      notifications.assertSuccess(deleteUtils.testAAName + ' updated successfully');
      autoattendant.assertUpdateSuccess();

    }, 60000);

    it('should delete a phone number to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.click(autoattendant.numberIconClose);

      utils.click(autoattendant.saveButton);
      utils.expectIsDisabled(autoattendant.saveButton);

      //      notifications.assertSuccess(deleteUtils.testAAName + ' updated successfully');
      //      expect(notifications.successAlert.getText()).toContain(deleteUtils.testAAName + ' updated successfully');
      autoattendant.assertUpdateSuccess();

    }, 60000);

    it('should add a second phone number to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.click(autoattendant.numberDropDownArrow);

      // we are going to arbitrarily select the first one
      utils.click(autoattendant.numberDropDownOptions.last());

      utils.click(autoattendant.saveButton);

      //      notifications.assertSuccess(deleteUtils.testAAName + ' updated successfully');

      //      expect(notifications.successAlert.getText()).toContain(deleteUtils.testAAName + ' updated successfully');
      autoattendant.assertUpdateSuccess();

    }, 60000);

    it('should add SayMessage Message, select Language and Voice to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.click(autoattendant.sayMessageInput);

      // we are going to arbitrarily select the first one
      utils.sendKeys(autoattendant.sayMessageInput, deleteUtils.testAAName);
      utils.click(autoattendant.sayMessageLanguage);

      utils.click(autoattendant.languageDropDownOptions);

      utils.click(autoattendant.sayMessageVoice);
      utils.click(autoattendant.sayMessageVoiceOptions);
      utils.expectIsEnabled(autoattendant.saveButton);
      utils.click(autoattendant.saveButton);
      utils.expectIsDisabled(autoattendant.saveButton);
    }, 60000);

    it('should add Phone Menu Say to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      //Add Phone Menu Say Message
      utils.click(autoattendant.phoneMenu);
      utils.click(autoattendant.phonesayMessageInput);
      utils.sendKeys(autoattendant.phonesayMessageInput, deleteUtils.testAAName);
      utils.expectIsEnabled(autoattendant.saveButton);

      utils.click(autoattendant.phonesayMessageLanguage);
      utils.click(autoattendant.phonelanguageDropDownOptions);
      utils.click(autoattendant.phonesayMessageVoice);
      utils.click(autoattendant.phonesayMessageVoiceOptions);

    }, 60000);

    it('should add Phone Menu Repeat to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      //Add first Phone repeat Menu
      utils.click(autoattendant.phoneMenuKeys.first());
      utils.click(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).first());
      utils.click(autoattendant.phoneMenuAction.first());
      utils.click(autoattendant.phoneMenuActionOptions.first().all(by.tagName('li')).first());

      utils.click(autoattendant.repeatPlus);
      //Add Second Phone repeat Menu
      utils.click(autoattendant.phoneMenuKeys.last());
      utils.click(autoattendant.phoneMenuKeyOptions.last().all(by.tagName('li')).last());
      utils.click(autoattendant.phoneMenuAction.last());
      utils.click(autoattendant.phoneMenuActionOptions.last().all(by.tagName('li')).last());
    }, 60000);

    it('should delete one Phone Menu Repeat to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      //Delete one repeatMenu
      utils.click(autoattendant.trash);
      utils.expectIsEnabled(autoattendant.saveButton);
      utils.click(autoattendant.saveButton);
      utils.expectIsDisabled(autoattendant.saveButton);
      //      notifications.assertSuccess(deleteUtils.testAAName + ' updated successfully');
      autoattendant.assertUpdateSuccess();

    }, 60000);

    it('should add Phone Menu Timeout to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      //Add Phone TimeOut Option
      utils.click(autoattendant.phoneMenuTimeout);
      utils.click(autoattendant.phoneMenuTimeoutOptions);

    });

    it('should close edit', function () {

      utils.click(autoattendant.closeEditButton);

    });

    it('should find new AA named "' + deleteUtils.testAAName + '" on the landing page', function () {

      utils.expectIsEnabled(autoattendant.testCardName);

    });

    it('should delete new AA named "' + deleteUtils.testAAName + '" on the landing page', function () {

      utils.click(autoattendant.testCardDelete);

      utils.expectText(autoattendant.deleteModalConfirmText, 'Are you sure you want to delete the ' + deleteUtils.testAAName + ' Auto Attendant?').then(function () {
        utils.click(autoattendant.deleteModalConfirmButton);

      });

    });

  });

});
