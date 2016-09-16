'use strict';
/*eslint-disable */

describe('Huron Auto Attendant', function () {

  var initialIgnoreSync = true;

  beforeAll(function () {

    initialIgnoreSync = browser.ignoreSynchronization;

    login.login('aa-admin');

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
      autoattendant.scrollIntoView(autoattendant.sayMessage);
      utils.expectIsDisplayed(autoattendant.sayMessage);

    }, 60000);

    it('should add a single phone number to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      autoattendant.scrollIntoView(autoattendant.lanesWrapper);
      utils.wait(autoattendant.addAANumbers, 12000);

      utils.click(autoattendant.numberDropDownArrow);

      // we are going to arbitrarily select the last one
      utils.click(autoattendant.numberDropDownOptions.last());

      // save and assert we see successful save message and save is disabled
      utils.click(autoattendant.saveButton);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

      utils.expectIsDisabled(autoattendant.saveButton);

    }, 60000);

    it('should add SayMessage Message, select Language and Voice to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

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

      // and save
      utils.expectIsEnabled(autoattendant.saveButton);
      utils.click(autoattendant.saveButton);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);

      utils.expectIsDisabled(autoattendant.saveButton);
    }, 60000);

    it('should add Phone Menu Say to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      autoattendant.scrollIntoView(autoattendant.phoneMenuSay);
      //Add Phone Menu Say Message
      utils.click(autoattendant.phoneMenuSay);
      utils.click(autoattendant.phonesayMessageInput);
      utils.sendKeys(autoattendant.phonesayMessageInput, "Press a key at the menu");
      utils.expectIsEnabled(autoattendant.saveButton);

      // language and voice
      autoattendant.scrollIntoView(autoattendant.phonelanguageDropDownOptions);
      utils.click(autoattendant.phonesayMessageLanguage);
      utils.click(autoattendant.phonelanguageDropDownOptions);
      utils.click(autoattendant.phonesayMessageVoice);
      utils.click(autoattendant.phonesayMessageVoiceOptions);

    });

    it('should add Phone Menu Repeat to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // Main menu key 0 - repeat menu
      utils.click(autoattendant.phoneMenuKeys.first());
      autoattendant.scrollIntoView(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).first());
      utils.click(autoattendant.phoneMenuKeyOptions.all(by.linkText(autoattendant.key0)).first());

      utils.click(autoattendant.phoneMenuAction.first());
      utils.click(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.repeatMenu)).first());

    });

    it('should add a submenu to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // Main menu key 1 - play submenu
      utils.click(autoattendant.repeatPlus);

      utils.click(autoattendant.phoneMenuKeys.get(1));
      autoattendant.scrollIntoView(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).first());
      utils.click(autoattendant.phoneMenuKeyOptions.all(by.linkText(autoattendant.key1)).first());

      utils.click(autoattendant.phoneMenuAction.get(1));
      utils.click(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.playSubmenu)).first());

    });

    it('should add say message into submenu of the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // 1st submenu say message
      autoattendant.scrollIntoView(autoattendant.submenuSayMessage.get(0));
      var textBox = autoattendant.submenuSayMessage.get(0).element(by.name('sayMessageInput'));
      utils.click(textBox);
      utils.sendKeys(textBox, "Welcome to first AA submenu");

    });

    it('should set first button of submenu to repeat menu', function () {

      // 1st submenu key 0 - repeat menu
      var submenuI = 0;
      utils.click(autoattendant.submenuKeys(submenuI).first());
      autoattendant.scrollIntoView(autoattendant.submenuKeyOptions(submenuI).first().all(by.tagName('li')).first());
      utils.click(autoattendant.submenuKeyOptions(submenuI).all(by.linkText(autoattendant.key0)).first());

      utils.click(autoattendant.submenuAction(submenuI).first());
      utils.click(autoattendant.submenuActionOptions(submenuI).all(by.linkText(autoattendant.repeatMenu)).first());

    });

    it('should add a Go Back to submenu', function () {

      // 1st submenu key 1 - Go Back
      var submenuI = 0;
      utils.click(autoattendant.submenuRepeatPlus.get(0));

      utils.click(autoattendant.submenuKeys(submenuI).get(1));
      autoattendant.scrollIntoView(autoattendant.submenuKeyOptions(submenuI).first().all(by.tagName('li')).first());
      utils.click(autoattendant.submenuKeyOptions(submenuI).all(by.linkText(autoattendant.key1)).first());

      utils.click(autoattendant.submenuAction(submenuI).get(1));
      utils.click(autoattendant.submenuActionOptions(submenuI).all(by.linkText(autoattendant.goBack)).first());

    });

    it('should add a second submenu to the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // Main menu key 2 - play submenu
      autoattendant.scrollIntoView(autoattendant.repeatPlus);
      utils.click(autoattendant.repeatPlus);
      utils.click(autoattendant.phoneMenuKeys.get(2));
      autoattendant.scrollIntoView(autoattendant.phoneMenuKeyOptions.get(2).all(by.tagName('li')).first());
      utils.click(autoattendant.phoneMenuKeyOptions.all(by.linkText(autoattendant.key2)).first());
      utils.click(autoattendant.phoneMenuAction.get(2));
      utils.click(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.playSubmenu)).first());
    });

    it('should add say message into the second submenu of the new auto attendant named "' + deleteUtils.testAAName + '"', function () {

      // 2nd submenu say message
      autoattendant.scrollIntoView(autoattendant.submenuSayMessage.get(1));
      var textBox = autoattendant.submenuSayMessage.get(1).element(by.name('sayMessageInput'));
      utils.click(textBox);
      utils.sendKeys(textBox, "Welcome to second AA submenu");

    });

    it('should set first button of the second submenu to repeat menu', function () {

      // 2nd submenu key 0 - repeat menu
      var submenuI = 1;
      utils.click(autoattendant.submenuKeys(submenuI).first());
      autoattendant.scrollIntoView(autoattendant.submenuKeyOptions(submenuI).first().all(by.tagName('li')).first());
      utils.click(autoattendant.submenuKeyOptions(submenuI).all(by.linkText(autoattendant.key0)).first());

      utils.click(autoattendant.submenuAction(submenuI).first());
      utils.click(autoattendant.submenuActionOptions(submenuI).all(by.linkText(autoattendant.repeatMenu)).first());

    });

    it('should add a Go Back to the second submenu', function () {

      //2nd submenu key 1 - Go Back
      var submenuI = 1;
      utils.click(autoattendant.submenuRepeatPlus.get(1));

      utils.click(autoattendant.submenuKeys(submenuI).get(1));
      autoattendant.scrollIntoView(autoattendant.submenuKeyOptions(submenuI).first().all(by.tagName('li')).first());
      utils.click(autoattendant.submenuKeyOptions(submenuI).all(by.linkText(autoattendant.key1)).first());

      utils.click(autoattendant.submenuAction(submenuI).get(1));
      utils.click(autoattendant.submenuActionOptions(submenuI).all(by.linkText(autoattendant.goBack)).first());

    });

    it('should save AA and return to landing page', function () {
      utils.click(autoattendant.saveButton);
      autoattendant.assertUpdateSuccess(deleteUtils.testAAName);
      utils.expectIsDisabled(autoattendant.saveButton);
      utils.click(autoattendant.closeEditButton);
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

    it('should contain two submenus previously created in AA "' + deleteUtils.testAAName, function () {
      expect(autoattendant.phoneMenuAction.count()).toBe(3);
      expect(autoattendant.phoneMenuKeyOptions.count()).toBe(3);
      expect(autoattendant.phoneMenuKeysContent.get(0).getInnerHtml()).toContain(autoattendant.key0);
      expect(autoattendant.phoneMenuActionContent.get(0).getInnerHtml()).toContain(autoattendant.repeatMenu);
      expect(autoattendant.phoneMenuKeysContent.get(1).getInnerHtml()).toContain(autoattendant.key1);
      expect(autoattendant.phoneMenuActionContent.get(1).getInnerHtml()).toContain(autoattendant.playSubmenu);
      expect(autoattendant.phoneMenuKeysContent.get(2).getInnerHtml()).toContain(autoattendant.key2);
      expect(autoattendant.phoneMenuActionContent.get(2).getInnerHtml()).toContain(autoattendant.playSubmenu);

      var submenuI = 0;
      expect(autoattendant.submenuKeysContent(submenuI).get(0).getInnerHtml()).toContain(autoattendant.key0);
      expect(autoattendant.submenuActionContent(submenuI).get(0).getInnerHtml()).toContain(autoattendant.repeatMenu);
      expect(autoattendant.submenuKeysContent(submenuI).get(1).getInnerHtml()).toContain(autoattendant.key1);
      expect(autoattendant.submenuActionContent(submenuI).get(1).getInnerHtml()).toContain(autoattendant.goBack);

      submenuI = 1;
      expect(autoattendant.submenuKeysContent(submenuI).get(0).getInnerHtml()).toContain(autoattendant.key0);
      expect(autoattendant.submenuActionContent(submenuI).get(0).getInnerHtml()).toContain(autoattendant.repeatMenu);
      expect(autoattendant.submenuKeysContent(submenuI).get(1).getInnerHtml()).toContain(autoattendant.key1);
      expect(autoattendant.submenuActionContent(submenuI).get(1).getInnerHtml()).toContain(autoattendant.goBack);

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
