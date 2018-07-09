import moduleName from './index';

import { ServicesOverviewController } from './services-overview.component';
import { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';
import { EnterprisePrivateTrunkService } from 'modules/hercules/services/enterprise-private-trunk-service';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { Config } from 'modules/core/config/config';
import { UserOverviewService } from 'modules/core/users/userOverview/userOverview.service';

describe('ServicesOverviewController', () => {

  let $componentController: ng.IComponentControllerService;
  let $q: ng.IQService;
  let $scope: ng.IScope;
  let $state: ng.ui.IStateService;
  let ctrl: ServicesOverviewController;
  let Analytics;
  let Authinfo;
  let CloudConnectorService: CloudConnectorService;
  let Config: Config;
  let EnterprisePrivateTrunkService: EnterprisePrivateTrunkService;
  let FeatureToggleService;
  let HybridServicesClusterService: HybridServicesClusterService;
  let enabledFeatureToggles: string[] = [];
  let ServiceDescriptorService;
  let HybridServicesClusterStatesService;
  let UserOverviewService: UserOverviewService;

  // Spies
  let getRoles: jasmine.Spy;
  let isFusionUC: jasmine.Spy;
  let isFusionCal: jasmine.Spy;
  let isFusionGoogleCal: jasmine.Spy;
  let isFusionMedia: jasmine.Spy;
  let isEnterpriseCustomer: jasmine.Spy;
  let isContactCenterContext: jasmine.Spy;
  let isSquaredUC: jasmine.Spy;
  let isFusionIMP: jasmine.Spy;
  let getService: jasmine.Spy;
  let fetch: jasmine.Spy;
  let getStatusForService: jasmine.Spy;
  let isPartnerAdmin: jasmine.Spy;

  beforeEach(angular.mock.module(moduleName));
  beforeEach(inject(dependencies));
  beforeEach(() => {
    enabledFeatureToggles = [];
    spyOn(Analytics, 'trackEvent');
    spyOn(Authinfo, 'getConferenceServicesWithoutSiteUrl').and.returnValue(false);
    spyOn(Authinfo, 'getConferenceServicesWithLinkedSiteUrl').and.returnValue(false);
    getRoles = spyOn(Authinfo, 'getRoles').and.returnValue([]);
    isFusionUC = spyOn(Authinfo, 'isFusionUC').and.returnValue(false);
    isFusionCal = spyOn(Authinfo, 'isFusionCal').and.returnValue(false);
    isFusionGoogleCal = spyOn(Authinfo, 'isFusionGoogleCal').and.returnValue(false);
    isFusionMedia = spyOn(Authinfo, 'isFusionMedia').and.returnValue(false);
    isEnterpriseCustomer = spyOn(Authinfo, 'isEnterpriseCustomer').and.returnValue(false);
    isContactCenterContext = spyOn(Authinfo, 'isContactCenterContext').and.returnValue(false);
    isSquaredUC = spyOn(Authinfo, 'isSquaredUC').and.returnValue(false);
    isFusionIMP = spyOn(Authinfo, 'isFusionIMP').and.returnValue(false);
    isPartnerAdmin = spyOn(Authinfo, 'isPartnerAdmin').and.returnValue(false);
    getService = spyOn(CloudConnectorService, 'getService').and.returnValue($q.resolve({}));
    fetch = spyOn(EnterprisePrivateTrunkService, 'fetch').and.returnValue($q.resolve([]));
    spyOn(FeatureToggleService, 'supports').and.callFake((name) => $q.resolve(_.includes(enabledFeatureToggles, name)));
    spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve([]));
    spyOn(HybridServicesClusterService, 'processClustersToAggregateStatusForService').and.returnValue($q.resolve({}));
    getStatusForService = spyOn(ServiceDescriptorService, 'getServices').and.returnValue($q.resolve({}));
    spyOn(HybridServicesClusterStatesService, 'getServiceStatusCSSClassFromLabel').and.returnValue('success');
    spyOn(UserOverviewService, 'getUser').and.returnValue($q.resolve({}));

  });

  function dependencies(_$componentController_, _$q_, _$rootScope_, _Analytics_, _Authinfo_, _CloudConnectorService_, _Config_, _EnterprisePrivateTrunkService_, _FeatureToggleService_, _HybridServicesClusterService_, _HybridServicesClusterStatesService_, _ServiceDescriptorService_, _$state_, _UserOverviewService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    Analytics = _Analytics_;
    Authinfo = _Authinfo_;
    CloudConnectorService = _CloudConnectorService_;
    Config = _Config_;
    EnterprisePrivateTrunkService = _EnterprisePrivateTrunkService_;
    FeatureToggleService = _FeatureToggleService_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    HybridServicesClusterStatesService = _HybridServicesClusterStatesService_;
    ServiceDescriptorService = _ServiceDescriptorService_;
    UserOverviewService = _UserOverviewService_;
    $state = _$state_;
  }

  function initController() {
    ctrl = $componentController('servicesOverview', {}, {
      urlParams: {
        office365: undefined,
      },
    });
    $state.current = { name: 'services-overview' };
    ctrl.$onInit();
    $scope.$apply();
  }

  function initControllerPartner() {
    ctrl = $componentController('servicesOverview', {}, {
      urlParams: {
        office365: undefined,
      },
    });
    $state.current = { name: 'partner-services-overview' };
    ctrl.$onInit();
    $scope.$apply();
  }

  describe('$onInit', () => {
    it('should create 5 cloud cards', () => {
      initController();
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.message.title' }).length).toBe(1);
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.meeting.title', isPartner: false }).length).toBe(1);
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.call.title' }).length).toBe(1);
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.care.title' }).length).toBe(1);
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.meeting.title', isPartner: true, display: false }).length).toBe(1);
    });

    it('should load the webex site list', () => {
      initController();
      expect(Authinfo.getConferenceServicesWithoutSiteUrl).toHaveBeenCalled();
      expect(Authinfo.getConferenceServicesWithLinkedSiteUrl).toHaveBeenCalled();
    });

    it('should leave servicesToDisplay empty', () => {
      expect(ctrl._servicesToDisplay.length).toBe(0);
    });

    // Below are tests for cards being displayed, and inactive
    it('should have not populate servicesToDisplay if nothing is setup/entitled', () => {
      initController();
      expect(ctrl._servicesToDisplay.length).toBe(0);
      expect(ctrl._servicesActive.length).toBe(0);
      expect(ctrl._servicesInactive.length).toBe(0);
    });

    it('should display Hybrid Call if the org is entitled to it', () => {
      isFusionUC.and.returnValue(true);
      initController();
      expect(ctrl._servicesToDisplay).toEqual(['squared-fusion-uc']);
      expect(ctrl._servicesInactive).toEqual(['squared-fusion-uc']);
    });

    it('should display Hybrid Calendar Exchange/Office 365 if the org is entitled to it', () => {
      isFusionCal.and.returnValue(true);
      enabledFeatureToggles = [FeatureToggleService.features.atlasOffice365Support];
      initController();
      expect(ctrl._servicesToDisplay).toEqual(['squared-fusion-cal', 'squared-fusion-o365']);
      expect(ctrl._servicesInactive).toEqual(['squared-fusion-cal', 'squared-fusion-o365']);
    });

    it('should display Hybrid Calendar Google if the org is entitled to it', () => {
      isFusionGoogleCal.and.returnValue(true);
      initController();
      expect(ctrl._servicesToDisplay).toEqual(['squared-fusion-gcal']);
      expect(ctrl._servicesInactive).toEqual(['squared-fusion-gcal']);
    });

    it('should display Video Mesh if the org is entitled to it and the user is full_admin or readonly_admin', () => {
      isFusionMedia.and.returnValue(true);
      getRoles.and.returnValue(Config.roles.full_admin);
      initController();
      expect(ctrl._servicesToDisplay).toEqual(['squared-fusion-media']);
      expect(ctrl._servicesInactive).toEqual(['squared-fusion-media']);

      isFusionMedia.and.returnValue(true);
      getRoles.and.returnValue(Config.roles.readonly_admin);
      initController();
      expect(ctrl._servicesToDisplay).toEqual(['squared-fusion-media']);
      expect(ctrl._servicesInactive).toEqual(['squared-fusion-media']);
    });

    it('should display Hybrid Data Security if the org is an Enterprise Customer and the user is full_admin or readonly_admin', () => {
      isEnterpriseCustomer.and.returnValue(true);
      getRoles.and.returnValue(Config.roles.full_admin);
      initController();
      expect(ctrl._servicesToDisplay).toEqual(['spark-hybrid-datasecurity']);
      expect(ctrl._servicesInactive).toEqual(['spark-hybrid-datasecurity']);
      // not trying the readonly_admin case to shorten the test
    });

    it('should display Context Center if the org is entitled to it', () => {
      isContactCenterContext.and.returnValue(true);
      initController();
      expect(ctrl._servicesToDisplay).toEqual(['contact-center-context']);
      expect(ctrl._servicesInactive).toEqual(['contact-center-context']);
    });

    it('should display EPT if the org is entitled to it and has the feature toggle', () => {
      isSquaredUC.and.returnValue(true);
      enabledFeatureToggles = [FeatureToggleService.features.huronEnterprisePrivateTrunking];
      initController();
      expect(ctrl._servicesToDisplay).toEqual(['ept']);
      expect(ctrl._servicesInactive).toEqual(['ept']);
    });

    it('should display Hybrid IMP if the org is entitled to it and has the feature toggle', () => {
      isFusionIMP.and.returnValue(true);
      enabledFeatureToggles = [FeatureToggleService.features.atlasHybridImp];
      initController();
      expect(ctrl._servicesToDisplay).toEqual(['spark-hybrid-impinterop']);
      expect(ctrl._servicesInactive).toEqual(['spark-hybrid-impinterop']);
    });

    // Below are tests for enabled/disabled
    it('should consider Hybrid Call active, if the Call Service Aware service is setup', () => {
      getStatusForService.and.returnValue($q.resolve([{
        enabled: true,
        id: 'squared-fusion-uc',
      }]));
      isFusionUC.and.returnValue(true);
      initController();
      expect(ctrl._servicesActive).toEqual(['squared-fusion-uc']);
    });

    it('should consider Hybrid Calendar Exchange and Office 365 active, if the services are setup', () => {
      getStatusForService.and.returnValue($q.resolve([{
        enabled: true,
        id: 'squared-fusion-cal',
      }]));
      getService.and.returnValue($q.resolve({
        setup: true,
        serviceId: 'squared-fusion-o365',
      }));
      isFusionCal.and.returnValue(true);
      enabledFeatureToggles = [FeatureToggleService.features.atlasOffice365Support];
      initController();
      expect(ctrl._servicesActive).toEqual(['squared-fusion-cal', 'squared-fusion-o365']);
    });

    it('should consider Google Calendar active, if the service is setup in CCC, but not in FMS', () => {
      getStatusForService.and.returnValue($q.resolve([{
        enabled: false,
        id: 'squared-fusion-gcal',
      }]));
      getService.and.returnValue($q.resolve({
        setup: true,
        serviceId: 'squared-fusion-gcal',
      }));
      isFusionGoogleCal.and.returnValue(true);
      initController();
      expect(ctrl._servicesActive).toEqual(['squared-fusion-gcal']);
    });

    it('should not consider Google Calendar active, if the service only is setup in FMS', () => {
      getStatusForService.and.returnValue($q.resolve([{
        enabled: true,
        id: 'squared-fusion-gcal',
      }]));
      isFusionGoogleCal.and.returnValue(true);
      initController();
      expect(ctrl._servicesActive).toEqual([]);
    });

    it('should consider Video Mesh active, if the service is setup', () => {
      getStatusForService.and.returnValue($q.resolve([{
        enabled: true,
        id: 'squared-fusion-media',
      }]));
      isFusionMedia.and.returnValue(true);
      getRoles.and.returnValue(Config.roles.full_admin);
      initController();
      expect(ctrl._servicesActive).toEqual(['squared-fusion-media']);
    });

    it('should consider Hybrid Data Security active, if the service is setup', () => {
      getStatusForService.and.returnValue($q.resolve([{
        enabled: true,
        id: 'spark-hybrid-datasecurity',
      }]));
      isEnterpriseCustomer.and.returnValue(true);
      getRoles.and.returnValue(Config.roles.full_admin);
      initController();
      expect(ctrl._servicesActive).toEqual(['spark-hybrid-datasecurity']);
    });

    it('should consider Hybrid Context Center active, if the service is setup', () => {
      getStatusForService.and.returnValue($q.resolve([{
        enabled: true,
        id: 'contact-center-context',
      }]));
      isContactCenterContext.and.returnValue(true);
      initController();
      expect(ctrl._servicesActive).toEqual(['contact-center-context']);
    });

    it('should consider EPT active, if the service is setup', () => {
      fetch.and.returnValue($q.resolve([{
        name: 'string',
        address: 'string',
        status: {
          id: 'abc',
          state: 'operational',
          type: '',
          destinations: [{
            address: 'string',
            state: 'operational',
          }],
          alarms: [],
        },
      }]));
      isSquaredUC.and.returnValue(true);
      enabledFeatureToggles = [FeatureToggleService.features.huronEnterprisePrivateTrunking];
      initController();
      expect(ctrl._servicesActive).toEqual(['ept']);
    });

    it('should consider Hybrid IMP active, if the service is setup', () => {
      getStatusForService.and.returnValue($q.resolve([{
        enabled: true,
        id: 'spark-hybrid-impinterop',
      }]));
      isFusionIMP.and.returnValue(true);
      enabledFeatureToggles = [FeatureToggleService.features.atlasHybridImp];
      initController();
      expect(ctrl._servicesActive).toEqual(['spark-hybrid-impinterop']);
    });
  });

  describe('$onInit partner ServicesOverview', () => {
    beforeEach(function () {
      enabledFeatureToggles = [FeatureToggleService.features.gemServicesTab];
      enabledFeatureToggles = [FeatureToggleService.features.atlasHostedCloudService];

      isPartnerAdmin.and.returnValue(true);
      initControllerPartner();
    });

    it('should list CCA cloud card', () => {
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.message.title' }).length).toBe(1);
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.meeting.title', isPartner: false }).length).toBe(1);
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.call.title' }).length).toBe(1);
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.care.title' }).length).toBe(1);
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.meeting.title', isPartner: true, display: false }).length).toBe(1);
    });

    it('should load hybrid HCS Services cards', () => {
      expect(ctrl._servicesToDisplay).toEqual(['hcs']);
    });
  });
});
