describe('HybridServiceClusterList', () => {

  let $componentController, ctrl;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  afterEach(cleanup);

  function dependencies (_$componentController_) {
    $componentController = _$componentController_;
  }

  function cleanup() {
    $componentController = ctrl = undefined;
  }

  function initController() {
    return $componentController('hybridServiceClusterList');
  }

  describe('calculateMaintenanceModeLabel', () => {

    it('should enable the label when there is exactly one cluster, and exactly one node that is in maintenance mode', () => {
      const clusterList = [{
        connectors: [{
          connectorStatus: {
            maintenanceMode: 'on',
          },
        }, {
          connectorStatus: {
            maintenanceMode: 'off',
          },
        }],
        targetType: 'mf_mgmt',
      }];
      ctrl = initController();
      const processedList = ctrl.calculateMaintenanceModeLabel(clusterList);

      expect(processedList[0].maintenanceModeLabel).toBe('on');
    });

    it('should *not* enable the label when there is exactly one cluster, and zero nodes that are in maintenance mode', () => {
      const clusterList = [{
        connectors: [{
          connectorStatus: {
            maintenanceMode: 'off',
          },
        }, {
          connectorStatus: {
            maintenanceMode: 'off',
          },
        }],
        targetType: 'mf_mgmt',
      }];
      ctrl = initController();
      const processedList = ctrl.calculateMaintenanceModeLabel(clusterList);

      expect(processedList[0].maintenanceModeLabel).toBe('off');
    });

    it('should enable the label for the cluster which has a node in maintenance mode, but not for the cluster that does not', () => {
      const clusterList = [{
        connectors: [{
          connectorStatus: {
            maintenanceMode: 'off',
          },
        }, {
          connectorStatus: {
            maintenanceMode: 'off',
          },
        }],
        targetType: 'mf_mgmt',
      }, {
        connectors: [{
          connectorStatus: {
            maintenanceMode: 'on',
          },
        }, {
          connectorStatus: {
            maintenanceMode: 'off',
          },
        }],
        targetType: 'mf_mgmt',
      }];
      ctrl = initController();
      const processedList = ctrl.calculateMaintenanceModeLabel(clusterList);

      expect(processedList[0].maintenanceModeLabel).toBe('off');
      expect(processedList[1].maintenanceModeLabel).toBe('on');
    });

    it('should let "pending" win over "on" in case the nodes do not agree', () => {
      const clusterList = [{
        connectors: [{
          connectorStatus: {
            maintenanceMode: 'pending',
          },
        }, {
          connectorStatus: {
            maintenanceMode: 'on',
          },
        }],
        targetType: 'mf_mgmt',
      }];
      ctrl = initController();
      const processedList = ctrl.calculateMaintenanceModeLabel(clusterList);

      expect(processedList[0].maintenanceModeLabel).toBe('pending');
    });

  });

});
