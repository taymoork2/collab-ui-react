'use strict';

describe('Component: clusterCard', function () {
  beforeEach(angular.mock.module('Hercules'));

  describe('Controller', function () {
    var $componentController;
    var controller;
    var mockCluster = {
      id: 1,
      name: 'Sup',
      connectors: [{
        id: 'c_mgmt@0BA28333',
        connectorType: 'c_mgmt',
        hostname: 'achronos-expressway.rd.cisco.com',
        hostSerial: '0BA28333',
      }, {
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

    beforeEach(inject(function ($injector) {
      $componentController = $injector.get('$componentController');
      controller = $componentController('clusterCard', {
        $scope: {},
      }, {
        cluster: mockCluster,
      });
    }));

    it('should bind to the correct cluster', function () {
      expect(controller.cluster.id).toEqual(mockCluster.id);
    });

    describe('getHostnames()', function () {
      it('should find unique hostnames and sort them', function () {
        expect(controller.getHostnames(controller.cluster)).toBe('achronos-expressway.rd.cisco.com');
      });
    });

    describe('countHosts()', function () {
      it('should count unique hostnames', function () {
        expect(controller.countHosts(controller.cluster)).toBe(1);
      });
    });

    describe('hasServices()', function () {
      it('should be true there are one or more connector ', function () {
        expect(controller.hasServices(controller.cluster)).toBe(true);
      });
    });

    describe('upgradesAutomatically()', function () {
      it('should return true for context service', function () {
        ['cs_mgmt'].forEach(function (type) {
          var cluster = { targetType: type };
          expect(controller.upgradesAutomatically(cluster)).toBe(true);
        });
      });

      it('should return false otherwise', function () {
        ['c_mgmt', 'mf_mgmt', 'hds_app'].forEach(function (type) {
          var cluster = { targetType: type };
          expect(controller.upgradesAutomatically(cluster)).toBe(false);
        });
      });
    });

    describe('hideFooter()', function () {
      it('should return true for context service', function () {
        ['cs_mgmt'].forEach(function (type) {
          var cluster = { targetType: type };
          expect(controller.hideFooter(cluster)).toBe(true);
        });
      });

      it('should return false otherwise', function () {
        ['c_mgmt', 'mf_mgmt', 'hds_app'].forEach(function (type) {
          var cluster = { targetType: type };
          expect(controller.hideFooter(cluster)).toBe(false);
        });
      });
    });
  });
});
