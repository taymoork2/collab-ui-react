'use strict';

describe('ClusterCreationWizardController', function () {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.injectDependencies('$controller',
      '$q',
      '$scope',
      '$state',
      '$translate',
      'AddResourceSectionService',
      'ClusterCascadeBandwidthService',
      'HybridMediaEmailNotificationService',
      'HybridMediaReleaseChannelService',
      'HybridMediaUpgradeScheduleService',
      'QosSectionService',
      'SipRegistrationSectionService',
      'TrustedSipSectionService',
      'VideoQualitySectionService'
    );

    spyOn(this.AddResourceSectionService, 'addRedirectTargetClicked').and.returnValue(this.$q.resolve({}));
    spyOn(this.AddResourceSectionService, 'redirectPopUpAndClose').and.returnValue(this.$q.resolve({}));
    spyOn(this.ClusterCascadeBandwidthService, 'saveCascadeConfig').and.returnValue(this.$q.resolve({}));
    spyOn(this.HybridMediaEmailNotificationService, 'saveEmailSubscribers').and.returnValue(this.$q.resolve({}));
    spyOn(this.HybridMediaReleaseChannelService, 'saveReleaseChannel').and.returnValue(this.$q.resolve({}));
    spyOn(this.HybridMediaUpgradeScheduleService, 'updateUpgradeScheduleAndUI').and.returnValue(this.$q.resolve({}));
    spyOn(this.QosSectionService, 'setQos').and.returnValue(this.$q.resolve({}));
    spyOn(this.SipRegistrationSectionService, 'saveSipTrunkUrl').and.returnValue(this.$q.resolve({}));
    spyOn(this.TrustedSipSectionService, 'saveSipConfigurations').and.returnValue(this.$q.resolve({}));
    spyOn(this.VideoQualitySectionService, 'setVideoQuality').and.returnValue(this.$q.resolve({}));

    this.mockModal = { dismiss: jasmine.createSpy('dismiss'), close: jasmine.createSpy('close') };

    this.initController = function () {
      this.controller = this.$controller('ClusterCreationWizardController', {
        $q: this.$q,
        $modalInstance: this.mockModal,
        $state: this.$state,
        $translate: this.$translate,
        AddResourceSectionService: this.AddResourceSectionService,
        ClusterCascadeBandwidthService: this.ClusterCascadeBandwidthService,
        HybridMediaEmailNotificationService: this.HybridMediaEmailNotificationService,
        HybridMediaReleaseChannelService: this.HybridMediaReleaseChannelService,
        HybridMediaUpgradeScheduleService: this.HybridMediaUpgradeScheduleService,
        QosSectionService: this.QosSectionService,
        SipRegistrationSectionService: this.SipRegistrationSectionService,
        TrustedSipSectionService: this.TrustedSipSectionService,
        VideoQualitySectionService: this.VideoQualitySectionService,
        firstTimeSetup: false,
        yesProceed: true,
        hasMfCascadeBwConfigToggle: true,
        hasMfClusterWizardFeatureToggle: true,
        hasMfFirstTimeCallingFeatureToggle: true,
        hasMfFeatureToggle: true,
        hasMfSIPFeatureToggle: true,
      });
      this.$scope.$apply();
    };
    this.initController();
  });

  it('AddResourceSectionService redirectPopUpAndClose should be called for redirectToTargetAndCloseWindowClicked', function () {
    this.controller.emailSubscribers = 'sample@cisco.com';
    this.controller.sipSettingEnabled = true;
    this.controller.releaseChannel = {};
    this.controller.releaseChannel.value = 'beta';
    this.controller.createCluster();
    this.$scope.$apply();
    expect(this.AddResourceSectionService.addRedirectTargetClicked).toHaveBeenCalled();
    expect(this.AddResourceSectionService.redirectPopUpAndClose).toHaveBeenCalled();
    expect(this.SipRegistrationSectionService.saveSipTrunkUrl).toHaveBeenCalled();
    expect(this.HybridMediaEmailNotificationService.saveEmailSubscribers).toHaveBeenCalled();
    expect(this.TrustedSipSectionService.saveSipConfigurations).toHaveBeenCalled();
  });

  it('controller update cluster list', function () {
    var sampleData = {};
    sampleData.clusterlist = 'Sample Cluster';
    this.controller.clusterListUpdated(sampleData);
    expect(this.controller.clusterlist).toBe('Sample Cluster');
  });

  it('controller update hostNameUpdated', function () {
    var sampleData = {};
    sampleData.hostName = 'Sample Host';
    this.controller.hostNameUpdated(sampleData);
    expect(this.controller.hostName).toBe('Sample Host');
  });

  it('controller radio for ova downlaod selected', function () {
    var sampleData = {};
    sampleData.registerNode = '0';
    this.controller.configureNode(sampleData);
    expect(this.controller.registerNode).toBe('0');
  });

  it('ClusterCreationWizardController canGoNext should enable the next button when the feild is filled', function () {
    this.controller.currentStep = 2;
    this.controller.hostName = 'sampleHost';
    this.controller.clusterName = 'sampleCluster';
    this.controller.validNode = true;
    this.controller.onlineNode = false;
    this.controller.offlineNode = false;
    this.controller.canGoNext();
    expect(this.controller.canGoNext()).toBeTruthy();
  });
});
