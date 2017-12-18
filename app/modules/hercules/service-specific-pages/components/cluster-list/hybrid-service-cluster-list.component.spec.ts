import hybridServiceClusterList from './hybrid-service-cluster-list.component';

describe('HybridServiceClusterList controller', () => {

  let $componentController, $state, ClusterService, EnterprisePrivateTrunkService, ctrl;

  beforeEach(angular.mock.module(hybridServiceClusterList));
  beforeEach(inject(dependencies));
  afterEach(cleanup);

  function dependencies (_$componentController_, _$state_, _ClusterService_, _EnterprisePrivateTrunkService_) {
    $componentController = _$componentController_;
    $state = _$state_;
    ClusterService = _ClusterService_;
    EnterprisePrivateTrunkService = _EnterprisePrivateTrunkService_;
  }

  function cleanup() {
    $componentController = $state = ctrl = ClusterService = EnterprisePrivateTrunkService = undefined;
  }

  function initController(serviceId, clusterId) {
    return $componentController('hybridServiceClusterList', {}, {
      serviceId: serviceId,
      clusterId: clusterId,
    });
  }

  // TODO: Move those tests to HybridServicesClusterService
  // describe('_calculateMaintenanceModeLabel', () => {

  //   it('should enable the label when there is exactly one cluster, and exactly one node that is in maintenance mode', () => {
  //     const clusterList = [{
  //       connectors: [{
  //         connectorStatus: {
  //           maintenanceMode: 'on',
  //         },
  //       }, {
  //         connectorStatus: {
  //           maintenanceMode: 'off',
  //         },
  //       }],
  //       targetType: 'mf_mgmt',
  //     }];
  //     ctrl = initController('squared-fusion-media', '1234');
  //     const processedList = ctrl._calculateMaintenanceModeLabel(clusterList);

  //     expect(processedList[0].maintenanceModeLabel).toBe('on');
  //   });

  //   it('should *not* enable the label when there is exactly one cluster, and zero nodes that are in maintenance mode', () => {
  //     const clusterList = [{
  //       connectors: [{
  //         connectorStatus: {
  //           maintenanceMode: 'off',
  //         },
  //       }, {
  //         connectorStatus: {
  //           maintenanceMode: 'off',
  //         },
  //       }],
  //       targetType: 'mf_mgmt',
  //     }];
  //     ctrl = initController('squared-fusion-media', '1234');
  //     const processedList = ctrl._calculateMaintenanceModeLabel(clusterList);

  //     expect(processedList[0].maintenanceModeLabel).toBe('off');
  //   });

  //   it('should enable the label for the cluster which has a node in maintenance mode, but not for the cluster that does not', () => {
  //     const clusterList = [{
  //       connectors: [{
  //         connectorStatus: {
  //           maintenanceMode: 'off',
  //         },
  //       }, {
  //         connectorStatus: {
  //           maintenanceMode: 'off',
  //         },
  //       }],
  //       targetType: 'mf_mgmt',
  //     }, {
  //       connectors: [{
  //         connectorStatus: {
  //           maintenanceMode: 'on',
  //         },
  //       }, {
  //         connectorStatus: {
  //           maintenanceMode: 'off',
  //         },
  //       }],
  //       targetType: 'mf_mgmt',
  //     }];
  //     ctrl = initController('squared-fusion-media', '1234');
  //     const processedList = ctrl._calculateMaintenanceModeLabel(clusterList);

  //     expect(processedList[0].maintenanceModeLabel).toBe('off');
  //     expect(processedList[1].maintenanceModeLabel).toBe('on');
  //   });

  //   it('should let "pending" win over "on" in case the nodes do not agree', () => {
  //     const clusterList = [{
  //       connectors: [{
  //         connectorStatus: {
  //           maintenanceMode: 'pending',
  //         },
  //       }, {
  //         connectorStatus: {
  //           maintenanceMode: 'on',
  //         },
  //       }],
  //       targetType: 'mf_mgmt',
  //     }];
  //     ctrl = initController('squared-fusion-media', '1234');
  //     const processedList = ctrl._calculateMaintenanceModeLabel(clusterList);

  //     expect(processedList[0].maintenanceModeLabel).toBe('pending');
  //   });

  // });

  describe('subscription and polling mechanism', () => {

    beforeEach(function initSpies() {
      spyOn(EnterprisePrivateTrunkService, 'getAllResources');
      spyOn(EnterprisePrivateTrunkService, 'subscribe');
      spyOn(ClusterService, 'getClustersByConnectorType');
      spyOn(ClusterService, 'subscribe');
    });

    it('should call ClusterService on init when building the Media Service cluster list', () => {
      ctrl = initController('squared-fusion-media', '1234');
      ctrl.$onInit();
      expect(ClusterService.getClustersByConnectorType.calls.count()).toBe(2);
      expect(ClusterService.subscribe.calls.count()).toBe(1);
      expect(EnterprisePrivateTrunkService.getAllResources.calls.count()).toBe(0);
      expect(EnterprisePrivateTrunkService.subscribe.calls.count()).toBe(0);
    });

    it('should call ClusterService on init when building the Calendar Service cluster list', () => {
      ctrl = initController('squared-fusion-cal', '1234');
      ctrl.$onInit();
      expect(ClusterService.getClustersByConnectorType.calls.count()).toBe(2);
      expect(ClusterService.subscribe.calls.count()).toBe(1);
      expect(EnterprisePrivateTrunkService.getAllResources.calls.count()).toBe(0);
      expect(EnterprisePrivateTrunkService.subscribe.calls.count()).toBe(0);
    });

    it('should call ClusterService on init when building the Call Service cluster list', () => {
      ctrl = initController('squared-fusion-uc', '1234');
      ctrl.$onInit();
      expect(ClusterService.getClustersByConnectorType.calls.count()).toBe(2);
      expect(ClusterService.subscribe.calls.count()).toBe(1);
      expect(EnterprisePrivateTrunkService.getAllResources.calls.count()).toBe(0);
      expect(EnterprisePrivateTrunkService.subscribe.calls.count()).toBe(0);
    });

    it('should call ClusterService on init when building the IM&P Service cluster list', () => {
      ctrl = initController('spark-hybrid-impinterop', '1234');
      ctrl.$onInit();
      expect(ClusterService.getClustersByConnectorType.calls.count()).toBe(2);
      expect(ClusterService.subscribe.calls.count()).toBe(1);
      expect(EnterprisePrivateTrunkService.getAllResources.calls.count()).toBe(0);
      expect(EnterprisePrivateTrunkService.subscribe.calls.count()).toBe(0);
    });

    it('should call ClusterService on init when building the Hybrid Data Security cluster list', () => {
      ctrl = initController('spark-hybrid-datasecurity', '1234');
      ctrl.$onInit();
      expect(ClusterService.getClustersByConnectorType.calls.count()).toBe(2);
      expect(ClusterService.subscribe.calls.count()).toBe(1);
      expect(EnterprisePrivateTrunkService.getAllResources.calls.count()).toBe(0);
      expect(EnterprisePrivateTrunkService.subscribe.calls.count()).toBe(0);
    });

    it('should call ClusterService on init when building the Context Service cluster list', () => {
      ctrl = initController('contact-center-context', '1234');
      ctrl.$onInit();
      expect(ClusterService.getClustersByConnectorType.calls.count()).toBe(2);
      expect(ClusterService.subscribe.calls.count()).toBe(1);
      expect(EnterprisePrivateTrunkService.getAllResources.calls.count()).toBe(0);
      expect(EnterprisePrivateTrunkService.subscribe.calls.count()).toBe(0);
    });

    it('should call EnterprisePrivateTrunkService on init when building the Private Trunk destination list', () => {
      ctrl = initController('ept', '1234');
      ctrl.$onInit();
      expect(ClusterService.getClustersByConnectorType.calls.count()).toBe(0);
      expect(ClusterService.subscribe.calls.count()).toBe(0);
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

    it('should automatically open the Hybrid Media cluster sidepanel if a clusterId is provided', () => {
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

    describe('interfacing ng-grid', () => {
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
        expect(ctrl.clusterListGridOptions.data).toEqual([]);
        expect(ctrl.clusterListGridOptions.columnDefs[0].cellTemplate).toBe(require('modules/hercules/service-specific-pages/components/cluster-list/cluster-list-display-name.html'));
        expect(ctrl.clusterListGridOptions.columnDefs[1].cellTemplate).toBe(require('modules/hercules/service-specific-pages/components/cluster-list/cluster-list-status.html'));
      });
    });
  });
});

describe('HybridServiceClusterList template', () => {
  beforeEach(function () {
    this.initModules(hybridServiceClusterList);
    this.injectDependencies(
      'EnterprisePrivateTrunkService',
      'ClusterService',
      '$state',
    );

    spyOn(this.EnterprisePrivateTrunkService, 'getAllResources');
    spyOn(this.EnterprisePrivateTrunkService, 'subscribe');
    spyOn(this.ClusterService, 'getClustersByConnectorType');
    spyOn(this.ClusterService, 'subscribe');
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
    expect(this.view.find('div.hercules-clusters-list').length).toBe(1);
  });

});
