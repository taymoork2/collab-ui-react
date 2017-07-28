import serviceModule from './hybrid-services-cluster.service';

import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { ConnectorType, IConnector, IExtendedClusterFusion } from 'modules/hercules/hybrid-services.types';

describe('Service: HybridServicesClusterService', function () {
  let $httpBackend: ng.IHttpBackendService, $q: ng.IQService, HybridServicesClusterService: HybridServicesClusterService, USSService;

  beforeEach(angular.mock.module(serviceModule));
  beforeEach(angular.mock.module(mockDependencies));
  beforeEach(inject(dependencies));

  function dependencies(_$httpBackend_, _$q_, _HybridServicesClusterService_, _USSService_) {
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    USSService = _USSService_;
    spyOn(USSService, 'getUserPropsSummary').and.returnValue($q.resolve({ numberOfUsers: 0 }));
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
  }

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

    // state (fused, defused, etc.) will soon be removed from the API reponse!
    // the API will only return fused clusters
    it('should not crash if clusters do not have a state', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/0FF1C3?fields=@wide')
        .respond({
          clusters: [{
            connectors: [],
          }, {
            connectors: [],
          }],
        });
      HybridServicesClusterService.getAll()
        .then(function (clusters) {
          expect(clusters.length).toBe(2);
        })
        .catch(function () {
          expect('reject called').toBeFalsy();
        });
      $httpBackend.flush();
    });

    it('should handle no data in response', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/0FF1C3?fields=@wide')
        .respond('');
      HybridServicesClusterService.getAll()
        .then(function (clusters) {
          expect(clusters.length).toBe(0);
        })
        .catch(function () {
          expect('reject called').toBeFalsy();
        });
      $httpBackend.flush();
    });

    it('should filter out clusters with targetType unknown', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/0FF1C3?fields=@wide')
        .respond({
          clusters: [{
            targetType: 'unknown',
            connectors: [],
          }, {
            targetType: 'c_mgmt',
            connectors: [],
          }],
        });
      HybridServicesClusterService.getAll()
        .then(function (clusters) {
          expect(clusters.length).toBe(1);
        })
        .catch(function () {
          expect('reject called').toBeFalsy();
        });
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
              runningState: 'running',
              hostname: 'a.elg.no',
            }, {
              alarms: [],
              connectorType: 'c_mgmt',
              runningState: 'stopped',
              hostname: 'b.elg.no',
            }],
          }, {
            targetType: 'mf_mgmt',
            connectors: [{
              alarms: [],
              connectorType: 'mf_mgmt',
              runningState: 'running',
              hostname: 'a.elg.no',
            }],
          }],
        });
      HybridServicesClusterService.getAll()
        .then(function (clusters) {
          expect(clusters[0].servicesStatuses[0].state.label).toBe('error');
          expect(clusters[0].servicesStatuses[0].total).toBe(2);
          expect(clusters[0].servicesStatuses[1].total).toBe(0);
          expect(clusters[0].servicesStatuses[2].total).toBe(0);
          expect(clusters[1].servicesStatuses[0].total).toBe(1);
        })
        .catch(function () {
          expect('reject called').toBeFalsy();
        });
      $httpBackend.flush();
    });
  });

  describe('preregister Expressway cluster', function () {

    afterEach(verifyHttpBackend);

    function verifyHttpBackend() {
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    }

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

  describe('get()', function () {

    afterEach(verifyHttpBackend);

    function verifyHttpBackend() {
      $httpBackend.flush();
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

    it('should return *outage* if all clusters have their Calendar Connectors stopped', function () {
      twoClusters[0].servicesStatuses[2].state.name = 'stopped';
      twoClusters[1].servicesStatuses[2].state.name = 'stopped';
      expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('outage');
    });

    it('should return *outage* if all clusters have their Calendar Connectors disabled', function () {
      twoClusters[0].servicesStatuses[2].state.name = 'disabled';
      twoClusters[1].servicesStatuses[2].state.name = 'disabled';
      expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('outage');
    });

    it('should return *outage* if all clusters have their Calendar Connectors not_configured', function () {
      twoClusters[0].servicesStatuses[2].state.name = 'not_configured';
      twoClusters[1].servicesStatuses[2].state.name = 'not_configured';
      expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('outage');
    });

    it('should return *outage* if all clusters have their Calendar Connectors in a mix of "red" states', function () {
      twoClusters[0].servicesStatuses[2].state.name = 'stopped';
      twoClusters[1].servicesStatuses[2].state.name = 'offline';
      expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('outage');
    });

    it('should return *outage* if one cluster is not_configured and one cluster is not_operational', function () {
      twoClusters[0].servicesStatuses[2].state.name = 'not_operational';
      twoClusters[1].servicesStatuses[2].state.name = 'not_configured';
      expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('outage');
    });

    it('should return *operational* during an upgrade the other cluster has at least one running connector', function () {
      twoClusters[0].servicesStatuses[2].state.name = 'downloading';
      expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('operational');
      twoClusters[0].servicesStatuses[2].state.name = 'installing';
      expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('operational');
    });

    it('should not let Call Connector statuses impact Calendar Connector aggregation', function () {
      twoClusters[0].servicesStatuses[1].state.name = 'offline';
      twoClusters[0].servicesStatuses[1].state.name = 'offline';
      expect(HybridServicesClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('operational');
    });

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

  describe('processClustersToSeeIfServiceIsSetup()', function () {

    describe('Org with Call and Calendar', function () {

      // Test cluster: Two clusters where Call is installed on one cluster, and Calendar is installed on both clusters
      let baseClusters: IExtendedClusterFusion[];
      beforeEach(function () {
        jasmine.getJSONFixtures().clearCache(); // See https://github.com/velesin/jasmine-jquery/issues/239
        baseClusters = getJSONFixture('hercules/fusion-cluster-service-test-clusters.json');
      });

      it('should find that Call is enabled', function () {
        expect(HybridServicesClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-uc', baseClusters)).toBe(true);
      });

      it('should find that Calendar is enabled', function () {
        expect(HybridServicesClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-cal', baseClusters)).toBe(true);
      });

      it('should find that Management is enabled', function () {
        expect(HybridServicesClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-mgmt', baseClusters)).toBe(true);
      });

      // TypeScript no longer let us use invalid services…
      // it('should find that InvalidService is *not* enabled', function () {
      //   expect(HybridServicesClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-invalid-service', baseClusters)).toBe(false);
      // });

      it('should find that Media is *not* enabled', function () {
        expect(HybridServicesClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-media', baseClusters)).toBe(false);
      });
    });

    describe('Disco Systems, an org with Call, Calendar, and Media,', function () {

      // Test clusters: Disco Systems, org
      let discothequeClusters: IExtendedClusterFusion[];
      beforeEach(function () {
        jasmine.getJSONFixtures().clearCache(); // See https://github.com/velesin/jasmine-jquery/issues/239
        discothequeClusters = getJSONFixture('hercules/disco-systems-cluster-list.json');
      });

      it('should find that Media is enabled in the Discotheque org', function () {
        expect(HybridServicesClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-media', discothequeClusters)).toBe(true);
      });

      it('should find that Call is enabled in the Discotheque org', function () {
        expect(HybridServicesClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-uc', discothequeClusters)).toBe(true);
      });

      it('should find that Calendar is enabled in the Discotheque org', function () {
        expect(HybridServicesClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-cal', discothequeClusters)).toBe(true);
      });

    });

    describe('Empty Clusters Corp', function () {

      // Test clusters: Empty Hybrid Media Corp org
      let clusters: IExtendedClusterFusion[];
      beforeEach(function () {
        jasmine.getJSONFixtures().clearCache(); // See https://github.com/velesin/jasmine-jquery/issues/239
        clusters = getJSONFixture('hercules/empty-clusters-corp-cluster-list.json');
      });

      it('should find that Media is enabled', function () {
        expect(HybridServicesClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-media', clusters)).toBe(true);
      });

      it('should find that Call is **not** enabled', function () {
        expect(HybridServicesClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-uc', clusters)).toBe(false);
      });

      it('should find that Calendar is **not** enabled', function () {
        expect(HybridServicesClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-cal', clusters)).toBe(false);
      });

    });

    describe('An org with nothing at all,', function () {

      // Test clusters: Two clusters, with nothing provisioned and nothing installed
      let clustersWithNothingInstalled: IExtendedClusterFusion[];
      beforeEach(function () {
        jasmine.getJSONFixtures().clearCache(); // See https://github.com/velesin/jasmine-jquery/issues/239
        clustersWithNothingInstalled = getJSONFixture('hercules/nothing-provisioned-cluster-list.json');
      });

      it('should find that Media is *dis*-abled', function () {
        expect(HybridServicesClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-media', clustersWithNothingInstalled)).toBe(false);
      });

      it('should find that Call is *dis*-abled', function () {
        expect(HybridServicesClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-uc', clustersWithNothingInstalled)).toBe(false);
      });

      it('should find that Calendar is *dis*-abled', function () {
        expect(HybridServicesClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-cal', clustersWithNothingInstalled)).toBe(false);
      });

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

    it('extract unassigned clusters and sort them by name', function () {
      HybridServicesClusterService.getResourceGroups()
        .then(function (response: any) {
          expect(response.unassigned.length).toBe(3);
          expect(response.unassigned[0].name).toBe('Augusta National Golf Club');
          expect(response.unassigned[2].name).toBe('Cisco Oppsal');
        });
    });

    it('extract resource groups and put clusters inside, sorted by name', function () {
      HybridServicesClusterService.getResourceGroups()
        .then(function (response: any) {
          expect(response.groups.length).toBe(4);
          expect(response.groups[0].name).toBe('ACE');
          expect(response.groups[0].clusters.length).toBe(1);
          expect(response.groups[3].name).toBe('🐷');
        });
    });
  });

  describe('serviceHasHighAvailability()', () => {

    function createExpresswayCluster(connectorType: ConnectorType): IExtendedClusterFusion {
      return {
        connectors: [],
        id: '',
        name: '',
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
        servicesStatuses: [],
        url: '',
      };
    }

    function createConnector(connectorType: ConnectorType): IConnector {
      return {
        connectorType: connectorType,
        alarms: [],
        clusterId: '',
        clusterUrl: '',
        createdAt: '',
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

  });

});
