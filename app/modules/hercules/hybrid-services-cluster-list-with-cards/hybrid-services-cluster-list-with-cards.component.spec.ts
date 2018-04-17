import clusterListCardModule from './index';

describe('Component: HybridServicesClusterListWithCardsComponent', function () {
  let controller, $componentController, $q, $rootScope, Analytics, Authinfo, EnterprisePrivateTrunkService, HybridServicesClusterService, Notification, ResourceGroupService;

  beforeEach(angular.mock.module(clusterListCardModule));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_$rootScope_, _$componentController_, _$q_, _Analytics_, _Authinfo_, _EnterprisePrivateTrunkService_, _HybridServicesClusterService_, _Notification_, _ResourceGroupService_) {
    $rootScope = _$rootScope_;
    $componentController = _$componentController_;
    $q = _$q_;
    Analytics = _Analytics_;
    Authinfo = _Authinfo_;
    EnterprisePrivateTrunkService = _EnterprisePrivateTrunkService_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    Notification = _Notification_;
    ResourceGroupService = _ResourceGroupService_;
  }

  function initSpies() {
    // spyOn(HybridServicesClusterService, 'getAll');
    spyOn(HybridServicesClusterService, 'getResourceGroups').and.returnValue($q.resolve({
      groups: {},
    }));
    spyOn(EnterprisePrivateTrunkService, 'fetch');
    spyOn(ResourceGroupService, 'getAllowedChannels').and.returnValue($q.resolve(['stable']));
    spyOn(Analytics, 'trackHybridServiceEvent');
    spyOn(Notification, 'errorWithTrackingId');
    spyOn(Authinfo, 'isEntitled').and.returnValue(true);
  }

  function initController(hasEnterprisePrivateTrunkingFeatureToggle) {
    controller = $componentController('hybridServicesClusterListWithCards', {}, {
      hasCucmSupportFeatureToggle: true,
      hasEnterprisePrivateTrunkingFeatureToggle: hasEnterprisePrivateTrunkingFeatureToggle,
    });
    controller.$onInit();
  }

  describe('init', function () {
    beforeEach(function () {
      // HybridServicesClusterService.getAll.and.returnValue($q.resolve());
      initController(false);
    });

    it('should be loading', function () {
      expect(controller.loading).toBe(true);
    });

    it('should have 0 clusters to be displayed', function () {
      expect(controller.displayedGroups).toEqual([]);
    });
  });

  describe('after loading clusters', function () {
    it('should call Notification.errorWithTrackingId if loading failed', function () {
      HybridServicesClusterService.getResourceGroups.and.returnValue($q.reject());
      initController(false);
      expect(controller.loading).toBe(true);
      expect(Notification.errorWithTrackingId).not.toHaveBeenCalled();
      $rootScope.$apply(); // force HybridServicesClusterService.getAll() to return
      expect(controller.loading).toBe(false);
      expect(Notification.errorWithTrackingId).toHaveBeenCalled();
    });

    it('should update filters and displayed clusters', function () {
      HybridServicesClusterService.getResourceGroups.and.returnValue($q.resolve({ unassigned: [{
        name: 'asdf',
        targetType: 'c_mgmt',
        connectors: [{
          alarms: [],
          connectorType: 'c_mgmt',
          state: 'running',
          hostname: 'a.elg.no',
        }],
      }, {
        name: 'asdf',
        targetType: 'mf_mgmt',
        connectors: [{
          alarms: [],
          connectorType: 'mf_mgmt',
          state: 'running',
          hostname: 'a.elg.no',
        }],
      }, {
        name: 'asdf',
        targetType: 'cs_mgmt',
        connectors: [{
          alarms: [],
          connectorType: 'cs_mgmt',
          state: 'running',
          hostname: 'a.elg.no',
        }],
      }, {
        name: 'asdf',
        targetType: 'ucm_mgmt',
        connectors: [{
          alarms: [],
          connectorType: 'ucm_mgmt',
          state: 'running',
          hostname: 'a.elg.no',
        }],
      }] }));
      initController(false);
      expect(controller.filters[0].count).toBe(0);
      expect(controller.filters[1].count).toBe(0);
      expect(controller.filters[2].count).toBe(0);
      expect(controller.filters[3].count).toBe(0);
      expect(controller.filters[4].count).toBe(0);
      expect(controller.displayedGroups.length).toBe(0);
      $rootScope.$apply(); // force HybridServicesClusterService.getAll() to return

      expect(controller.filters[0].count).toBe(1);
      expect(controller.filters[1].count).toBe(1);
      expect(controller.filters[2].count).toBe(0);
      expect(controller.filters[3].count).toBe(1);
      expect(controller.filters[4].count).toBe(1);
      expect(controller.displayedGroups.length).toBe(6);
    });
  });

  describe('Private Trunking', function () {
    beforeEach(function () {
      EnterprisePrivateTrunkService.fetch.and.returnValue($q.resolve([
        {
          uuid: 'b01dface',
          name: 'To fulle menn',
          status: {
            state: 'unknown',
          },
        },
        {
          uuid: 'f005ba11',
          name: 'Aldri stol på en fyllik',
          status: {
            state: 'outage',
          },
        },
        {
          uuid: 'deadbea7',
          name: 'Skinnet bedrar',
          status: {
            state: 'operational',
          },
        },
        {
          uuid: 'ba5eba11',
          name: 'Ingen har skylda',
          status: {
            state: 'impaired',
          },
        },
      ]));
    });

    it('should format data from EnterprisePrivateTrunkService so that it is on the FMS cluster format', function () {
      initController(true);
      controller.loadSipDestinations();
      $rootScope.$apply();
      expect(controller.displayedGroups[5].unassigned).toEqual(jasmine.objectContaining([
        {
          name: 'To fulle menn',
          id: 'b01dface',
          targetType: 'ept',
          extendedProperties: {
            servicesStatuses: [
              {
                serviceId: 'ept',
                state: {
                  cssClass: 'warning',
                  name: 'unknown',
                },
                total: 1,
              },
            ],
          },
        },
        {
          name: 'Aldri stol på en fyllik',
          id: 'f005ba11',
          targetType: 'ept',
          extendedProperties: {
            servicesStatuses: [
              {
                serviceId: 'ept',
                state: {
                  cssClass: 'danger',
                  name: 'outage',
                },
                total: 1,
              },
            ],
          },
        },
        {
          name: 'Skinnet bedrar',
          id: 'deadbea7',
          targetType: 'ept',
          extendedProperties: {
            servicesStatuses: [
              {
                serviceId: 'ept',
                state: {
                  cssClass: 'success',
                  name: 'operational',
                },
                total: 1,
              },
            ],
          },
        },
        {
          name: 'Ingen har skylda',
          id: 'ba5eba11',
          targetType: 'ept',
          extendedProperties: {
            servicesStatuses: [
              {
                serviceId: 'ept',
                state: {
                  cssClass: 'warning',
                  name: 'impaired',
                },
                total: 1,
              },
            ],
          },
        },
      ]));
    });

    it('should not get private trunk data if you are not feature toggled', function () {
      initController(false);
      controller.loadSipDestinations();
      $rootScope.$apply();
      expect(EnterprisePrivateTrunkService.fetch).not.toHaveBeenCalled();
    });
  });
});
