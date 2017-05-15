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
          let cluster = { targetType: type };
          expect(this.controller.upgradesAutomatically(cluster)).toBe(true);
        });
      });

      it('should return false otherwise', function () {
        ['c_mgmt', 'mf_mgmt', 'hds_app', 'ucm_mgmt'].forEach((type) => {
          let cluster = { targetType: type };
          expect(this.controller.upgradesAutomatically(cluster)).toBe(false);
        });
      });
    });

    describe('hideFooter()', function () {
      it('should return true for context service', function () {
        ['cs_mgmt'].forEach((type) => {
          let cluster = { targetType: type };
          expect(this.controller.hideFooter(cluster)).toBe(true);
        });
      });

      it('should return false otherwise', function () {
        ['c_mgmt', 'mf_mgmt', 'hds_app', 'ucm_mgmt'].forEach((type) => {
          let cluster = { targetType: type };
          expect(this.controller.hideFooter(cluster)).toBe(false);
        });
      });
    });
  });
});
