'use strict';
/*eslint-disable */

/* global describe */
/* global it */
/* global browser */
/* global utils */
/* global login */
/* global navigation */
/* global notifications */
/* global protractor */

describe('Huron Auto Attendant', function () {

  beforeAll(function () {
    login.login('huron-int1');
  }, 120000);

  describe('Create AA', function () {

    // TEST CASES
    it('should navigate to "Add new Auto Attendant" and create a new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      // Cleanup the leftover (from last test run) auto-attendant
      var flow = protractor.promise.controlFlow();
      var result = flow.execute(deleteUtils.findAndDeleteTestAA);

      navigation.clickAutoAttendant();

      utils.click(autoattendant.newFeatureButton);

      utils.wait(autoattendant.featureTypeAA, 12000);
      utils.click(autoattendant.featureTypeAA);

      utils.sendKeys(autoattendant.newAAname, deleteUtils.testAAName);
      utils.sendKeys(autoattendant.newAAname, protractor.Key.ENTER);

      utils.wait(autoattendant.addAANumbers, 12000);
      utils.expectIsDisplayed(autoattendant.addAANumbers);

      utils.expectIsDisplayed(autoattendant.sayMessage);

      notifications.assertSuccess(deleteUtils.testAAName + ' created successfully');

    });

    it('should add a single phone number to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {
      utils.wait(autoattendant.addAANumbers, 12000);
      utils.click(autoattendant.numberDropDownArrow);

      // we are going to arbitrarily select the first one
      utils.click(autoattendant.numberDropDownOptions.get(0));

      utils.click(autoattendant.saveButton);

      notifications.assertSuccess(deleteUtils.testAAName + ' updated successfully');

    });

    it('should delete a phone number to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.click(autoattendant.numberIconClose);

      utils.click(autoattendant.saveButton);

      notifications.assertSuccess(deleteUtils.testAAName + ' updated successfully');

    });

    it('should add a second phone number to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.click(autoattendant.numberDropDownArrow);

      // we are going to arbitrarily select the first one
      utils.click(autoattendant.numberDropDownOptions.get(0));

      utils.click(autoattendant.saveButton);

      notifications.assertSuccess(deleteUtils.testAAName + ' updated successfully');

    });

    it('should add SayMessage Message, select Language and Voice to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      utils.click(autoattendant.sayMessageInput);

      // we are going to arbitrarily select the first one
      utils.sendKeys(autoattendant.sayMessageInput, deleteUtils.testAAName);
      utils.click(autoattendant.sayMessageLanguage);

      utils.click(autoattendant.languageDropDownOptions);

      utils.click(autoattendant.sayMessageVoice);
      utils.click(autoattendant.sayMessageVoiceOptions);
    });

    it('should add Phone Menu to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      //Add Phone Menu Say Message
      utils.click(autoattendant.phoneMenu);
      utils.click(autoattendant.phonesayMessageInput);
      utils.sendKeys(autoattendant.phonesayMessageInput, deleteUtils.testAAName);

      utils.click(autoattendant.phonesayMessageLanguage);
      utils.click(autoattendant.phonelanguageDropDownOptions);
      utils.click(autoattendant.phonesayMessageVoice);
      utils.click(autoattendant.phonesayMessageVoiceOptions);

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

      //Add Phone TimeOut Option
      utils.click(autoattendant.phoneMenuTimeout);
      utils.click(autoattendant.phoneMenuTimeoutOptions);

      //Delete one repeatMenu
      utils.click(autoattendant.trash);

      utils.click(autoattendant.saveButton);

      notifications.assertSuccess(deleteUtils.testAAName + ' updated successfully');

    });

  });

});
