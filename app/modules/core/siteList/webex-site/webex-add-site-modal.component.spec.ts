import module from './index';
describe('Component: WebexAddSiteModalComponent', function () {

  const TRANSFER_SCREEN = 'webex-site-transfer';
  const SUBSCRIPTION_SCREEN = 'webex-site-subscription';
  beforeEach(function () {
    this.initModules(module);
    this.injectDependencies('$scope', '$rootScope', 'Config', 'SetupWizardService');
    this.$scope.fixtures = {
      subscriptionListSingle: ['Sub-012'],
      subscriptionListMultiple: ['Sub-012', '013'],
      audioLicenses: getJSONFixture('core/json/setupWizard/sites/audio-licenses.json'),
      conferenceLicenses: getJSONFixture('core/json/setupWizard/sites/conference-licenses.json'),
    };

    this.compileComponent('webexAddSiteModal', {
      subscriptionList: 'fixtures.subscriptionListSingle',
      conferenceServices: 'fixtures.conferenceServices',
      audioLicenses: 'fixtures.audioLicenses',
    });
  });

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
    });

  });
});

