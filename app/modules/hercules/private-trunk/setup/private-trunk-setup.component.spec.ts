import privateTrunkSetupModule from './index';
describe ('Component: PrivateTrunkSetup', () => {
  const BUTTON_CLOSE = 'button.btn.btn-primary';
  const BUTTON_NEXT = 'button.btn.btn-primary';
  const BUTTON_BACK = 'button.btn.btn-default';

  beforeEach(function() {
    this.initModules(privateTrunkSetupModule);
    this.injectDependencies(
      '$q',
      '$scope',
      '$state',
      '$modal',
      '$translate',
      'PrivateTrunkPrereqService',
      'CertService',
      'CertificateFormatterService',
      'Authinfo',
      'Notification',
      'PrivateTrunkService',
      '$httpBackend',
    );
  });

  function initComponent() {
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('1234');
    spyOn(this.PrivateTrunkPrereqService, 'getVerifiedDomains').and.returnValue(this.$q.when(['domain1']));
    spyOn(this.CertService, 'uploadCertificate');
    spyOn(this.CertService, 'getCerts');
    spyOn(this.CertService, 'deleteCert');
    spyOn(this.CertificateFormatterService, 'formatCerts');
    spyOn(this.PrivateTrunkService, 'createPrivateTrunkResource');
    spyOn(this.PrivateTrunkService, 'setPrivateTrunk');
    this.compileComponent('privateTrunkSetup', {
    });
  }

  describe('init', () => {
    beforeEach(initComponent);

    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('should be created successfully', function() {
      expect(this.controller).toBeDefined();
      expect(this.controller.currentStepIndex).toBe(1);
      expect(this.controller.domains.length).toBe(1);
    });

    it('should set next step and previous step successfully', function() {
      this.controller.nextStep();
      expect(this.controller.currentStepIndex).toBe(2);
      this.controller.previousStep();
      expect(this.controller.currentStepIndex).toBe(1);
      expect(this.controller.isNextButton()).toBe(false);
    });

    it('should have close next and back buttons', function() {
      expect(this.view.find(BUTTON_CLOSE)).toExist();
      expect(this.view.find(BUTTON_NEXT)).toExist();
      expect(this.view.find(BUTTON_BACK)).toExist();
    });
  });
});
