'use strict';

/*eslint-disable */

describe('Huron Auto Attendant', function () {
  var remote = require('selenium-webdriver/remote');
  var testAAName;
  var testCardClick;
  var testCardClose;
  var flow;

  beforeAll(function () {

    deleteUtils.testAAName = deleteUtils.testAAName + "_" + 'RouteToHG_' + Date.now();

    testAAName = element(by.css('p[title="' + deleteUtils.testAAName + '"]'));
    testCardClick = testAAName.element(by.xpath('ancestor::article')).element(by.css('.card-body'));
    testCardClose = testAAName.element(by.xpath('ancestor::article')).element(by.css('.header-with-right-icon')).element(by.css('.card-icon-div')).element(by.css('.close'));

    browser.setFileDetector(new remote.FileDetector());

    login.login('aa-admin', autoattendant.callFeature);
  }, 120000);
  
  afterAll(function () {
  });

  describe('Create AA', function () {

    // TEST CASES
    it('should navigate to AA landing page and create AA', function () {

      // click new feature
      utils.click(autoattendant.newFeatureButton);
      browser.driver.sleep(1000);

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
        utils.sendKeys(autoattendant.phonesayMessageInput, "Press 0 for Route to Hunt Group");
        utils.expectIsEnabled(autoattendant.saveButton);
        utils.click(autoattendant.saveButton);

        // language and voice
        autoattendant.scrollIntoView(autoattendant.phonesayMessageLanguage);
        utils.click(autoattendant.phonesayMessageLanguage);
        utils.click(autoattendant.phonelanguageDropDownOptions);
        utils.click(autoattendant.phonesayMessageVoice);
        utils.click(autoattendant.phonesayMessageVoiceOptions);

    }, 120000);
    
    it('should add route to hunt group as an action in phone menu in auto attendant named' + deleteUtils.testAAName + '"', function () {
        
        //Add first Phone menu and route to hunt to group Menu
        utils.click(autoattendant.phoneMenuKeys.first());

        autoattendant.scrollIntoView(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).first());
        utils.wait(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).first());

        utils.click(autoattendant.phoneMenuKeyOptions.first().all(by.tagName('li')).first());
        utils.click(autoattendant.phoneMenuAction.first());
        utils.wait(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.routeToHuntGroup)).first(), 120000);

        autoattendant.scrollIntoView(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.routeToHuntGroup)).first());
        utils.wait(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.routeToHuntGroup)).first(), 1200000);

        utils.click(autoattendant.phoneMenuActionOptions.all(by.linkText(autoattendant.routeToHuntGroup)).first());

        utils.click(autoattendant.phoneMenuActionTargets.first());
        browser.driver.sleep(10000);
        autoattendant.scrollIntoView(autoattendant.phoneMenuActionOptionList.first().all(by.tagName('li')).first());
        utils.wait(autoattendant.phoneMenuActionOptionList.first().all(by.tagName('li')).first());
        utils.click(autoattendant.phoneMenuActionOptionList.first().all(by.tagName('li')).first());
        

        utils.expectIsEnabled(autoattendant.saveButton);
        utils.click(autoattendant.saveButton);
        browser.driver.sleep(10000);
    }, 120000);
                        
  });
});