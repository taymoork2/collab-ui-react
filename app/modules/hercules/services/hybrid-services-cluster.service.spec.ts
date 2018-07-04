import serviceModule from './hybrid-services-cluster.service';

// import { ConnectorType, IConnector, IExtendedClusterFusion } from 'modules/hercules/hybrid-services.types';
import { IExtendedClusterFusion, ConnectorType, IExtendedConnector } from 'modules/hercules/hybrid-services.types';
import { USSService } from 'modules/hercules/services/uss.service';

describe('Service: HybridServicesClusterService', function () {
  let $httpBackend: ng.IHttpBackendService;
  let $q: ng.IQService;
  let HybridServicesClusterService;
  let USSService: USSService;
  let $scope;

  beforeEach(angular.mock.module(serviceModule));
  beforeEach(angular.mock.module(mockDependencies));
  beforeEach(inject(dependencies));

  function dependencies(_$httpBackend_, _$rootScope_, _$q_, _HybridServicesClusterService_, _USSService_) {
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    HybridServicesClusterService = _HybridServicesClusterService_;
    USSService = _USSService_;
    spyOn(USSService, 'getUserPropsSummary').and.returnValue($q.resolve({
      userCountByResourceGroup: [{
        numberOfUsers: 12,
        resourceGroupId: '2c2bdd6d-8149-4090-bbb6-fd87edd5416f',
      }],
    }));
  }

  function mockDependencies($provide) {
    const Authinfo = {
      getOrgId: jasmine.createSpy('Authingo.getOrdId').and.returnValue('0FF1C3'),
      isEntitled: jasmine.createSpy('Authingo.isEntitled').and.returnValue(true),
    };
    $provide.value('Authinfo', Authinfo);
    const UrlConfig = {
      getHerculesUrlV2: jasmine.createSpy('UrlConfig.getHerculesUrlV2').and.returnValue('http://elg.no'),
      getUssUrl: jasmine.createSpy('UrlConfig.getUssUrl').and.returnValue('http://whatever.no/'),
    };
    $provide.value('UrlConfig', UrlConfig);
    const CacheFactory = class {
      public static get() {
        return 'whatever';
      }
      constructor () {}
    };
    $provide.value('CacheFactory', CacheFactory);
  }

  describe('get()', function () {
    afterEach(verifyHttpBackend);

    function verifyHttpBackend() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    }

    it('should call FMS to get a cluster', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/0FF1C3/clusters/clusterId?fields=@wide')
        .respond(200, {
          connectors: [],
        });
      HybridServicesClusterService.get('clusterId');
      $httpBackend.flush();
    });

    it('should filter clusters with bad context connectors', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/0FF1C3/clusters/clusterId?fields=@wide')
        .respond(200, {
          targetType: 'cs_mgmt',
          connectors: [{
            alarms: [],
            runningVersion: '2.0.1-10131',
          }, {
            alarms: [],
            runningVersion: '12',
          }],
        });
      HybridServicesClusterService.get('clusterId')
        .then((cluster) => {
          expect(cluster.connectors.length).toBe(1);
        })
        .catch(fail);
      $httpBackend.flush();
    });

    it('should add extended properties to connectors', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/0FF1C3/clusters/clusterId?fields=@wide')
        .respond(200, {
          targetType: 'c_mgmt',
          connectors: [{
            alarms: [],
          }, {
            alarms: [{
              severity: 'critical',
            }],
          }],
        });
      HybridServicesClusterService.get('clusterId')
        .then((cluster) => {
          expect(cluster.connectors[0].extendedProperties).toExist();
          expect(cluster.connectors[0].extendedProperties.alarms).toBe('none');
          expect(cluster.connectors[1].extendedProperties.alarms).toBe('error');
        })
        .catch(fail);
      $httpBackend.flush();
    });

    it('should add services statuses to clusters', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/0FF1C3/clusters/clusterId?fields=@wide')
        .respond(200, {
          id: '89f3fc3a-3498-11e6-8de3-005056b111e6',
          targetType: 'c_mgmt',
        });
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3/clusters/89f3fc3a-3498-11e6-8de3-005056b111e6/allowedRegistrationHosts').respond(204, { items: [] });
      HybridServicesClusterService.get('clusterId')
        .then((cluster) => {
          expect(cluster.extendedProperties.servicesStatuses).toExist();
        })
        .catch(fail);
      $httpBackend.flush();
    });
  });

  describe('getAll()', function () {

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should call the right backend', function () {
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3?fields=@wide').respond([]);
      HybridServicesClusterService.getAll();
      $httpBackend.flush();
    });

    it('should handle no data in response', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/0FF1C3?fields=@wide')
        .respond('');
      HybridServicesClusterService.getAll()
        .then((clusters) => {
          expect(clusters.length).toBe(0);
        })
        .catch(fail);
      $httpBackend.flush();
    });

    it('should filter out clusters with targetType unknown', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/0FF1C3?fields=@wide')
        .respond({
          clusters: [{
            id: '89f3fc3a-3498-11e6-8de3-005056b111e6',
            targetType: 'unknown',
            connectors: [],
          }, {
            id: '89f3fc3a-3498-11e6-8de3-005056b111e7',
            targetType: 'c_mgmt',
            connectors: [],
          }],
        });
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3/clusters/89f3fc3a-3498-11e6-8de3-005056b111e7/allowedRegistrationHosts').respond(204, { items: [] });
      HybridServicesClusterService.getAll()
        .then((clusters) => {
          expect(clusters.length).toBe(1);
        })
        .catch(fail);
      $httpBackend.flush();
    });

    it('should filter clusters with bad context connectors', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/0FF1C3?fields=@wide')
        .respond(200, {
          clusters: [{
            targetType: 'cs_mgmt',
            connectors: [{
              alarms: [],
              runningVersion: '2.0.1-10131',
            }, {
              alarms: [],
              runningVersion: '12',
            }],
          }],
        });
      HybridServicesClusterService.getAll()
        .then((clusters) => {
          expect(clusters[0].connectors.length).toBe(1);
        })
        .catch(fail);
      $httpBackend.flush();
    });

    it('should add extended properties to connectors', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/0FF1C3?fields=@wide')
        .respond(200, {
          clusters: [{
            targetType: 'c_mgmt',
            connectors: [{
              alarms: [],
            }, {
              alarms: [{
                severity: 'critical',
              }],
            }],
          }],
        });
      HybridServicesClusterService.getAll()
        .then((clusters) => {
          expect(clusters[0].connectors[0].extendedProperties).toExist();
          expect(clusters[0].connectors[0].extendedProperties.alarms).toBe('none');
          expect(clusters[0].connectors[1].extendedProperties.alarms).toBe('error');
        })
        .catch(fail);
      $httpBackend.flush();
    });

    it('should add servicesStatuses property to each cluster', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/0FF1C3?fields=@wide')
        .respond({
          clusters: [{
            targetType: 'c_mgmt',
            connectors: [{
              alarms: [],
              connectorType: 'c_mgmt',
              state: 'running',
              hostname: 'a.elg.no',
            }, {
              alarms: [],
              connectorType: 'c_mgmt',
              state: 'stopped',
              hostname: 'b.elg.no',
            }],
          }, {
            targetType: 'mf_mgmt',
            connectors: [{
              alarms: [],
              connectorType: 'mf_mgmt',
              state: 'running',
              hostname: 'a.elg.no',
            }],
          }],
        });
      HybridServicesClusterService.getAll()
        .then(function (clusters) {
          expect(clusters[0].extendedProperties.servicesStatuses[0].state.name).toBe('impaired');
          expect(clusters[0].extendedProperties.servicesStatuses[0].total).toBe(2);
          expect(clusters[0].extendedProperties.servicesStatuses[1].total).toBe(0);
          expect(clusters[0].extendedProperties.servicesStatuses[2].total).toBe(0);
          expect(clusters[1].extendedProperties.servicesStatuses[0].total).toBe(1);
        })
        .catch(fail);
      $httpBackend.flush();
    });

    it('should sort clusters by targetType and then name', function () {
      jasmine.getJSONFixtures().clearCache(); // See https://github.com/velesin/jasmine-jquery/issues/239
      const org = getJSONFixture('hercules/org-with-resource-groups.json');
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3?fields=@wide').respond(200, org);
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3/clusters/89f3fc3a-3498-11e6-8de3-005056b111e6/allowedRegistrationHosts').respond(204, { items: [] });
      HybridServicesClusterService.getAll()
        .then((clusters) => {
          expect(clusters.length).toBe(4);
          expect(clusters[0].name).toBe('Augusta National Golf Club'); // c_mgmt, ordered
          expect(clusters[3].name).toBe('Cisco Oppsal'); // last one if mf_mgmt
        })
        .catch(fail);
      $httpBackend.flush();
    });
  });

  describe('getResourceGroups()', function () {
    beforeEach(function () {
      jasmine.getJSONFixtures().clearCache(); // See https://github.com/velesin/jasmine-jquery/issues/239
      const org = getJSONFixture('hercules/org-with-resource-groups.json');
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3?fields=@wide').respond(org);
      // The "Oslo Øst & Skinke" cluster has no connectors, so the code will look for ongoing registrations by looking
      // up the allowedRegistrationHosts for it.
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3/clusters/89f3fc3a-3498-11e6-8de3-005056b111e6/allowedRegistrationHosts').respond(204, { items: [] });
    });

    afterEach(function () {
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    xit('should filter out clusters with targetType unknown', function () { /* TODO */ });
    xit('should filter clusters with bad context connectors', function () { /* TODO */ });
    xit('should add extended properties to connectors', function () { /* TODO */ });
    xit('should add servicesStatuses property to each cluster', function () { /* TODO */ });

    it('should add extended properties to clusters', function () {
      HybridServicesClusterService.getResourceGroups()
        .then((response) => {
          expect(response.groups[0].clusters[0].extendedProperties.isEmpty).toBe(true);
          expect(response.unassigned[0].extendedProperties.isEmpty).toBe(false);
        })
        .catch(fail);
    });

    it('should add user count', function () {
      HybridServicesClusterService.getResourceGroups()
        .then((response) => {
          expect(response.groups[0].numberOfUsers).toBe(12);
        })
        .catch(fail);
    });

    it('should extract unassigned clusters and sort them by name', function () {
      HybridServicesClusterService.getResourceGroups()
        .then((response) => {
          expect(response.unassigned.length).toBe(3);
          expect(response.unassigned[0].name).toBe('Augusta National Golf Club');
          expect(response.unassigned[2].name).toBe('Cisco Oppsal');
        })
        .catch(fail);
    });

    it('should extract resource groups and put clusters inside, sorted by name', function () {
      HybridServicesClusterService.getResourceGroups()
        .then((response) => {
          expect(response.groups.length).toBe(4);
          expect(response.groups[0].name).toBe('ACE');
          expect(response.groups[0].clusters.length).toBe(1);
          expect(response.groups[3].name).toBe('🐷');
        })
        .catch(fail);
    });
  });

  describe('preregister Expressway cluster', function () {
    beforeEach(function () {
      spyOn(HybridServicesClusterService, 'clearCache');
    });

    afterEach(function () {
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should provision management and calendar connectors', function () {

      $httpBackend
        .expectPOST('http://elg.no/organizations/0FF1C3/clusters/clusterId/provisioning/actions/add/invoke?connectorType=c_mgmt')
        .respond(204, '');
      HybridServicesClusterService.provisionConnector('clusterId', 'c_mgmt');

      $httpBackend
        .expectPOST('http://elg.no/organizations/0FF1C3/clusters/clusterId/provisioning/actions/add/invoke?connectorType=c_cal')
        .respond(204, '');
      HybridServicesClusterService.provisionConnector('clusterId', 'c_cal');
    });

    it('should call FMS to deprovision a cluster', function () {
      $httpBackend
        .expectPOST('http://elg.no/organizations/0FF1C3/clusters/clusterId/provisioning/actions/remove/invoke?connectorType=c_cal')
        .respond('');
      HybridServicesClusterService.deprovisionConnector('clusterId', 'c_cal');
    });

  });

  describe('processClustersToAggregateStatusForService()', function () {

    let twoClusters: IExtendedClusterFusion[];
    let emptyClusters: IExtendedClusterFusion[];
    beforeEach(function () {
      jasmine.getJSONFixtures().clearCache(); // See https://github.com/velesin/jasmine-jquery/issues/239
      twoClusters = getJSONFixture('hercules/fusion-cluster-service-test-clusters.json');
      emptyClusters = getJSONFixture('hercules/empty-clusters.json');
    });

    it('should return *operational* when all hosts are *running*', function () {
      expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-uc', twoClusters)).toBe('operational');
      expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-mgmt', twoClusters)).toBe('operational');
      expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('operational');
    });

    // it('should return *outage* if all clusters have their Calendar Connectors stopped', function () {
    //   twoClusters[0].extendedProperties.servicesStatuses[2].state.name = 'stopped';
    //   twoClusters[1].extendedProperties.servicesStatuses[2].state.name = 'stopped';
    //   expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('outage');
    // });

    // it('should return *outage* if all clusters have their Calendar Connectors disabled', function () {
    //   twoClusters[0].extendedProperties.servicesStatuses[2].state.name = 'disabled';
    //   twoClusters[1].extendedProperties.servicesStatuses[2].state.name = 'disabled';
    //   expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('outage');
    // });

    // it('should return *outage* if all clusters have their Calendar Connectors not_configured', function () {
    //   twoClusters[0].extendedProperties.servicesStatuses[2].state.name = 'not_configured';
    //   twoClusters[1].extendedProperties.servicesStatuses[2].state.name = 'not_configured';
    //   expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('outage');
    // });

    // it('should return *outage* if all clusters have their Calendar Connectors in a mix of "red" states', function () {
    //   twoClusters[0].extendedProperties.servicesStatuses[2].state.name = 'stopped';
    //   twoClusters[1].extendedProperties.servicesStatuses[2].state.name = 'offline';
    //   expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('outage');
    // });

    // it('should return *outage* if one cluster is not_configured and one cluster is not_operational', function () {
    //   twoClusters[0].extendedProperties.servicesStatuses[2].state.name = 'not_operational';
    //   twoClusters[1].extendedProperties.servicesStatuses[2].state.name = 'not_configured';
    //   expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('outage');
    // });

    // it('should return *operational* during an upgrade the other cluster has at least one running connector', function () {
    //   twoClusters[0].extendedProperties.servicesStatuses[2].state.name = 'downloading';
    //   expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('operational');
    //   twoClusters[0].extendedProperties.servicesStatuses[2].state.name = 'installing';
    //   expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('operational');
    // });

    // it('should not let Call Connector statuses impact Calendar Connector aggregation', function () {
    //   twoClusters[0].extendedProperties.servicesStatuses[1].state.name = 'offline';
    //   twoClusters[0].extendedProperties.servicesStatuses[1].state.name = 'offline';
    //   expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('operational');
    // });

    // TypeScript makes it hard to test
    // it('should handle invalid service types by falling back to *setupNotComplete*', function () {
    //   expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-invalid-service', twoClusters)).toBe('setupNotComplete');
    // });

    // TODO: investigate, 'upgrading' should have never been a valid state name!
    // it('should return *outage* when all hosts are *upgrading*', function () {
    //   twoClusters[0].servicesStatuses[2].serviceId = 'squared-fusion-media';
    //   twoClusters[0].servicesStatuses[2].state.name = 'upgrading';
    //   twoClusters[1].servicesStatuses[2].serviceId = 'squared-fusion-media';
    //   twoClusters[1].servicesStatuses[2].state.name = 'upgrading';
    //   expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-media', twoClusters)).toBe('outage');
    // });

    // TODO: investigate, 'upgrading' should have never been a valid state name!
    // it('should return *impaired* if one host is *running* and one is *upgrading*', function () {
    //   twoClusters[0].servicesStatuses[2].serviceId = 'squared-fusion-media';
    //   twoClusters[0].servicesStatuses[2].state.name = 'running';
    //   twoClusters[1].servicesStatuses[2].serviceId = 'squared-fusion-media';
    //   twoClusters[1].servicesStatuses[2].state.name = 'upgrading';
    //   expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-media', twoClusters)).toBe('impaired');
    // });

    it('should return *setupNotComplete* if no connectors in the cluster', function () {
      expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', emptyClusters)).toBe('setupNotComplete');
      expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-uc', emptyClusters)).toBe('setupNotComplete');
    });
  });

  describe('processClustersToAggregateAlarms()', function () {

    let twoClusters: IExtendedClusterFusion[];
    let emptyClusters: IExtendedClusterFusion[];
    beforeEach(function () {
      jasmine.getJSONFixtures().clearCache(); // See https://github.com/velesin/jasmine-jquery/issues/239
      twoClusters = getJSONFixture('hercules/fusion-cluster-service-test-clusters.json');
      emptyClusters = getJSONFixture('hercules/empty-clusters.json');
    });

    it('should return *true* when atleast one of the cluster has an alarm', function () {
      expect(HybridServicesClusterService.processClustersToAggregateAlarms('squared-fusion-cal', twoClusters)).toBe(true);
    });

    it('should return *false* when the cluster has no alarm', function () {
      expect(HybridServicesClusterService.processClustersToAggregateAlarms('squared-fusion-media', twoClusters)).toBe(false);
      expect(HybridServicesClusterService.processClustersToAggregateAlarms('squared-fusion-uc', twoClusters)).toBe(false);
    });

    it('should return *false* if no connectors in the cluster', function () {
      expect(HybridServicesClusterService.processClustersToAggregateAlarms('squared-fusion-cal', emptyClusters)).toBe(false);
      expect(HybridServicesClusterService.processClustersToAggregateAlarms('squared-fusion-uc', emptyClusters)).toBe(false);
    });
  });

  describe('serviceHasHighAvailability() and hasOnlyOneExpresswayWithConnectorProvisioned()', () => {

    function createExpresswayCluster(connectorType: ConnectorType): IExtendedClusterFusion {
      return {
        allowedRegistrationHostsUrl: '',
        createdAt: '',
        connectors: [],
        id: String(_.random(10)),
        name: String(connectorType + _.random(10)),
        extendedProperties: {
          alarms: 'none',
          alarmsBadgeCss: 'success',
          allowedRedirectTarget: undefined,
          hasUpgradeAvailable: false,
          isUpgradeUrgent: false,
          isEmpty: true,
          maintenanceMode: 'on',
          registrationTimedOut: false,
          servicesStatuses: [],
          upgradeState: 'upgraded',
        },
        provisioning: [
          {
            connectorType: connectorType,
            availablePackageIsUrgent: false,
            availableVersion: '',
            packageUrl: '',
            provisionedVersion: '',
            url: '',
          },
        ],
        releaseChannel: '',
        targetType: 'c_mgmt',
        upgradeScheduleUrl: '',
        upgradeSchedule: {
          urgentScheduleTime: '15:00',
          scheduleDays: ['sunday'],
          scheduleTime: '15:00',
          scheduleTimeZone: 'Pacific/Tahiti',
          moratoria: [],
          nextUpgradeWindow: {
            startTime: '2016-08-08T01:00:02.507Z',
            endTime: '2016-08-08T02:00:02.507Z',
          },
          url: '',
        },
        url: '',
      };
    }

    function createConnector(connectorType: ConnectorType): IExtendedConnector {
      return {
        connectorType: connectorType,
        alarms: [],
        clusterId: '',
        clusterUrl: '',
        createdAt: '',
        extendedProperties: {
          alarms: '',
          alarmsBadgeCss: '',
          hasUpgradeAvailable: false,
          isUpgradeUrgent: false,
          maintenanceMode: 'off',
          state: {
            name: 'running',
            label: 'ok',
            cssClass: 'success',
            severity: 0,
          },
        },
        hostSerial: '',
        hostUrl: '',
        hostname: '',
        id: '',
        maintenanceMode: 'off',
        runningVersion: '',
        state: 'running',
        upgradeState: 'upgraded',
        url: '',
      };
    }

    it('should return false if there are no clusters in the org', () => {
      const clusters = [];
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3?fields=@wide').respond({
        clusters: clusters,
      });
      HybridServicesClusterService.serviceHasHighAvailability('c_ucmc')
        .then((hasHA) => {
          expect(hasHA).toBe(false);
        });
      $httpBackend.flush();
    });

    it('should return false if there are expressways with other connector types, but none with this connector type', () => {
      const clusters = [createExpresswayCluster('c_cal'), createExpresswayCluster('c_cal')];
      clusters[0].connectors = [createConnector('c_cal'), createConnector('c_cal')];
      clusters[1].connectors = [createConnector('c_cal'), createConnector('c_cal')];
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3?fields=@wide').respond({
        clusters: clusters,
      });
      HybridServicesClusterService.serviceHasHighAvailability('c_ucmc')
        .then((hasHA) => {
          expect(hasHA).toBe(false);
        });
      $httpBackend.flush();
    });

    it('should return false if there are clusters provisioned with the connector, but the connectors aren\'t actually installed', () => {
      const clusters = [createExpresswayCluster('c_ucmc'), createExpresswayCluster('c_ucmc')];
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3?fields=@wide').respond({
        clusters: clusters,
      });
      HybridServicesClusterService.serviceHasHighAvailability('c_ucmc')
        .then((hasHA) => {
          expect(hasHA).toBe(false);
        });
      $httpBackend.flush();
    });

    it('should return true if there are two clusters having two connectors of the correct type', () => {
      const clusters = [createExpresswayCluster('c_ucmc'), createExpresswayCluster('c_ucmc')];
      clusters[0].connectors = [createConnector('c_ucmc'), createConnector('c_ucmc')];
      clusters[1].connectors = [createConnector('c_ucmc'), createConnector('c_ucmc')];
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3?fields=@wide').respond({
        clusters: clusters,
      });
      HybridServicesClusterService.serviceHasHighAvailability('c_ucmc')
        .then((hasHA) => {
          expect(hasHA).toBe(true);
        });
      $httpBackend.flush();
    });

    it('should return false if there is one cluster having two connectors of the correct type, and one custers having only one connector', () => {
      const clusters = [createExpresswayCluster('c_ucmc'), createExpresswayCluster('c_ucmc')];
      clusters[0].connectors = [createConnector('c_ucmc'), createConnector('c_ucmc')];
      clusters[1].connectors = [createConnector('c_ucmc')];
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3?fields=@wide').respond({
        clusters: clusters,
      });
      HybridServicesClusterService.serviceHasHighAvailability('c_ucmc')
        .then((hasHA) => {
          expect(hasHA).toBe(false);
        });
      $httpBackend.flush();
    });

    it('should not take the cluster\'s other connector types into account', () => {
      const clusters = [createExpresswayCluster('c_ucmc'), createExpresswayCluster('c_ucmc')];
      clusters[0].connectors = [createConnector('c_ucmc'), createConnector('c_ucmc')];
      clusters[1].connectors = [createConnector('c_ucmc'), createConnector('c_cal')];
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3?fields=@wide').respond({
        clusters: clusters,
      });
      HybridServicesClusterService.serviceHasHighAvailability('c_ucmc')
        .then((hasHA) => {
          expect(hasHA).toBe(false);
        });
      $httpBackend.flush();
    });

    it('should not treat a cluster list with no connectors as having exactly one one', () => {
      const clusters = [createExpresswayCluster('c_ucmc'), createExpresswayCluster('c_ucmc')];
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3?fields=@wide').respond({
        clusters: clusters,
      });
      HybridServicesClusterService.hasOnlyOneExpresswayWithConnectorProvisioned('c_cal')
        .then((isLast) => {
          expect(isLast).toBe(false);
        });
      $httpBackend.flush();
    });

    it ('should treat a cluster with one provisioned connector as having only one' , () => {
      const clusters = [createExpresswayCluster('c_cal'), createExpresswayCluster('c_ucmc')];
      clusters[0].connectors = [createConnector('c_cal')];
      clusters[1].connectors = [createConnector('c_ucmc')];
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3?fields=@wide').respond({
        clusters: clusters,
      });
      HybridServicesClusterService.hasOnlyOneExpresswayWithConnectorProvisioned('c_cal')
        .then((isLast) => {
          expect(isLast).toBe(true);
        });
      $httpBackend.flush();
    });

    it ('should not treat a cluster with two provisioned connectors as having only one' , () => {
      const clusters = [createExpresswayCluster('c_cal'), createExpresswayCluster('c_cal')];
      clusters[0].connectors = [createConnector('c_cal')];
      clusters[1].connectors = [createConnector('c_cal')];
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3?fields=@wide').respond({
        clusters: clusters,
      });
      HybridServicesClusterService.hasOnlyOneExpresswayWithConnectorProvisioned('c_cal')
        .then((isLast) => {
          expect(isLast).toBe(false);
        });
      $httpBackend.flush();
    });

    it ('should not look at other connector types when calculating' , () => {
      const clusters = [createExpresswayCluster('c_cal'), createExpresswayCluster('c_ucmc')];
      clusters[0].connectors = [createConnector('c_cal')];
      clusters[1].connectors = [createConnector('c_ucmc')];
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3?fields=@wide').respond({
        clusters: clusters,
      });
      HybridServicesClusterService.hasOnlyOneExpresswayWithConnectorProvisioned('c_imp')
        .then((isLast) => {
          expect(isLast).toBe(false);
        });
      $httpBackend.flush();
    });

  });

  describe('addExtendedPropertiesToClusters', () => {
    it('should get a list of allowed redirect targets if the cluster is empty, and the cluster is an Expressway', () => {
      const clusterId = 'Romelu Lukaku';
      const clusters = [{
        id: clusterId,
        connectors: [],
        targetType: 'c_mgmt',
      }];
      $httpBackend
        .expectGET(`http://elg.no/organizations/0FF1C3/clusters/${clusterId}/allowedRegistrationHosts`)
        .respond(200, { items: [] });
      HybridServicesClusterService.addExtendedPropertiesToClusters(clusters);
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should not return a rejected promise when there is inconsistent data in FMS', function (done) {
      const clusterId = 'Paul Pogba';
      const clusters = [{
        id: clusterId,
        connectors: [],
        targetType: 'c_mgmt',
      }];
      $httpBackend
        .expectGET(`http://elg.no/organizations/0FF1C3/clusters/${clusterId}/allowedRegistrationHosts`)
        .respond(404, {});

      HybridServicesClusterService.addExtendedPropertiesToClusters(clusters)
        .then(() => done())
        .catch(() => fail('addExtendedPropertiesToClusters should not reject the promise'));
      $httpBackend.flush();
      $scope.$apply();
    });

  });

});
