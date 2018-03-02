'use strict';

describe('clusterCreationWizardController', function () {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.injectDependencies('$controller',
      '$q',
      '$scope',
      '$state',
      '$translate',
      'AddResourceSectionService',
      'ClusterCascadeBandwidthService',
      'HybridMediaUpgradeScheduleService',
      'HybridMediaReleaseChannelService',
      'SipRegistrationSectionService',
      'TrustedSipSectionService'
    );

    spyOn(this.AddResourceSectionService, 'addRedirectTargetClicked').and.returnValue(this.$q.resolve({}));
    spyOn(this.AddResourceSectionService, 'redirectPopUpAndClose').and.returnValue(this.$q.resolve({}));
    spyOn(this.TrustedSipSectionService, 'saveSipConfigurations').and.returnValue(this.$q.resolve({}));
    spyOn(this.SipRegistrationSectionService, 'saveSipTrunkUrl').and.returnValue(this.$q.resolve({}));
    spyOn(this.ClusterCascadeBandwidthService, 'saveCascadeConfig').and.returnValue(this.$q.resolve({}));
    spyOn(this.HybridMediaReleaseChannelService, 'saveReleaseChannel').and.returnValue(this.$q.resolve({}));
    spyOn(this.HybridMediaUpgradeScheduleService, 'updateUpgradeScheduleAndUI').and.returnValue(this.$q.resolve({}));

    this.mockModal = { dismiss: jasmine.createSpy('dismiss'), close: jasmine.createSpy('close') };

    this.initController = function () {
      this.controller = this.$controller('clusterCreationWizardController', {
        $q: this.$q,
        $translate: this.$translate,
        $state: this.$state,
        firstTimeSetup: false,
        hasMfFeatureToggle: true,
        hasMfSIPFeatureToggle: true,
        hasMfCascadeBwConfigToggle: true,
        AddResourceSectionService: this.AddResourceSectionService,
        TrustedSipSectionService: this.TrustedSipSectionService,
        SipRegistrationSectionService: this.SipRegistrationSectionService,
        ClusterCascadeBandwidthService: this.ClusterCascadeBandwidthService,
        HybridMediaUpgradeScheduleService: this.HybridMediaUpgradeScheduleService,
        HybridMediaReleaseChannelService: this.HybridMediaReleaseChannelService,
        $modalInstance: this.mockModal,
      });
      this.$scope.$apply();
    };
    this.initController();
  });

  it('AddResourceSectionService redirectPopUpAndClose should be called for redirectToTargetAndCloseWindowClicked', function () {
    this.controller.createCluster();
    this.$scope.$apply();
    expect(this.AddResourceSectionService.addRedirectTargetClicked).toHaveBeenCalled();
    expect(this.AddResourceSectionService.redirectPopUpAndClose).toHaveBeenCalled();
    expect(this.SipRegistrationSectionService.saveSipTrunkUrl).toHaveBeenCalled();
    expect(this.TrustedSipSectionService.saveSipConfigurations).toHaveBeenCalled();
  });

  it('controller update cluster list', function () {
    var sampleData = {};
    sampleData.clusterlist = 'Sample Cluster';
    this.controller.childHasUpdatedData(sampleData);
    expect(this.controller.clusterlist).toBe('Sample Cluster');
  });

  it('controller update hostUpdateData', function () {
    var sampleData = {};
    sampleData.hostName = 'Sample Host';
    this.controller.hostUpdateData(sampleData);
    expect(this.controller.hostName).toBe('Sample Host');
  });

  it('controller update cascadeBandwidth', function () {
    var sampleData = {};
    sampleData.cascadeBandwidth = 45;
    sampleData.inValidBandwidth = true;
    this.controller.cascadeBandwidthUpdatedData(sampleData);
    expect(this.controller.cascadeBandwidth).toBe(45);
    expect(this.controller.validCascadeBandwidth).toBe(true);
  });

  it('controller update cluster list', function () {
    var sampleData = {};
    sampleData.trustedsipconfiguration = 'Sample.123';
    this.controller.trustedSipConfigUpdatedData(sampleData);
    expect(this.controller.trustedsipconfiguration).toBe('Sample.123');
  });

  it('clusterCreationWizardController canGoNext should enable the next button when the feild is filled', function () {
    this.controller.currentStep = 0;
    this.controller.hostName = 'sampleHost';
    this.controller.clusterName = 'sampleCluster';
    this.controller.canGoNext();
    expect(this.controller.canGoNext()).toBeTruthy();
  });
});
