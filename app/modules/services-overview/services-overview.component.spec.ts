import componentModule from './index';

import { ServicesOverviewController } from './services-overview.component';
import { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';
import { EnterprisePrivateTrunkService } from 'modules/hercules/services/enterprise-private-trunk-service';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { Config } from 'modules/core/config/config';

describe('ServicesOverviewController', () => {

  let $componentController: ng.IComponentControllerService;
  let $httpBackend: ng.IHttpBackendService;
  let $q: ng.IQService;
  let $scope: ng.IScope;
  let ctrl: ServicesOverviewController;
  let Authinfo;
  let CloudConnectorService: CloudConnectorService;
  let Config: Config;
  let EnterprisePrivateTrunkService: EnterprisePrivateTrunkService;
  let FeatureToggleService;
  let HybridServicesClusterService: HybridServicesClusterService;
  let enabledFeatureToggles: string[] = [];

  // Spies
  let getConferenceServicesWithoutSiteUrl: jasmine.Spy;
  let getConferenceServicesWithLinkedSiteUrl: jasmine.Spy;
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
  let supports: jasmine.Spy;
  let getAll: jasmine.Spy;
  let getStatusForService: jasmine.Spy;

  beforeEach(angular.mock.module(componentModule));
  beforeEach(inject(dependencies));
  beforeEach(() => {
    enabledFeatureToggles = [];
    getConferenceServicesWithoutSiteUrl = spyOn(Authinfo, 'getConferenceServicesWithoutSiteUrl').and.returnValue(false);
    getConferenceServicesWithLinkedSiteUrl = spyOn(Authinfo, 'getConferenceServicesWithLinkedSiteUrl').and.returnValue(false);
    getRoles = spyOn(Authinfo, 'getRoles').and.returnValue([]);
    isFusionUC = spyOn(Authinfo, 'isFusionUC').and.returnValue(false);
    isFusionCal = spyOn(Authinfo, 'isFusionCal').and.returnValue(false);
    isFusionGoogleCal = spyOn(Authinfo, 'isFusionGoogleCal').and.returnValue(false);
    isFusionMedia = spyOn(Authinfo, 'isFusionMedia').and.returnValue(false);
    isEnterpriseCustomer = spyOn(Authinfo, 'isEnterpriseCustomer').and.returnValue(false);
    isContactCenterContext = spyOn(Authinfo, 'isContactCenterContext').and.returnValue(false);
    isSquaredUC = spyOn(Authinfo, 'isSquaredUC').and.returnValue(false);
    isFusionIMP = spyOn(Authinfo, 'isFusionIMP').and.returnValue(false);
    getService = spyOn(CloudConnectorService, 'getService').and.returnValue($q.resolve({}));
    fetch = spyOn(EnterprisePrivateTrunkService, 'fetch').and.returnValue($q.resolve([]));
    supports = spyOn(FeatureToggleService, 'supports').and.callFake((name) => $q.resolve(_.includes(enabledFeatureToggles, name)));
    getAll = spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve([]));
    getStatusForService = spyOn(HybridServicesClusterService, 'getStatusForService').and.returnValue($q.resolve({}));
  });

  function dependencies(_$componentController_, _$httpBackend_, _$q_, _$rootScope_, _Authinfo_, _CloudConnectorService_, _Config_, _EnterprisePrivateTrunkService_, _FeatureToggleService_, _HybridServicesClusterService_) {
    $componentController = _$componentController_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    Authinfo = _Authinfo_;
    CloudConnectorService = _CloudConnectorService_;
    Config = _Config_;
    EnterprisePrivateTrunkService = _EnterprisePrivateTrunkService_;
    FeatureToggleService = _FeatureToggleService_;
    HybridServicesClusterService = _HybridServicesClusterService_;
  }

  function initController(hasServicesOverviewRefreshToggle = false) {
    ctrl = $componentController('servicesOverview', {}, {
      hasServicesOverviewRefreshToggle: hasServicesOverviewRefreshToggle,
      urlParams: {
        office365: undefined,
      },
    });
    ctrl.$onInit();
    $scope.$apply();
  }

  describe('$onInit', () => {
    it('should create 4 cloud cards', () => {
      initController();
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.message.title' }).length).toBe(1);
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.meeting.title' }).length).toBe(1);
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.call.title' }).length).toBe(1);
      expect(_.filter(ctrl.getCloudCards(), { name: 'servicesOverview.cards.care.title' }).length).toBe(1);
    });

    it('should create 8 hybrid cards', () => {
      initController();
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.clusterList.title' }).length).toBe(1);
      // 2 Hybrid Calendar cards (sharing the same title) but never displayed at the same time
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridCalendar.title' }).length).toBe(2);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridCall.title' }).length).toBe(1);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridMedia.title' }).length).toBe(1);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridDataSecurity.title' }).length).toBe(1);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridContext.title' }).length).toBe(1);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.privateTrunk.title' }).length).toBe(1);
      expect(_.filter(ctrl.getHybridCards(), { name: 'servicesOverview.cards.hybridImp.title' }).length).toBe(1);
    });

    it('should load the webex site list', () => {
      initController();
      expect(Authinfo.getConferenceServicesWithoutSiteUrl).toHaveBeenCalled();
      expect(Authinfo.getConferenceServicesWithLinkedSiteUrl).toHaveBeenCalled();
    });

    // it('should PropackPromises', () => {});

    it('should leave servicesToDisplay empty', () => {
      expect(ctrl._servicesToDisplay.length).toBe(0);
    });
  });

  describe('$onInit with the feature toggle for the new design', () => {
    it('should load the webex site list', () => {
      initController(true);
      expect(Authinfo.getConferenceServicesWithoutSiteUrl).toHaveBeenCalled();
      expect(Authinfo.getConferenceServicesWithLinkedSiteUrl).toHaveBeenCalled();
    });

    // Below are tests for cards being displayed, and inactive
    it('should have not populate servicesToDisplay if nothing is setup/entitled', () => {
      initController(true);
      expect(ctrl._servicesToDisplay.length).toBe(0);
      expect(ctrl._servicesActive.length).toBe(0);
      expect(ctrl._servicesInactive.length).toBe(0);
    });

    it('should display Hybrid Call if the org is entitled to it', () => {
      isFusionUC.and.returnValue(true);
      initController(true);
      expect(ctrl._servicesToDisplay).toEqual(['squared-fusion-uc']);
      expect(ctrl._servicesInactive).toEqual(['squared-fusion-uc']);
    });

    it('should display Hybrid Calendar Exchange/Office 365 if the org is entitled to it', () => {
      isFusionCal.and.returnValue(true);
      enabledFeatureToggles = [FeatureToggleService.features.atlasOffice365Support];
      initController(true);
      expect(ctrl._servicesToDisplay).toEqual(['squared-fusion-cal', 'squared-fusion-o365']);
      expect(ctrl._servicesInactive).toEqual(['squared-fusion-cal', 'squared-fusion-o365']);
    });

    it('should display Hybrid Calendar Google if the org is entitled to it', () => {
      isFusionGoogleCal.and.returnValue(true);
      initController(true);
      expect(ctrl._servicesToDisplay).toEqual(['squared-fusion-gcal']);
      expect(ctrl._servicesInactive).toEqual(['squared-fusion-gcal']);
    });

    it('should display Hybrid Media if the org is entitled to it and the user is full_admin or readonly_admin', () => {
      isFusionMedia.and.returnValue(true);
      getRoles.and.returnValue(Config.roles.full_admin);
      initController(true);
      expect(ctrl._servicesToDisplay).toEqual(['squared-fusion-media']);
      expect(ctrl._servicesInactive).toEqual(['squared-fusion-media']);

      isFusionMedia.and.returnValue(true);
      getRoles.and.returnValue(Config.roles.readonly_admin);
      initController(true);
      expect(ctrl._servicesToDisplay).toEqual(['squared-fusion-media']);
      expect(ctrl._servicesInactive).toEqual(['squared-fusion-media']);
    });

    it('should display Hybrid Data Security if the org is an Enterprise Customer and the user is full_admin or readonly_admin', () => {
      isEnterpriseCustomer.and.returnValue(true);
      getRoles.and.returnValue(Config.roles.full_admin);
      initController(true);
      expect(ctrl._servicesToDisplay).toEqual(['spark-hybrid-datasecurity']);
      expect(ctrl._servicesInactive).toEqual(['spark-hybrid-datasecurity']);
      // not trying the readonly_admin case to shorten the test
    });

    it('should display Context Center if the org is entitled to it', () => {
      isContactCenterContext.and.returnValue(true);
      initController(true);
      expect(ctrl._servicesToDisplay).toEqual(['contact-center-context']);
      expect(ctrl._servicesInactive).toEqual(['contact-center-context']);
    });

    it('should display EPT if the org is entitled to it and has the feature toggle', () => {
      isSquaredUC.and.returnValue(true);
      enabledFeatureToggles = [FeatureToggleService.features.huronEnterprisePrivateTrunking];
      initController(true);
      expect(ctrl._servicesToDisplay).toEqual(['ept']);
      expect(ctrl._servicesInactive).toEqual(['ept']);
    });

    it('should display Hybrid IMP if the org is entitled to it and has the feature toggle', () => {
      isFusionIMP.and.returnValue(true);
      enabledFeatureToggles = [FeatureToggleService.features.atlasHybridImp];
      initController(true);
      expect(ctrl._servicesToDisplay).toEqual(['spark-hybrid-impinterop']);
      expect(ctrl._servicesInactive).toEqual(['spark-hybrid-impinterop']);
    });

    // Below are tests for enabled/disabled
    it('should consider Hybrid Call active, if the service is setup', () => {
      getStatusForService.and.returnValue($q.resolve({ setup: true }));
      isFusionUC.and.returnValue(true);
      initController(true);
      expect(ctrl._servicesActive).toEqual(['squared-fusion-uc']);
    });

    it('should consider Hybrid Calendar Exchange/Office 365 active, if the service is setup', () => {
      getStatusForService.and.returnValue($q.resolve({ setup: true }));
      getService.and.returnValue($q.resolve({ setup: true }));
      isFusionCal.and.returnValue(true);
      enabledFeatureToggles = [FeatureToggleService.features.atlasOffice365Support];
      initController(true);
      expect(ctrl._servicesActive).toEqual(['squared-fusion-cal', 'squared-fusion-o365']);
    });

    it('should consider Hybrid Calendar Exchange/Office 365 active, if the service is setup', () => {
      getService.and.returnValue($q.resolve({ setup: true }));
      isFusionGoogleCal.and.returnValue(true);
      initController(true);
      expect(ctrl._servicesActive).toEqual(['squared-fusion-gcal']);
    });

    it('should consider Hybrid Media active, if the service is setup', () => {
      getStatusForService.and.returnValue($q.resolve({ setup: true }));
      isFusionMedia.and.returnValue(true);
      getRoles.and.returnValue(Config.roles.full_admin);
      initController(true);
      expect(ctrl._servicesActive).toEqual(['squared-fusion-media']);
    });

    it('should consider Hybrid Data Security active, if the service is setup', () => {
      getStatusForService.and.returnValue($q.resolve({ setup: true }));
      isEnterpriseCustomer.and.returnValue(true);
      getRoles.and.returnValue(Config.roles.full_admin);
      initController(true);
      expect(ctrl._servicesActive).toEqual(['spark-hybrid-datasecurity']);
    });

    it('should consider Hybrid Context Center active, if the service is setup', () => {
      getStatusForService.and.returnValue($q.resolve({ setup: true }));
      isContactCenterContext.and.returnValue(true);
      initController(true);
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
      initController(true);
      expect(ctrl._servicesActive).toEqual(['ept']);
    });

    it('should consider Hybrid IMP active, if the service is setup', () => {
      getStatusForService.and.returnValue($q.resolve({ setup: true }));
      isFusionIMP.and.returnValue(true);
      enabledFeatureToggles = [FeatureToggleService.features.atlasHybridImp];
      initController(true);
      expect(ctrl._servicesActive).toEqual(['spark-hybrid-impinterop']);
    });
  });
});
