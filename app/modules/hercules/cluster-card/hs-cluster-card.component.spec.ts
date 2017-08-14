import hsClusterCardModule from './index';

describe('Component: hsClusterCard', function () {
  beforeEach(function () {
    this.initModules(hsClusterCardModule);
    this.injectDependencies(
      '$q',
      '$scope',
      'FeatureToggleService',
    );
    this.$scope.clusterMock = {
      id: 1,
      name: 'Sup',
      connectors: [{
        alarms: [],
        id: 'c_mgmt@0BA28333',
        connectorType: 'c_mgmt',
        hostname: 'achronos-expressway.rd.cisco.com',
        hostSerial: '0BA28333',
      }, {
        alarms: [],
        id: 'c_cal@0BA28333',
        connectorType: 'c_cal',
        hostname: 'achronos-expressway.rd.cisco.com',
        hostSerial: '0BA28333',
      }],
      targetType: 'c_mgmt',
      extendedProperties: {
        servicesStatuses: [{
          serviceId: 'squared-fusion-mgmt',
          state: {
            name: 'offline',
            severity: 3,
            label: 'error',
          },
          total: 1,
        }, {
          serviceId: 'squared-fusion-uc',
          state: {
            name: 'not_installed',
            severity: 1,
            label: 'unknown',
          },
          total: 0,
        }, {
          serviceId: 'squared-fusion-cal',
          state: {
            name: 'offline',
            severity: 3,
            label: 'error',
          },
          total: 1,
        }],
      },
    };
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
    this.compileComponent('hsClusterCard', { cluster: 'clusterMock' });
  });

  describe('Controller', function () {
    it('should bind to the correct cluster', function () {
      expect(this.controller.cluster.id).toEqual(this.$scope.clusterMock.id);
    });

    describe('getHostnames()', function () {
      it('should find unique hostnames and sort them', function () {
        expect(this.controller.getHostnames(this.controller.cluster)).toBe('achronos-expressway.rd.cisco.com');
      });
    });

    describe('countHosts()', function () {
      it('should count unique hostnames', function () {
        expect(this.controller.countHosts(this.controller.cluster)).toBe(1);
      });
    });

    describe('hasServices()', function () {
      it('should be true there are one or more connector ', function () {
        expect(this.controller.hasServices(this.controller.cluster)).toBe(true);
      });
    });

    describe('upgradesAutomatically()', function () {
      it('should return true for context service', function () {
        ['cs_mgmt'].forEach((type) => {
          const cluster = { targetType: type };
          expect(this.controller.upgradesAutomatically(cluster)).toBe(true);
        });
      });

      it('should return false otherwise', function () {
        ['c_mgmt', 'mf_mgmt', 'hds_app', 'ucm_mgmt'].forEach((type) => {
          const cluster = { targetType: type };
          expect(this.controller.upgradesAutomatically(cluster)).toBe(false);
        });
      });
    });

    describe('hideFooter()', function () {
      it('should return true for context service', function () {
        ['cs_mgmt'].forEach((type) => {
          const cluster = { targetType: type };
          expect(this.controller.hideFooter(cluster)).toBe(true);
        });
      });

      it('should return false otherwise', function () {
        ['c_mgmt', 'mf_mgmt', 'hds_app', 'ucm_mgmt'].forEach((type) => {
          const cluster = { targetType: type };
          expect(this.controller.hideFooter(cluster)).toBe(false);
        });
      });
    });
  });

  // ControllerHdsCluster is covering tests for HDS cluster types
  describe('ControllerHdsCluster', function () {
    let $componentController;
    let controllerHdsCluster, $state;

    const mockHDSCluster = {
      id: 2,
      name: 'IntegrationCluster',
      connectors: [{
        id: 'hds_app@2e2dc646db1e4369a40e013e05e6d092',
        connectorType: 'hds_app',
        hostname: 'hds-test1.cisco.com',
        hostSerial: '2e2dc646db1e4',
      }],
      targetType: 'hds_app',
      extendedProperties: {
        servicesStatuses: [{
          serviceId: 'spark-hybrid-datasecurity',
          state: {
            name: 'running',
            severity: 1,
            label: 'unknown',
          },
          total: 1,
        }],
      },
    };

    beforeEach(inject(function ($injector) {
      $componentController = $injector.get('$componentController');
      $state = $injector.get('$state');
      controllerHdsCluster = $componentController('hsClusterCard', {
        $scope: {},
      }, {
        cluster: mockHDSCluster,
      });
    }));

    it('should bind to the correct cluster type', function () {
      expect(controllerHdsCluster.cluster.targetType).toEqual(mockHDSCluster.targetType);
    });

    it('should hide footer', function () {
      expect(controllerHdsCluster.hideFooter(controllerHdsCluster.cluster)).toBe(false);
    });

    it('should have services', function () {
      expect(controllerHdsCluster.hasServices(controllerHdsCluster.cluster)).toBe(true);
    });

    it('clicking on settings should change state to hds-cluster.settings', function () {
      spyOn($state, 'go');
      controllerHdsCluster.openSettings(controllerHdsCluster.cluster.targetType,
                                        controllerHdsCluster.cluster.id);
      expect($state.go).toHaveBeenCalledWith('hds-cluster.settings',
                                             { id: controllerHdsCluster.cluster.id });
    });

    it('clicking on service name should change state to hds-cluster.list', function () {
      spyOn($state, 'go');
      controllerHdsCluster.openSettings(controllerHdsCluster.cluster.targetType,
                                        controllerHdsCluster.cluster.id);
      expect($state.go).toHaveBeenCalledWith('hds-cluster.settings', { id: 2 });
    });


  });

});
