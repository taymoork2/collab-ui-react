import moduleName from './hybrid-service-cluster-list.component';

describe('HybridServiceClusterList controller', () => {

  let $componentController, $q, $rootScope, $state, EnterprisePrivateTrunkService, HybridServicesClusterService, ctrl;

  beforeEach(angular.mock.module(moduleName));
  beforeEach(inject(dependencies));
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, _$rootScope_, _$state_, _EnterprisePrivateTrunkService_, _HybridServicesClusterService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $state = _$state_;
    EnterprisePrivateTrunkService = _EnterprisePrivateTrunkService_;
    HybridServicesClusterService = _HybridServicesClusterService_;
  }

  function cleanup() {
    $componentController = $q = $state = ctrl = HybridServicesClusterService = EnterprisePrivateTrunkService = undefined;
  }

  function initController(serviceId, clusterId) {
    return $componentController('hybridServiceClusterList', {}, {
      serviceId: serviceId,
      clusterId: clusterId,
    });
  }

  describe('subscription and polling mechanism', () => {

    beforeEach(function initSpies() {
      spyOn(EnterprisePrivateTrunkService, 'getAllResources');
      spyOn(EnterprisePrivateTrunkService, 'subscribe');
      spyOn(HybridServicesClusterService, 'getResourceGroups').and.returnValue($q.resolve([]));
    });

    it('should call HybridServicesClusterService on init when building the Media Service cluster list', () => {
      ctrl = initController('squared-fusion-media', '1234');
      ctrl.$onInit();
      expect(HybridServicesClusterService.getResourceGroups.calls.count()).toBe(1);
      expect(EnterprisePrivateTrunkService.getAllResources.calls.count()).toBe(0);
      expect(EnterprisePrivateTrunkService.subscribe.calls.count()).toBe(0);
    });

    it('should call HybridServicesClusterService on init when building the Calendar Service cluster list', () => {
      ctrl = initController('squared-fusion-cal', '1234');
      ctrl.$onInit();
      expect(HybridServicesClusterService.getResourceGroups.calls.count()).toBe(1);
      expect(EnterprisePrivateTrunkService.getAllResources.calls.count()).toBe(0);
      expect(EnterprisePrivateTrunkService.subscribe.calls.count()).toBe(0);
    });

    it('should call HybridServicesClusterService on init when building the Call Service cluster list', () => {
      ctrl = initController('squared-fusion-uc', '1234');
      ctrl.$onInit();
      expect(HybridServicesClusterService.getResourceGroups.calls.count()).toBe(1);
      expect(EnterprisePrivateTrunkService.getAllResources.calls.count()).toBe(0);
      expect(EnterprisePrivateTrunkService.subscribe.calls.count()).toBe(0);
    });

    it('should call HybridServicesClusterService on init when building the IM&P Service cluster list', () => {
      ctrl = initController('spark-hybrid-impinterop', '1234');
      ctrl.$onInit();
      expect(HybridServicesClusterService.getResourceGroups.calls.count()).toBe(1);
      expect(EnterprisePrivateTrunkService.getAllResources.calls.count()).toBe(0);
      expect(EnterprisePrivateTrunkService.subscribe.calls.count()).toBe(0);
    });

    it('should call HybridServicesClusterService on init when building the Hybrid Data Security cluster list', () => {
      ctrl = initController('spark-hybrid-datasecurity', '1234');
      ctrl.$onInit();
      expect(HybridServicesClusterService.getResourceGroups.calls.count()).toBe(1);
      expect(EnterprisePrivateTrunkService.getAllResources.calls.count()).toBe(0);
      expect(EnterprisePrivateTrunkService.subscribe.calls.count()).toBe(0);
    });

    it('should call HybridServicesClusterService on init when building the Context Service cluster list', () => {
      ctrl = initController('contact-center-context', '1234');
      ctrl.$onInit();
      expect(HybridServicesClusterService.getResourceGroups.calls.count()).toBe(1);
      expect(EnterprisePrivateTrunkService.getAllResources.calls.count()).toBe(0);
      expect(EnterprisePrivateTrunkService.subscribe.calls.count()).toBe(0);
    });

    it('should call EnterprisePrivateTrunkService on init when building the Private Trunk destination list', () => {
      ctrl = initController('ept', '1234');
      ctrl.$onInit();
      expect(HybridServicesClusterService.getResourceGroups.calls.count()).toBe(0);
      expect(EnterprisePrivateTrunkService.getAllResources.calls.count()).toBe(2);
      expect(EnterprisePrivateTrunkService.subscribe.calls.count()).toBe(1);
    });

  });

  describe('grid options', () => {

    const gridApiMock = {
      selection: {
        on: {
          rowSelectionChanged: function() {},
        },
      },
    };
    const clusterId = '1917';

    beforeEach(function initSpies() {
      spyOn($state, 'go');
    });

    it('should automatically open the Video Mesh cluster sidepanel if a clusterId is provided', () => {
      ctrl = initController('squared-fusion-media', clusterId);
      ctrl.$onInit();
      ctrl.clusterListGridOptions.onRegisterApi(gridApiMock);
      expect($state.go).toHaveBeenCalledWith('media-cluster-details', {
        clusterId: clusterId,
        connectorType: 'mf_mgmt',
      });
    });

    it('should automatically open the the Expressway (calendar) cluster sidepanel if a clusterId is provided', () => {
      ctrl = initController('squared-fusion-cal', clusterId);
      ctrl.$onInit();
      ctrl.clusterListGridOptions.onRegisterApi(gridApiMock);
      expect($state.go).toHaveBeenCalledWith('expressway-cluster-sidepanel', {
        clusterId: clusterId,
        connectorType: 'c_cal',
      });
    });

    it('should automatically open the the Expressway (call) cluster sidepanel if a clusterId is provided', () => {
      ctrl = initController('squared-fusion-uc', clusterId);
      ctrl.$onInit();
      ctrl.clusterListGridOptions.onRegisterApi(gridApiMock);
      expect($state.go).toHaveBeenCalledWith('expressway-cluster-sidepanel', {
        clusterId: clusterId,
        connectorType: 'c_ucmc',
      });
    });

    it('should automatically open the the Expressway (imp) cluster sidepanel if a clusterId is provided', () => {
      ctrl = initController('spark-hybrid-impinterop', clusterId);
      ctrl.$onInit();
      ctrl.clusterListGridOptions.onRegisterApi(gridApiMock);
      expect($state.go).toHaveBeenCalledWith('expressway-cluster-sidepanel', {
        clusterId: clusterId,
        connectorType: 'c_imp',
      });
    });

    it('should automatically open the the Hybrid Data Security cluster sidepanel if a clusterId is provided', () => {
      ctrl = initController('spark-hybrid-datasecurity', clusterId);
      ctrl.$onInit();
      ctrl.clusterListGridOptions.onRegisterApi(gridApiMock);
      expect($state.go).toHaveBeenCalledWith('hds-cluster-details', {
        clusterId: clusterId,
        connectorType: 'hds_app',
      });
    });

    it('should automatically open the the Context cluster sidepanel if a clusterId is provided', () => {
      ctrl = initController('contact-center-context', clusterId);
      ctrl.$onInit();
      ctrl.clusterListGridOptions.onRegisterApi(gridApiMock);
      expect($state.go).toHaveBeenCalledWith('context-cluster-sidepanel', {
        clusterId: clusterId,
        connectorType: 'cs_mgmt',
      });
    });

    it('should automatically open the the SIP Destination sidepanel if a clusterId is provided', () => {
      ctrl = initController('ept', clusterId);
      ctrl.$onInit();
      ctrl.clusterListGridOptions.onRegisterApi(gridApiMock);
      expect($state.go).toHaveBeenCalledWith('private-trunk-sidepanel', {
        clusterId: clusterId,
        connectorType: undefined,
      });
    });

    it('should not automatically open a sidepanel if no clusterId is provided', () => {
      ctrl = initController('squared-fusion-media', undefined);
      ctrl.$onInit();
      ctrl.clusterListGridOptions.onRegisterApi(gridApiMock);
      expect($state.go).not.toHaveBeenCalled();
    });

    xdescribe('interfacing ng-grid', () => {
      it('should add a gridApi to the $scope', () => {
        spyOn(gridApiMock.selection.on, 'rowSelectionChanged');
        ctrl = initController('squared-fusion-media', undefined);
        ctrl.$onInit();
        ctrl.clusterListGridOptions.onRegisterApi(gridApiMock);
        expect(ctrl.gridApi).toBe(gridApiMock);
      });

      it('should provide data and templates', () => {
        ctrl = initController('squared-fusion-media', undefined);
        ctrl.$onInit();
        $rootScope.$digest();
        expect(ctrl.clusterListGridOptions.data).toEqual([]);
        expect(ctrl.clusterListGridOptions.columnDefs[0].cellTemplate).toBe(require('modules/hercules/service-specific-pages/components/cluster-list/cluster-list-display-name.html'));
        expect(ctrl.clusterListGridOptions.columnDefs[1].cellTemplate).toBe(require('modules/hercules/service-specific-pages/components/cluster-list/cluster-list-status.html'));
      });
    });
  });
});

xdescribe('HybridServiceClusterList template', () => {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      '$state',
      '$timeout',
      '$translate',
      'EnterprisePrivateTrunkService',
      'HybridServicesClusterService',
      'HybridServicesClusterStatesService',
      'HybridServicesUtilsService',
    );

    spyOn(this.EnterprisePrivateTrunkService, 'getAllResources');
    spyOn(this.EnterprisePrivateTrunkService, 'subscribe');
    spyOn(this.HybridServicesClusterService, 'getResourceGroups');
    spyOn(this.$state, 'go');

    try {
      this.compileComponent('hybridServiceClusterList', {
        clusterId: undefined,
        serviceId: 'squared-fusion-media',
      });
    } catch (e) {
      /* We need to mock a lot of ng-grid internal stuff to get the controller working
         when we build it with compileComponent(). We are just interested in building the
         template, and thus catch and ignore all errors related to the controller.   */
    }

  });

  afterEach(function () {
    if (this.view) {
      this.view.remove();
    }
  });

  it('should display the cluster list after the component has loaded', function () {
    expect(this.view.find('div.js-hercules-clusters-list').length).toBe(1);
  });

});
