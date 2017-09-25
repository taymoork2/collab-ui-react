import * as provisioner from '../../../provisioner/provisioner';
import { huronCustomer } from '../../../provisioner/huron/huron-customer-config';
import { CallFeaturesPage } from '../../pages/callFeatures.page';
import { HuntGroupEditPage } from '../../pages/huntGroupEdit.page';

const callFeatures = new CallFeaturesPage();
const huntGroupEditPage = new HuntGroupEditPage();

describe('Huron Functional: edit hunt group', () => {
  const customer = huronCustomer({
    test: 'edit-huntGroup',
    users: 4,
    doHuntGroup: true,
  });

  beforeAll(done => {
    provisioner.provisionCustomerAndLogin(customer)
      .then(done);
  });

  afterAll(done => {
    provisioner.tearDownAtlasCustomer(customer.partner, customer.name).then(done);
  });

  it('should be on overview page of customer portal', () => {
    navigation.expectDriverCurrentUrl('overview');
    utils.expectIsDisplayed(navigation.tabs);
  });
  describe('Check for configured features', () => {
    it('should navigate to call features page', () => {
      navigation.clickServicesTab();
      utils.click(callFeatures.callFeatures);
    });

    it('should have lines link', ()=> {
      utils.expectIsDisplayed(callFeatures.callLines);
    });

    it('should have setting link', ()=> {
      utils.expectIsDisplayed(callFeatures.callSettings);
    });

    it('should have search box', ()=> {
      utils.expectIsDisplayed(callFeatures.searchBox);
    });

    it('should have all features link', ()=> {
      utils.expectIsDisplayed(callFeatures.all);
    });

    it('should have auto attendant link', ()=> {
      utils.expectIsDisplayed(callFeatures.autoAttendant);
    });

    it('should have call park link', ()=> {
      utils.expectIsDisplayed(callFeatures.callPark);
    });

    it('should have call pickup link', ()=> {
      utils.expectIsDisplayed(callFeatures.callPickup);
    });

    it('should have hunt group link', ()=> {
      utils.expectIsDisplayed(callFeatures.huntGroup);
    });

    it('should have paging group link', ()=> {
      utils.expectIsDisplayed(callFeatures.pagingGroup);
    });

    it('should have new button', ()=> {
      utils.expectIsDisplayed(callFeatures.newButton);
    });

    it('should have a hunt group card', ()=> {
      utils.expectIsDisplayed(callFeatures.card);
    })
  });
  describe('Test the hunt group number section of edit page', () => {
    it('should be on hunt group edit page', () => {
      utils.click(callFeatures.card);
      navigation.expectDriverCurrentUrl('#/features/hg/edit');
    });
    
    it('should have back arrow', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.backArrow);
    });
    
    it('should have alert name input box', () => {
      utils.expectIsDisplayed(huntGroupEditPage.subtitleAlertNameInput);
    });

    it('should have hunt group number input box', () => {
      utils.expectIsDisplayed(huntGroupEditPage.subtitleHGNumInput);
    });

    it('should have hunt group number card', () => {
      utils.expectIsDisplayed(huntGroupEditPage.numCard);
    });
  });
  describe('Test the hunt group call settings section of edit page', () => {
    it('should have display call settings title', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.callSettingsTitle);
    });

    it('should have display max ring title', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.subTtileMaxRing);
    });

    it('should have display max ring description', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.subTitleMaxRingDesc);
    });

    it('should have display max ring dropdown', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.ringDropDwon);
    });

    it('should have label for seconds', () => {
      utils.expectIsDisplayed(huntGroupEditPage.seconds);
    });

    it('should have display max wait title', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.maxWaitTime);
    });

    it('should have display max wait description', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.maxWaitTimeDesc);
    });

    it('should have display max wait dropdown', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.maxWaitDropDwon);
    });

    it('should have label for seconds', () => {
      utils.expectIsDisplayed(huntGroupEditPage.minutes);
    });

    it('should have fallback dest', () => {
      utils.expectIsDisplayed(huntGroupEditPage.fallbackDest);
    });

    it('should have fallback dest desc', () => {
      utils.expectIsDisplayed(huntGroupEditPage.fallbackDestDesc);
    });

    it('should have fallback dest card for members', () => {
      utils.expectIsDisplayed(huntGroupEditPage.fallbackCardMember);
    });

    it('should have fallback VMChk', () => {
      utils.expectIsDisplayed(huntGroupEditPage.fallbackVMChk);
    });

    it('should have fallback VMChk desc for minutes', () => {
      utils.expectIsDisplayed(huntGroupEditPage.fallbackVMDesc);
    });
  });
  describe('Test the hunt group fallback section of edit page', () => {    
    it('should have display fallback title title', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.fallbackTitle);
    });
    
    it('should have fallback sub title', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.fallbackSubTitle);
    });

    it('should have display fallback dest radio', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.fallBackDestRadio);
    });

    it('should have display fallback radio title', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.fallbackDestDesc);
    });

    it('should have display alternate fallback radio help', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.fallBackAlternateRadioTitle);
    });
    it('should have display alternate fallback radio help', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.fallBackDestHelp);
    });

    it('should have display alternate fallback radio help', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.fallBackAlternateRadioTitle);
    });

    it('should have display automatic fallback radio button', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.fallBackAutomaticRadio);
    });

    it('should have display automatic fallback radio title', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.fallBackAutomaticRadioTitle);
    });

    it('should have display automatic fallback radio help', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.fallBackAutomaticHelp);
    });
  });
  describe('Test the hunt group spark call app section of edit page', () => {    
    it('should have display spark call app title', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.sparkCallAppTitle);
    });
    
    it('should have display spark call sub title', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.sparkCallAppSubTitle);
    });

    it('should have display spark call toggle button', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.callToSparkToggle);
    });
  });
  describe('Test the hunting methods section', () => {
    it('should have display hunting methods section', ()=> {
      utils.expectIsDisplayed(huntGroupEditPage.huntMethodsSection);
    });

    it('should have display hunting methods section title', () => {
      utils.expectIsDisplayed(huntGroupEditPage.huntingMetdhodsTitle);
    });

    it('should have display hunting methods section description', () => {
      utils.expectIsDisplayed(huntGroupEditPage.huntingMethodsDesc);
    });

    it('should have display hunting methods longest idle', () => {
      utils.expectIsDisplayed(huntGroupEditPage.longestIdle);
    });

    it('should have display hunting methods broadcast idle', () => {
      utils.expectIsDisplayed(huntGroupEditPage.broadcast);
    });

    it('should have display hunting methods circular', () => {
      utils.expectIsDisplayed(huntGroupEditPage.circular);
    });

    it('should have display hunting methods top down', () => {
      utils.expectIsDisplayed(huntGroupEditPage.topDown);
    });

    it('should have display hunting members ttile', () => {
      utils.expectIsDisplayed(huntGroupEditPage.membersTitle);
    });

    it('should have display hunting members desc', () => {
      utils.expectIsDisplayed(huntGroupEditPage.membersDesc);
    });

    it('should have display hunting members desc', () => {
      utils.expectIsDisplayed(huntGroupEditPage.membersAdd);
    });

    it('should have display hunting members desc', () => {
      utils.expectIsDisplayed(huntGroupEditPage.membersSearch);
    });
  })
});

