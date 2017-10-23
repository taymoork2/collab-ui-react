import module from './index';
describe('Component: WebexAddSiteModalComponent', function () {

  const TRANSFER_SCREEN = 'webex-site-transfer';
  const SUBSCRIPTION_SCREEN = 'webex-site-subscription';
  const ADD_SITE_SCREEN = 'webex-site-new';
  const confServices = getJSONFixture('core/json/authInfo/webexLicenses.json');
  beforeEach(function () {
    this.initModules(module);
    this.injectDependencies('$scope', '$rootScope', 'Config', 'SetupWizardService');
    this.$scope.fixtures = {
      subscriptionListSingle: ['Sub-012'],
      subscriptionListMultiple: ['Sub-012', '013'],
      audioLicenses: getJSONFixture('core/json/setupWizard/sites/audio-licenses.json'),
      conferenceLicenses: getJSONFixture('core/json/setupWizard/sites/conference-licenses.json'),
    };

    initSpies.apply(this);

    this.compileComponent('webexAddSiteModal', {
      subscriptionList: 'fixtures.subscriptionListSingle',
      conferenceServices: 'fixtures.conferenceServices',
      audioLicenses: 'fixtures.audioLicenses',
    });
  });

  function initSpies() {
    spyOn(this.SetupWizardService, 'getWebexLicenses').and.returnValue([{ billingServiceId: 'Sub-012' }, { billingServiceId: '013' }]);
    spyOn(this.SetupWizardService, 'getConferenceLicensesBySubscriptionId').and.returnValue(confServices);
  }

  describe('When first opened', () => {
    it('should go straight to transfer site screen if there is only one subscription', function () {
      expect(this.view.find(TRANSFER_SCREEN).length).toEqual(1);
      expect(this.view.find(SUBSCRIPTION_SCREEN).length).toEqual(0);
    });

    it('should have the next button enabled', function () {
      expect(this.view.find('button.btn-primary')[0].disabled).toBe(false);

    });

    it('should go to subscription selection screen if there are multiple subscriptions', function () {
      this.compileComponent('webexAddSiteModal', {
        subscriptionList: 'fixtures.subscriptionListMultiple',
        conferenceServices: 'fixtures.conferenceServices',
        audioLicenses: 'fixtures.audioLicenses',
      });
      expect(this.view.find(SUBSCRIPTION_SCREEN).length).toEqual(1);
      expect(this.view.find(TRANSFER_SCREEN).length).toEqual(0);
      expect(this.view.find('button.btn-primary').length).toEqual(1);
      expect(this.view.find('button.btn-primary')[0].innerText.trim()).toEqual('common.next');
    });

    it('should go to a specified screen when singleStep is true and display a save butotn instead of next', function () {
      this.compileComponent('webexAddSiteModal', {
        subscriptionList: 'fixtures.subscriptionListMultiple',
        conferenceServices: 'fixtures.conferenceServices',
        singleStep: '2',
      });
      expect(this.view.find(ADD_SITE_SCREEN).length).toEqual(1);
      expect(this.view.find(TRANSFER_SCREEN).length).toEqual(0);
      expect(this.view.find(SUBSCRIPTION_SCREEN).length).toEqual(0);
      expect(this.view.find('button.btn-primary').length).toEqual(1);
      expect(this.view.find('button.btn-primary')[0].innerText.trim()).toEqual('common.save');
    });
  });
});

