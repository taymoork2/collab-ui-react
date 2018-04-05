import * as provisioner from '../../../provisioner/provisioner';
import { huronCustomer } from '../../../provisioner/huron/huron-customer-config';
import { CallFeaturesPage } from '../../pages/callFeatures.page';
import { AutoAttendantPage } from '../../pages/autoAttendantFeature.page.js';

const callFeatures = new CallFeaturesPage();
const autoAttendant = new AutoAttendantPage();

describe('Huron Functional: edit auto attendant BASIC', () => {
  const customer = huronCustomer({
    test: 'auto-attendant-edit',
    users: { noOfUsers: 0, noOfDids: 0 },
    places: { noOfPlaces: 0, noOfDids: 0 },
  });

  const AA_NAME = 'Starkiller Base AA Basic';
  // const AA_NUM = '375';
  const remote = require('selenium-webdriver/remote');
  beforeAll(done => {
    browser.setFileDetector(new remote.FileDetector());
    provisioner.provisionCustomerAndLogin(customer)
      .then(done);
  });

  afterAll(done => {
    provisioner.tearDownAtlasCustomer(customer.partner, customer.name)
      .then(done);
  });

  it('should be on overview page of customer portal', () => {
    navigation.expectDriverCurrentUrl('overview');
    utils.expectIsDisplayed(navigation.tabs);
  });
  it('should land on call feature page', () => {
    navigation.clickServicesTab();
    utils.click(callFeatures.callFeatures);
  });
  it('should click on auto attendant button', () => {
    utils.click(callFeatures.newFeatureButton);
    utils.click(callFeatures.aaFeatureButton);
  });
  it('should select basic AA', () => {
    utils.wait(autoattendant.basicAA, 120000);
    utils.click(autoattendant.basicAA);
  });
  it('should name the AA', () => {
    utils.sendKeys(autoAttendant.newAAname, AA_NAME);
  });
  it('should click next arrow', () => {
    utils.click(callFeatures.nextButton).then(() => {
      notifications.assertSuccess();
    });
  });

  describe('edit auto attendant Basic', () => {
    it('should add a single phone number to the new auto attendant named "' + AA_NAME + '"', () => {
      autoattendant.scrollIntoView(autoattendant.lanesWrapper);
      utils.click(autoattendant.addAANumbers);
      // we are going to arbitrarily select the last one
      utils.click(autoattendant.numberDropDownOptions.last());
      // No save and until valid Phone Menu - see AutoAttn 922
    });

    it('should delete a phone number from the new auto attendant named "' + AA_NAME + '"', () => {
      utils.wait(autoattendant.numberByNameCloseAll, 120000);
      utils.click(autoattendant.numberByNameClose);
      expect(autoattendant.numberByNameCloseAll.count()).toEqual(0);
      // No save and until valid Phone Menu - see AutoAttn 922
    }, 120000);


    it('should add a second phone number to the new auto attendant named "' + AA_NAME + '"', () => {
      utils.click(autoattendant.addAANumbers);
      // we are going to arbitrarily select the last one
      utils.click(autoattendant.numberDropDownOptions.last());
      // No save and until valid Phone Menu - see AutoAttn 922
    }, 120000);

    // it('should add Play Message, select Language and Voice to the new auto attendant named "' + AA_NAME + '"', () => {
    //   var absolutePath = utils.resolvePath(autoattendant.mediaFileToUpload);
    //   autoattendant.scrollIntoView(autoattendant.sayMessageBody);
    //   // media upload
    //   utils.click(autoattendant.messageOptions);
    //   utils.click(autoattendant.playMessageOption);
    //   utils.wait(autoattendant.sayMediaUploadInput, 120000);
    //   utils.sendKeys(autoattendant.mediaUploadSend, absolutePath);
    //   utils.click(autoattendant.messageOptions);
    //   // No save and until valid Phone Menu - see AutoAttn 922
    //   utils.click(autoattendant.sayMessageOption);
    // }, 120000);

    it('should add SayMessage Message, select Language and Voice to the new auto attendant named "' + AA_NAME + '"', () => {
      utils.click(autoattendant.messageOptions);
      utils.click(autoattendant.sayMessageOption);

      autoattendant.scrollIntoView(autoattendant.sayMessage);

      // say message
      utils.click(autoattendant.sayMessageInput);
      utils.sendKeys(autoattendant.sayMessageInput, 'Welcome to the AA');
      // language
      autoattendant.scrollIntoView(autoattendant.sayMessageLanguage);
      utils.click(autoattendant.sayMessageLanguage);
      utils.click(autoattendant.languageDropDownOptions);

      // voice
      utils.click(autoattendant.sayMessageVoice);
      utils.click(autoattendant.sayMessageVoiceOptions);

      // No save and until valid Phone Menu - see AutoAttn 922
    }, 120000);

    it('should add Phone Menu Say to the new auto attendant named "' + AA_NAME + '"', () => {
      autoattendant.scrollIntoView(autoattendant.phoneMenuSay);

      utils.wait(autoattendant.phoneMenuSay, 120000);

      autoattendant.scrollIntoView(autoattendant.phoneMenuMessageOptions);
      utils.wait(autoattendant.phoneMenuMessageOptions, 120000);

      utils.click(autoattendant.phoneMenuMessageOptions);
      utils.click(autoattendant.phoneMenuSayMessageOption);

      //Add Phone Menu Say Message
      utils.click(autoattendant.phoneMenuSay);
      utils.click(autoattendant.phonesayMessageInput);
      utils.sendKeys(autoattendant.phonesayMessageInput, 'Press a key at the menu');
      utils.expectIsEnabled(autoattendant.saveButton);

      // language and voice
      autoattendant.scrollIntoView(autoattendant.phonesayMessageLanguage);
      utils.click(autoattendant.phonesayMessageLanguage);
      utils.click(autoattendant.phonelanguageDropDownOptions);
      utils.click(autoattendant.phonesayMessageVoice);
      utils.click(autoattendant.phonesayMessageVoiceOptions);
    }, 120000);

    it('should add Phone Menu Repeat to the new auto attendant named "' + AA_NAME + '"', () => {
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

    it('should add Phone Menu Say to the new auto attendant named "' + AA_NAME + '"', () => {
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

      utils.sendKeys(autoattendant.phoneMenuActionTargets.last().element(by.name('messageInput')), 'This is a phone menu say');
    }, 120000);

    it('should delete one Phone Menu Repeat from the new auto attendant named "' + AA_NAME + '"', () => {
      autoattendant.clearNotifications().then(() => {
        //Delete one repeatMenu
        utils.click(autoattendant.trash);
        // save and assert successful update message
        utils.expectIsEnabled(autoattendant.saveButton);
        utils.click(autoattendant.saveButton);
      });
    }, 120000);

    it('should add Phone Menu Timeout to the new auto attendant named "' + AA_NAME + '"', () => {
      //Add Phone TimeOut Option
      utils.click(autoattendant.phoneMenuTimeout);
      utils.click(autoattendant.phoneMenuTimeoutOptions);
    }, 120000);

    it('should add route to external number to the new auto attendant named "' + AA_NAME + '"', () => {
      utils.click(autoattendant.repeatPlus);
      //Add Route to Phone Number
      utils.click(autoattendant.phoneMenuKeys.last());
      utils.click(autoattendant.phoneMenuKeyOptions.last().all(by.tagName('li')).last());
      utils.click(autoattendant.phoneMenuAction.last());
      utils.click(autoattendant.phoneMenuActionOptions.last().element(by.linkText('Route to Phone Number')));
      utils.click(autoattendant.saveButton);
    }, 120000);

    it('should close AA edit and return to landing page', () => {
      utils.click(autoattendant.closeEditButton);
    }, 120000);
  });
});
