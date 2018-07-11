import callServiceSettingsPageModule from './index';

describe('callServiceSettingsPage template', () => {

  beforeEach(function () {
    this.initModules(callServiceSettingsPageModule);
    this.injectDependencies(
      '$q',
      'Analytics',
      'FeatureToggleService',
      'ServiceDescriptorService',
    );
    spyOn(this.Analytics, 'trackHybridServiceEvent');
  });

  it('should show the Call Service Connect specific items if Call Service Connect is enabled', function () {
    spyOn(this.ServiceDescriptorService, 'isServiceEnabled').and.returnValue(this.$q.resolve(true));
    this.compileComponent('call-service-settings-page');

    expect(this.view.find('sip-destination-settings-section').length).toBe(1);
    expect(this.view.find('cisco-collaboration-cloud-certificate-store').length).toBe(1);
    expect(this.view.find('div#private-trunk-certificate-defaults').length).toBe(1);
  });

  it('should *not* show the Call Service Connect specific items if Call Service Connect is *not* enabled', function () {
    spyOn(this.ServiceDescriptorService, 'isServiceEnabled').and.returnValue(this.$q.resolve(false));
    this.compileComponent('call-service-settings-page');

    expect(this.view.find('sip-destination-settings-section').length).toBe(0);
    expect(this.view.find('private-trunk-certificate').length).toBe(0);
    expect(this.view.find('div#private-trunk-certificate-defaults').length).toBe(0);
  });

  it('should show the Migrate SIP Addresses section if both Call Service Connect and feature toggle are enabled', function () {
    spyOn(this.ServiceDescriptorService, 'isServiceEnabled').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'atlasJ9614SipUriRebrandingGetStatus').and.returnValue(this.$q.resolve(false));
    this.compileComponent('call-service-settings-page');

    expect(this.view.find('migrate-sip-address-section')).not.toExist();

    this.ServiceDescriptorService.isServiceEnabled.and.returnValue(this.$q.resolve(false));
    this.FeatureToggleService.atlasJ9614SipUriRebrandingGetStatus.and.returnValue(this.$q.resolve(true));
    this.compileComponent('call-service-settings-page');

    expect(this.view.find('migrate-sip-address-section')).not.toExist();

    this.ServiceDescriptorService.isServiceEnabled.and.returnValue(this.$q.resolve(true));
    this.FeatureToggleService.atlasJ9614SipUriRebrandingGetStatus.and.returnValue(this.$q.resolve(true));
    this.compileComponent('call-service-settings-page');

    expect(this.view.find('migrate-sip-address-section')).toExist();
  });

});

describe('callServiceSettingsPage controller', () => {

  let $componentController, $scope, $q, CiscoCollaborationCloudCertificateService, ServiceDescriptorService;

  beforeEach(angular.mock.module(callServiceSettingsPageModule));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, _$rootScope_, Analytics, _CiscoCollaborationCloudCertificateService_, _ServiceDescriptorService_) {
    $componentController = _$componentController_;
    $scope = _$rootScope_.$new();
    $q = _$q_;
    CiscoCollaborationCloudCertificateService = _CiscoCollaborationCloudCertificateService_;
    ServiceDescriptorService = _ServiceDescriptorService_;
    spyOn(Analytics, 'trackHybridServiceEvent');
  }

  function initSpies() {
    spyOn(CiscoCollaborationCloudCertificateService, 'readCerts');
    spyOn(ServiceDescriptorService, 'isServiceEnabled');
  }

  function cleanup() {
    $componentController = $scope = $q = CiscoCollaborationCloudCertificateService = ServiceDescriptorService = undefined;
  }

  function initController() {
    return $componentController('callServiceSettingsPage', {}, {});
  }

  it('should read the existing certificate list if Call Service Connect is enabled ', () => {
    const testCertificate = {
      CN: 'test.example.org',
    };
    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));
    CiscoCollaborationCloudCertificateService.readCerts.and.returnValue($q.resolve({
      formattedCertList: [
        testCertificate,
      ],
    }));
    const ctrl = initController();
    ctrl.$onInit();
    $scope.$apply();

    expect(CiscoCollaborationCloudCertificateService.readCerts.calls.count()).toBe(1);
    expect(ctrl.formattedCertList).toEqual(jasmine.objectContaining([testCertificate]));
  });

  it('should *not* read the certificate list if Call Service Connect is not enabled ', () => {
    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(false));
    const ctrl = initController();
    ctrl.$onInit();
    $scope.$apply();

    expect(CiscoCollaborationCloudCertificateService.readCerts.calls.count()).toBe(0);
  });

});
