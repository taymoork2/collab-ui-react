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
      'Authinfo',
      'Notification',
      'PrivateTrunkService',
      '$httpBackend',
      'CiscoCollaborationCloudCertificateService',
    );
  });

  function initComponent() {
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('1234');
    spyOn(this.PrivateTrunkPrereqService, 'getVerifiedDomains').and.returnValue(this.$q.resolve(['domain1']));
    spyOn(this.CiscoCollaborationCloudCertificateService, 'uploadCertificate');
    spyOn(this.CiscoCollaborationCloudCertificateService, 'deleteUploadedCerts');
    spyOn(this.PrivateTrunkService, 'createPrivateTrunkResource');
    spyOn(this.PrivateTrunkService, 'setPrivateTrunk');
    spyOn(this.CiscoCollaborationCloudCertificateService, 'readCerts').and.returnValue(this.$q.resolve([]));
    this.$state.current.name  = 'services-overview';
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
