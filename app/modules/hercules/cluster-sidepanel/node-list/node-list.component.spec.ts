import { NodeListComponentCtrl } from 'modules/hercules/cluster-sidepanel/node-list/node-list.component';

describe('Component: hybridServicesNodeList', () => {
  let $componentController, $q: ng.IQService, $rootScope: ng.IRootScopeService, HybridServicesClusterService;
  let controller: NodeListComponentCtrl;

  beforeEach(angular.mock.module('Hercules'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_$componentController_, _$q_, _$rootScope_, _HybridServicesClusterService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    HybridServicesClusterService = _HybridServicesClusterService_;
  }

  function initSpies() {
    spyOn(HybridServicesClusterService, 'get').and.returnValue($q.resolve({}));
  }

  function initController(bindings = {}) {
    controller = $componentController('hybridServicesNodeList', { $scope: {} }, bindings);
    controller.$onInit();
  }

  describe('buildSidepanelConnectorList()', function () {
    it('should format a cluster object so that it is suitable for the sidepanel', function () {
      const incomingCluster = {
        url: '',
        id: '1107700c-2eeb-11e6-8ebd-005056b10bf7',
        name: 'fms-quadruple.rd.cisco.com',
        extendedProperties: {
          isEmpty: false,
          servicesStatuses: [{
            serviceId: 'squared-fusion-mgmt',
            state: {
              name: 'operational',
              cssClass: 'success',
            },
            total: 4,
          }, {
            serviceId: 'squared-fusion-uc',
            state: {
              name: 'operational',
              cssClass: 'success',
            },
            total: 4,
          }, {
            serviceId: 'squared-fusion-cal',
            state: {
              name: 'operational',
              cssClass: 'success',
            },
            total: 4,
          }],
        },
        upgradeSchedule: {
          scheduleDays: ['wednesday'],
          scheduleTime: '05:00',
          scheduleTimeZone: 'Pacific/Tahiti',
          nextUpgradeWindow: {
            startTime: '2016-06-29T15:00:57.332Z',
            endTime: '2016-06-29T16:00:57.332Z',
          },
          moratoria: [{
            timeWindow: {
              startTime: '2016-06-29T15:00:35Z',
              endTime: '2016-06-29T16:00:35Z',
            },
            id: 'deadbeef',
            url: '',
          }],
          urgentScheduleTime: '00:00',
          url: '',
        },
        upgradeScheduleUrl: '',
        connectors: [{
          url: '',
          id: 'c_cal@0D10F849',
          clusterId: '1',
          clusterUrl: '1',
          connectorType: 'c_cal',
          extendedProperties: {
            alarms: 'none',
            alarmsBadgeCss: '',
            state: {
              name: 'running',
              label: 'ok',
              cssClass: 'success',
              severity: 0,
            },
          },
          upgradeState: 'upgraded',
          state: 'running',
          hostname: 'fms-quadruple03.rd.cisco.com',
          hostSerial: '0D10F849',
          alarms: [],
          runningVersion: '8.7-1.0.2994',
          createdAt: '',
          maintenanceMode: 'on',
          hostUrl: '',
        }, {
          url: '',
          id: 'c_cal@07A00089',
          clusterId: '1',
          clusterUrl: '1',
          connectorType: 'c_cal',
          extendedProperties: {
            alarms: 'none',
            alarmsBadgeCss: '',
            state: {
              name: 'running',
              label: 'ok',
              cssClass: 'success',
              severity: 0,
            },
          },
          upgradeState: 'upgraded',
          state: 'running',
          hostname: 'fms-quadruple02.rd.cisco.com',
          hostSerial: '07A00089',
          alarms: [],
          runningVersion: '8.7-1.0.2994',
          createdAt: '',
          maintenanceMode: 'on',
          hostUrl: '',
        }, {
          url: '',
          id: 'c_ucmc@0379F08E',
          clusterId: '1',
          clusterUrl: '1',
          connectorType: 'c_ucmc',
          extendedProperties: {
            alarms: 'none',
            alarmsBadgeCss: '',
            state: {
              name: 'running',
              label: 'ok',
              cssClass: 'success',
              severity: 0,
            },
          },
          upgradeState: 'upgraded',
          state: 'running',
          hostname: 'fms-quadruple04.rd.cisco.com',
          hostSerial: '0379F08E',
          alarms: [],
          runningVersion: '8.7-1.0.2094',
          createdAt: '',
          maintenanceMode: 'on',
          hostUrl: '',
        }, {
          url: '',
          id: 'c_mgmt@07A00089',
          clusterId: '1',
          clusterUrl: '1',
          connectorType: 'c_mgmt',
          extendedProperties: {
            alarms: 'none',
            alarmsBadgeCss: '',
            state: {
              name: 'running',
              label: 'ok',
              cssClass: 'success',
              severity: 0,
            },
          },
          upgradeState: 'upgraded',
          state: 'running',
          hostname: 'fms-quadruple02.rd.cisco.com',
          hostSerial: '07A00089',
          alarms: [],
          runningVersion: '8.7-1.0.321154',
          createdAt: '',
          maintenanceMode: 'on',
          hostUrl: '',
        }, {
          url: '',
          id: 'c_cal@0379F08E',
          clusterId: '1',
          clusterUrl: '1',
          connectorType: 'c_cal',
          extendedProperties: {
            alarms: 'none',
            alarmsBadgeCss: '',
            state: {
              name: 'running',
              label: 'ok',
              cssClass: 'success',
              severity: 0,
            },
          },
          upgradeState: 'upgraded',
          state: 'running',
          hostname: 'fms-quadruple04.rd.cisco.com',
          hostSerial: '0379F08E',
          alarms: [],
          runningVersion: '8.7-1.0.2994',
          createdAt: '',
          maintenanceMode: 'on',
          hostUrl: '',
        }, {
          url: '',
          id: 'c_mgmt@0D09EDC5',
          clusterId: '1',
          clusterUrl: '1',
          connectorType: 'c_mgmt',
          extendedProperties: {
            alarms: 'none',
            alarmsBadgeCss: '',
            state: {
              name: 'running',
              label: 'ok',
              cssClass: 'success',
              severity: 0,
            },
          },
          upgradeState: 'upgraded',
          state: 'running',
          hostname: 'fms-quadruple01.rd.cisco.com',
          hostSerial: '0D09EDC5',
          alarms: [],
          runningVersion: '8.7-1.0.321154',
          createdAt: '',
          maintenanceMode: 'on',
          hostUrl: '',
        }, {
          url: '',
          id: 'c_mgmt@0D10F849',
          clusterId: '1',
          clusterUrl: '1',
          connectorType: 'c_mgmt',
          extendedProperties: {
            alarms: 'none',
            alarmsBadgeCss: '',
            state: {
              name: 'running',
              label: 'ok',
              cssClass: 'success',
              severity: 0,
            },
          },
          upgradeState: 'upgraded',
          state: 'running',
          hostname: 'fms-quadruple03.rd.cisco.com',
          hostSerial: '0D10F849',
          alarms: [],
          runningVersion: '8.7-1.0.321154',
          createdAt: '',
          maintenanceMode: 'on',
          hostUrl: '',
        }, {
          url: '',
          id: 'c_ucmc@0D09EDC5',
          clusterId: '1',
          clusterUrl: '1',
          connectorType: 'c_ucmc',
          extendedProperties: {
            alarms: 'none',
            alarmsBadgeCss: '',
            state: {
              name: 'running',
              label: 'ok',
              cssClass: 'success',
              severity: 0,
            },
          },
          upgradeState: 'upgraded',
          state: 'running',
          hostname: 'fms-quadruple01.rd.cisco.com',
          hostSerial: '0D09EDC5',
          alarms: [],
          runningVersion: '8.7-1.0.2094',
          createdAt: '',
          maintenanceMode: 'on',
          hostUrl: '',
        }, {
          url: '',
          id: 'c_cal@0D09EDC5',
          clusterId: '1',
          clusterUrl: '1',
          connectorType: 'c_cal',
          extendedProperties: {
            alarms: 'none',
            alarmsBadgeCss: '',
            state: {
              name: 'running',
              label: 'ok',
              cssClass: 'success',
              severity: 0,
            },
          },
          upgradeState: 'upgraded',
          state: 'running',
          hostname: 'fms-quadruple01.rd.cisco.com',
          hostSerial: '0D09EDC5',
          alarms: [],
          runningVersion: '8.7-1.0.2994',
          createdAt: '',
          maintenanceMode: 'on',
          hostUrl: '',
        }, {
          url: '',
          id: 'c_ucmc@0D10F849',
          clusterId: '1',
          clusterUrl: '1',
          connectorType: 'c_ucmc',
          extendedProperties: {
            alarms: 'none',
            alarmsBadgeCss: '',
            state: {
              name: 'running',
              label: 'ok',
              cssClass: 'success',
              severity: 0,
            },
          },
          upgradeState: 'upgraded',
          state: 'running',
          hostname: 'fms-quadruple03.rd.cisco.com',
          hostSerial: '0D10F849',
          alarms: [],
          runningVersion: '8.7-1.0.2094',
          createdAt: '',
          maintenanceMode: 'on',
          hostUrl: '',
        }, {
          url: '',
          id: 'c_ucmc@07A00089',
          clusterId: '1',
          clusterUrl: '1',
          connectorType: 'c_ucmc',
          extendedProperties: {
            alarms: 'none',
            alarmsBadgeCss: '',
            state: {
              name: 'running',
              label: 'ok',
              cssClass: 'success',
              severity: 0,
            },
          },
          upgradeState: 'upgraded',
          state: 'running',
          hostname: 'fms-quadruple02.rd.cisco.com',
          hostSerial: '07A00089',
          alarms: [],
          runningVersion: '8.7-1.0.2094',
          createdAt: '',
          maintenanceMode: 'on',
          hostUrl: '',
        }, {
          url: '',
          id: 'c_mgmt@0379F08E',
          clusterId: '1',
          clusterUrl: '1',
          connectorType: 'c_mgmt',
          extendedProperties: {
            alarms: 'none',
            alarmsBadgeCss: '',
            state: {
              name: 'running',
              label: 'ok',
              cssClass: 'success',
              severity: 0,
            },
          },
          upgradeState: 'upgraded',
          state: 'running',
          hostname: 'fms-quadruple04.rd.cisco.com',
          hostSerial: '0379F08E',
          alarms: [],
          runningVersion: '8.7-1.0.321154',
          createdAt: '',
          maintenanceMode: 'on',
          hostUrl: '',
        }],
        releaseChannel: 'GA',
        provisioning: [{
          url: '',
          connectorType: 'c_ucmc',
          provisionedVersion: '8.7-1.0.2094',
          availablePackageIsUrgent: false,
          availableVersion: '8.7-1.0.2094',
          packageUrl: '',
        }, {
          url: '',
          connectorType: 'c_cal',
          provisionedVersion: '8.7-1.0.2994',
          availablePackageIsUrgent: false,
          availableVersion: '8.7-1.0.2994',
          packageUrl: '',
        }, {
          url: '',
          connectorType: 'c_mgmt',
          provisionedVersion: '8.7-1.0.321154',
          availablePackageIsUrgent: false,
          availableVersion: '8.7-1.0.321154',
          packageUrl: '',
        }],
        targetType: 'c_mgmt',
      };
      HybridServicesClusterService.get.and.returnValue($q.resolve(incomingCluster));
      initController({
        cluster: {
          id: '1',
        },
        connectorType: 'c_cal',
      });
      $rootScope.$apply();
      expect(controller.hosts.length).toBe(4);
      expect(controller.hosts[0].connectors[0].connectorType).not.toBe('c_ucmc');
      expect(controller.hosts[0].connectors.length).toBe(2);
      expect(controller.hosts[1].connectors.length).toBe(2);
      expect(controller.hosts[0].connectors[0].state).toBe('running');
      expect(controller.hosts[0].connectors[0].hostSerial).toBe(controller.hosts[0].connectors[1].hostSerial);
    });

    it('should format a cluster object with hds_app connector suitable for the sidepanel', function () {
      const incomingCluster = {
        url: '',
        id: '1107700c-2eeb-11e6-8ebd-005056b10bf7',
        name: 'fms-quadruple.rd.cisco.com',
        extendedProperties: {
          isEmpty: false,
          servicesStatuses: [],
        },
        upgradeSchedule: {
          scheduleDays: ['wednesday'],
          scheduleTime: '05:00',
          scheduleTimeZone: 'Pacific/Tahiti',
          nextUpgradeWindow: {
            startTime: '2016-06-29T15:00:57.332Z',
            endTime: '2016-06-29T16:00:57.332Z',
          },
          moratoria: [{
            timeWindow: {
              startTime: '2016-06-29T15:00:35Z',
              endTime: '2016-06-29T16:00:35Z',
            },
            id: 'deadbeef',
            url: '',
          }],
          urgentScheduleTime: '00:00',
          url: '',
        },
        upgradeScheduleUrl: '',
        connectors: [{
          url: '',
          id: 'hds_app@0379F08E',
          clusterId: '1',
          clusterUrl: '1',
          connectorType: 'hds_app',
          extendedProperties: {
            alarms: 'none',
            alarmsBadgeCss: '',
            state: {
              name: 'running',
              label: 'ok',
              cssClass: 'success',
              severity: 0,
            },
          },
          upgradeState: 'upgraded',
          state: 'running',
          hostname: 'fms-quadruple01.rd.cisco.com',
          hostSerial: '0379F08E',
          alarms: [],
          runningVersion: '8.7-1.0.2999',
          createdAt: '',
          maintenanceMode: 'on',
          hostUrl: '',
        }],
        releaseChannel: 'GA',
        provisioning: [],
        targetType: 'hds_app',
      };
      HybridServicesClusterService.get.and.returnValue($q.resolve(incomingCluster));
      initController({
        cluster: {
          id: '1',
        },
        connectorType: 'hds_app',
      });
      $rootScope.$apply();
      expect(controller.hosts.length).toBe(1);
      expect(controller.hosts[0].connectors[0].connectorType).toBe('hds_app');
      expect(controller.hosts[0].connectors.length).toBe(1);
      expect(controller.hosts[0].connectors[0].state).toBe('running');
    });
  });
});
