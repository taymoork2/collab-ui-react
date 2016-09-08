'use strict';

describe('Service: FusionClusterService', function () {
  var FusionClusterService, $httpBackend;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module(mockDependencies));
  beforeEach(inject(dependencies));

  function dependencies(_$httpBackend_, _FusionClusterService_) {
    $httpBackend = _$httpBackend_;
    FusionClusterService = _FusionClusterService_;
  }

  function mockDependencies($provide) {
    var Authinfo = {
      getOrgId: sinon.stub().returns('0FF1C3'),
      isEntitled: sinon.stub().returns(true)
    };
    $provide.value('Authinfo', Authinfo);
    var UrlConfig = {
      getHerculesUrlV2: sinon.stub().returns('http://elg.no'),
      getHerculesUrl: sinon.stub().returns('http://ulv.no')
    };
    $provide.value('UrlConfig', UrlConfig);
  }

  describe('getAll()', function () {
    afterEach(verifyHttpBackend);

    function verifyHttpBackend() {
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    }

    it('should call the right backend', function () {
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3?fields=@wide').respond([]);
      FusionClusterService.getAll();
    });

    // state (fused, defused, etc.) will soon be removed from the API reponse!
    // the API will only return fused clusters
    it('should not crash if clusters do not have a state', function () {
      $httpBackend
        .when('GET', 'http://elg.no/organizations/0FF1C3?fields=@wide')
        .respond({
          clusters: [{
            connectors: []
          }, {
            connectors: []
          }]
        });
      FusionClusterService.getAll()
        .then(function (clusters) {
          expect(clusters.length).toBe(2);
        });
    });

    it('should add servicesStatuses property to each cluster', function () {
      $httpBackend
        .when('GET', 'http://elg.no/organizations/0FF1C3?fields=@wide')
        .respond({
          clusters: [{
            state: 'fused',
            targetType: 'c_mgmt',
            connectors: [{
              alarms: [],
              connectorType: 'c_mgmt',
              runningState: 'running',
              hostname: 'a.elg.no'
            }, {
              alarms: [],
              connectorType: 'c_mgmt',
              runningState: 'stopped',
              hostname: 'b.elg.no'
            }]
          }, {
            state: 'fused',
            targetType: 'mf_mgmt',
            connectors: [{
              alarms: [],
              connectorType: 'mf_mgmt',
              runningState: 'running',
              hostname: 'a.elg.no'
            }]
          }]
        });
      FusionClusterService.getAll()
        .then(function (clusters) {
          expect(clusters[0].servicesStatuses[0].state.label).toBe('error');
          expect(clusters[0].servicesStatuses[0].total).toBe(2);
          expect(clusters[0].servicesStatuses[1].total).toBe(0);
          expect(clusters[0].servicesStatuses[2].total).toBe(0);
          expect(clusters[1].servicesStatuses[0].total).toBe(1);
        });
    });
  });

  describe('preregister Expressway cluster', function () {

    afterEach(verifyHttpBackend);

    function verifyHttpBackend() {
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    }

    it('should add the empty cluster to the FMS list of clusters and return a clusterId', function () {
      var response = '{"url":"https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/clusters/3803ded5-70d9-4e7d-bdc4-fe3dbf319e59","id":"3803ded5-70d9-4e7d-bdc4-fe3dbf319e59","name":"man.united","connectors":[],"releaseChannel":"GA","provisioning":[],"state":"preregistered"}';
      $httpBackend
        .expectPOST('http://elg.no/organizations/0FF1C3/clusters')
        .respond(201, response);

      var newExpresswayPromise = FusionClusterService.preregisterCluster('man.united', 'GA');
      newExpresswayPromise.then(function (data) {
        expect(data.id).toBe('3803ded5-70d9-4e7d-bdc4-fe3dbf319e59');
      });
    });

    it('should provision management and calendar connectors', function () {

      $httpBackend
        .expectPOST('http://elg.no/organizations/0FF1C3/clusters/clusterId/provisioning/actions/add/invoke?connectorType=c_mgmt')
        .respond(204, '');
      FusionClusterService.provisionConnector("clusterId", "c_mgmt");

      $httpBackend
        .expectPOST('http://elg.no/organizations/0FF1C3/clusters/clusterId/provisioning/actions/add/invoke?connectorType=c_cal')
        .respond(204, '');
      FusionClusterService.provisionConnector("clusterId", "c_cal");
    });

    it('should add the new cluster to the FMS allow-list', function () {

      $httpBackend
        .expectPOST('http://ulv.no/organizations/0FF1C3/allowedRedirectTargets')
        .respond(204, '');

      FusionClusterService.addPreregisteredClusterToAllowList('ew.ree.online', 3600, 'f635d90f-d39b-4659-a983-cf13ca52a960');
    });

    it('should parse a connector list from a cluster object', function () {

      var response = '{"url":"https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/clusters/e33defcf-2702-11e6-9998-005056bf13dd","id":"e33defcf-2702-11e6-9998-005056bf13dd","name":"boler.eu","connectors":[{"url":"https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/clusters/e33defcf-2702-11e6-9998-005056bf13dd/connectors/c_ucmc@03C36F68","id":"c_ucmc@03C36F68","connectorType":"c_ucmc","upgradeState":"upgraded","state":"not_configured","hostname":"cisco.boler.eu","hostSerial":"03C36F68","alarms":[],"runningVersion":"8.7-1.0.2094","packageUrl":"https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_ucmc"},{"url":"https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/clusters/e33defcf-2702-11e6-9998-005056bf13dd/connectors/c_mgmt@03C36F68","id":"c_mgmt@03C36F68","connectorType":"c_mgmt","upgradeState":"upgraded","state":"running","hostname":"cisco.boler.eu","hostSerial":"03C36F68","alarms":[],"runningVersion":"8.7-1.0.321154","packageUrl":"https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_mgmt"},{"url":"https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/clusters/e33defcf-2702-11e6-9998-005056bf13dd/connectors/c_cal@03C36F68","id":"c_cal@03C36F68","connectorType":"c_cal","upgradeState":"upgraded","state":"not_configured","hostname":"cisco.boler.eu","hostSerial":"03C36F68","alarms":[],"runningVersion":"8.7-1.0.2909","packageUrl":"https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_cal"}],"releaseChannel":"GA","provisioning":[{"url":"https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/clusters/e33defcf-2702-11e6-9998-005056bf13dd/provisioning/c_cal","connectorType":"c_cal","provisionedVersion":"8.7-1.0.2909","availableVersion":"8.7-1.0.2909","packageUrl":"https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_cal"},{"url":"https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/clusters/e33defcf-2702-11e6-9998-005056bf13dd/provisioning/c_mgmt","connectorType":"c_mgmt","provisionedVersion":"8.7-1.0.321154","availableVersion":"8.7-1.0.321154","packageUrl":"https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_mgmt"},{"url":"https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/clusters/e33defcf-2702-11e6-9998-005056bf13dd/provisioning/c_ucmc","connectorType":"c_ucmc","provisionedVersion":"8.7-1.0.2094","availableVersion":"8.7-1.0.2094","packageUrl":"https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_ucmc"}],"state":"fused"}';
      $httpBackend
        .expectGET('http://elg.no/organizations/0FF1C3/clusters/clusterId?fields=@wide')
        .respond(200, response);
      var connectorListPromise = FusionClusterService.getAllProvisionedConnectorTypes("clusterId");
      connectorListPromise.then(function (allConnectors) {
        expect(allConnectors.length).toBe(3);
      });
    });

    it('should call FMS to deprovision a cluster', function () {
      $httpBackend
        .expectPOST('http://elg.no/organizations/0FF1C3/clusters/clusterId/provisioning/actions/remove/invoke?connectorType=c_cal')
        .respond('');
      FusionClusterService.deprovisionConnector('clusterId', 'c_cal');
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
        .respond(200, 'dummy response');
      FusionClusterService.get('clusterId');
    });

  });

  describe('finding and filtering a cluster for the service specific sidepanel', function () {

    it('should format a cluster object so that it is suitable for the sidepanel', function () {
      var incomingCluster = {
        "url": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/clusters/1107700c-2eeb-11e6-8ebd-005056b10bf7",
        "id": "1107700c-2eeb-11e6-8ebd-005056b10bf7",
        "name": "fms-quadruple.rd.cisco.com",
        "connectors": [{
          "url": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7…0d/clusters/1107700c-2eeb-11e6-8ebd-005056b10bf7/connectors/c_cal@0D10F849",
          "id": "c_cal@0D10F849",
          "connectorType": "c_cal",
          "upgradeState": "upgraded",
          "state": "running",
          "hostname": "fms-quadruple03.rd.cisco.com",
          "hostSerial": "0D10F849",
          "alarms": [],
          "runningVersion": "8.7-1.0.2994",
          "packageUrl": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_cal"
        }, {
          "url": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7…0d/clusters/1107700c-2eeb-11e6-8ebd-005056b10bf7/connectors/c_cal@07A00089",
          "id": "c_cal@07A00089",
          "connectorType": "c_cal",
          "upgradeState": "upgraded",
          "state": "running",
          "hostname": "fms-quadruple02.rd.cisco.com",
          "hostSerial": "07A00089",
          "alarms": [],
          "runningVersion": "8.7-1.0.2994",
          "packageUrl": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_cal"
        }, {
          "url": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7…d/clusters/1107700c-2eeb-11e6-8ebd-005056b10bf7/connectors/c_ucmc@0379F08E",
          "id": "c_ucmc@0379F08E",
          "connectorType": "c_ucmc",
          "upgradeState": "upgraded",
          "state": "running",
          "hostname": "fms-quadruple04.rd.cisco.com",
          "hostSerial": "0379F08E",
          "alarms": [],
          "runningVersion": "8.7-1.0.2094",
          "packageUrl": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_ucmc"
        }, {
          "url": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7…d/clusters/1107700c-2eeb-11e6-8ebd-005056b10bf7/connectors/c_mgmt@07A00089",
          "id": "c_mgmt@07A00089",
          "connectorType": "c_mgmt",
          "upgradeState": "upgraded",
          "state": "running",
          "hostname": "fms-quadruple02.rd.cisco.com",
          "hostSerial": "07A00089",
          "alarms": [],
          "runningVersion": "8.7-1.0.321154",
          "packageUrl": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_mgmt"
        }, {
          "url": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7…0d/clusters/1107700c-2eeb-11e6-8ebd-005056b10bf7/connectors/c_cal@0379F08E",
          "id": "c_cal@0379F08E",
          "connectorType": "c_cal",
          "upgradeState": "upgraded",
          "state": "running",
          "hostname": "fms-quadruple04.rd.cisco.com",
          "hostSerial": "0379F08E",
          "alarms": [],
          "runningVersion": "8.7-1.0.2994",
          "packageUrl": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_cal"
        }, {
          "url": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7…d/clusters/1107700c-2eeb-11e6-8ebd-005056b10bf7/connectors/c_mgmt@0D09EDC5",
          "id": "c_mgmt@0D09EDC5",
          "connectorType": "c_mgmt",
          "upgradeState": "upgraded",
          "state": "running",
          "hostname": "fms-quadruple01.rd.cisco.com",
          "hostSerial": "0D09EDC5",
          "alarms": [],
          "runningVersion": "8.7-1.0.321154",
          "packageUrl": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_mgmt"
        }, {
          "url": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7…d/clusters/1107700c-2eeb-11e6-8ebd-005056b10bf7/connectors/c_mgmt@0D10F849",
          "id": "c_mgmt@0D10F849",
          "connectorType": "c_mgmt",
          "upgradeState": "upgraded",
          "state": "running",
          "hostname": "fms-quadruple03.rd.cisco.com",
          "hostSerial": "0D10F849",
          "alarms": [],
          "runningVersion": "8.7-1.0.321154",
          "packageUrl": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_mgmt"
        }, {
          "url": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7…d/clusters/1107700c-2eeb-11e6-8ebd-005056b10bf7/connectors/c_ucmc@0D09EDC5",
          "id": "c_ucmc@0D09EDC5",
          "connectorType": "c_ucmc",
          "upgradeState": "upgraded",
          "state": "running",
          "hostname": "fms-quadruple01.rd.cisco.com",
          "hostSerial": "0D09EDC5",
          "alarms": [],
          "runningVersion": "8.7-1.0.2094",
          "packageUrl": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_ucmc"
        }, {
          "url": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7…0d/clusters/1107700c-2eeb-11e6-8ebd-005056b10bf7/connectors/c_cal@0D09EDC5",
          "id": "c_cal@0D09EDC5",
          "connectorType": "c_cal",
          "upgradeState": "upgraded",
          "state": "running",
          "hostname": "fms-quadruple01.rd.cisco.com",
          "hostSerial": "0D09EDC5",
          "alarms": [],
          "runningVersion": "8.7-1.0.2994",
          "packageUrl": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_cal"
        }, {
          "url": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7…d/clusters/1107700c-2eeb-11e6-8ebd-005056b10bf7/connectors/c_ucmc@0D10F849",
          "id": "c_ucmc@0D10F849",
          "connectorType": "c_ucmc",
          "upgradeState": "upgraded",
          "state": "running",
          "hostname": "fms-quadruple03.rd.cisco.com",
          "hostSerial": "0D10F849",
          "alarms": [],
          "runningVersion": "8.7-1.0.2094",
          "packageUrl": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_ucmc"
        }, {
          "url": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7…d/clusters/1107700c-2eeb-11e6-8ebd-005056b10bf7/connectors/c_ucmc@07A00089",
          "id": "c_ucmc@07A00089",
          "connectorType": "c_ucmc",
          "upgradeState": "upgraded",
          "state": "running",
          "hostname": "fms-quadruple02.rd.cisco.com",
          "hostSerial": "07A00089",
          "alarms": [],
          "runningVersion": "8.7-1.0.2094",
          "packageUrl": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_ucmc"
        }, {
          "url": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7…d/clusters/1107700c-2eeb-11e6-8ebd-005056b10bf7/connectors/c_mgmt@0379F08E",
          "id": "c_mgmt@0379F08E",
          "connectorType": "c_mgmt",
          "upgradeState": "upgraded",
          "state": "running",
          "hostname": "fms-quadruple04.rd.cisco.com",
          "hostSerial": "0379F08E",
          "alarms": [],
          "runningVersion": "8.7-1.0.321154",
          "packageUrl": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_mgmt"
        }],
        "releaseChannel": "GA",
        "provisioning": [{
          "url": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7…910fc50d/clusters/1107700c-2eeb-11e6-8ebd-005056b10bf7/provisioning/c_ucmc",
          "connectorType": "c_ucmc",
          "provisionedVersion": "8.7-1.0.2094",
          "availableVersion": "8.7-1.0.2094",
          "packageUrl": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_ucmc"
        }, {
          "url": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7…c910fc50d/clusters/1107700c-2eeb-11e6-8ebd-005056b10bf7/provisioning/c_cal",
          "connectorType": "c_cal",
          "provisionedVersion": "8.7-1.0.2994",
          "availableVersion": "8.7-1.0.2994",
          "packageUrl": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_cal"
        }, {
          "url": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7…910fc50d/clusters/1107700c-2eeb-11e6-8ebd-005056b10bf7/provisioning/c_mgmt",
          "connectorType": "c_mgmt",
          "provisionedVersion": "8.7-1.0.321154",
          "availableVersion": "8.7-1.0.321154",
          "packageUrl": "https://hercules-integration.wbx2.com/hercules/api/v2/organizations/fe5acf7a-6246-484f-8f43-3e8c910fc50d/channels/GA/packages/c_mgmt"
        }],
        "state": "fused",
        "targetType": "c_mgmt",
        "type": "expressway",
        "servicesStatuses": [{
          "serviceId": "squared-fusion-mgmt",
          "state": {
            "name": "running",
            "severity": 0,
            "label": "ok"
          },
          "total": 4
        }, {
          "serviceId": "squared-fusion-uc",
          "state": {
            "name": "running",
            "severity": 0,
            "label": "ok"
          },
          "total": 4
        }, {
          "serviceId": "squared-fusion-cal",
          "state": {
            "name": "running",
            "severity": 0,
            "label": "ok"
          },
          "total": 4
        }]
      };
      var result = FusionClusterService.buildSidepanelConnectorList(incomingCluster, 'c_cal');
      expect(result.name).toBe('fms-quadruple.rd.cisco.com');
      expect(result.id).toBe('1107700c-2eeb-11e6-8ebd-005056b10bf7');
      expect(result.hosts.length).toBe(4);
      expect(result.hosts[0].connectors[0].connectorType).not.toBe('c_ucmc');
      expect(result.hosts[0].connectors.length).toBe(2);
      expect(result.hosts[1].connectors.length).toBe(2);
      expect(result.hosts[0].connectors[0].state).toBe('running');
      expect(result.hosts[0].connectors[0].hostSerial).toBe(result.hosts[0].connectors[1].hostSerial);
    });

  });

  describe('getReleaseNotes()', function () {

    it('should return release notes', function () {
      $httpBackend
        .when('GET', 'http://elg.no/organizations/0FF1C3/channels/GA/packages/c_cal?fields=@wide')
        .respond({
          releaseNotes: 'Example calendar connector release notes.'
        });

      var callback = sinon.stub();
      FusionClusterService.getReleaseNotes('GA', 'c_cal').then(callback);
      $httpBackend.flush();

      expect(callback.callCount).toBe(1);
      expect(callback.getCall(0).args[0]).toBe('Example calendar connector release notes.');
    });

  });

  describe('processClustersToAggregateStatusForService()', function () {

    var twoClusters;
    beforeEach(function () {
      jasmine.getJSONFixtures().clearCache(); // See https://github.com/velesin/jasmine-jquery/issues/239
      twoClusters = getJSONFixture('hercules/fusion-cluster-service-test-clusters.json');
    });

    it('should return *operational* when all hosts are *running*', function () {
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-uc', twoClusters)).toBe('operational');
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-mgmt', twoClusters)).toBe('operational');
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('operational');
    });

    it('should return *outage* if all clusters have their Calendar Connectors stopped', function () {
      twoClusters[0].servicesStatuses[2].state.name = 'stopped';
      twoClusters[1].servicesStatuses[2].state.name = 'stopped';
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('outage');
    });

    it('should return *outage* if all clusters have their Calendar Connectors disabled', function () {
      twoClusters[0].servicesStatuses[2].state.name = 'disabled';
      twoClusters[1].servicesStatuses[2].state.name = 'disabled';
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('outage');
    });

    it('should return *outage* if all clusters have their Calendar Connectors not_configured', function () {
      twoClusters[0].servicesStatuses[2].state.name = 'not_configured';
      twoClusters[1].servicesStatuses[2].state.name = 'not_configured';
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('outage');
    });

    it('should return *outage* if all clusters have their Calendar Connectors in a mix of "red" states', function () {
      twoClusters[0].servicesStatuses[2].state.name = 'stopped';
      twoClusters[1].servicesStatuses[2].state.name = 'offline';
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('outage');
    });

    it('should return *degraded* if Calendar connectors in exactly one cluster have alarms but connectors are otherwise fine', function () {
      twoClusters[1].servicesStatuses[2].state.name = 'has_alarms';
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('impaired');
    });

    it('should return *degraded* if Calendar connectors in all clusters have alarms but connectors are otherwise fine', function () {
      twoClusters[0].servicesStatuses[2].state.name = 'has_alarms';
      twoClusters[1].servicesStatuses[2].state.name = 'has_alarms';
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('impaired');
    });

    it('should return *outage* if one cluster is not_configured and one cluster is not_operational', function () {
      twoClusters[0].servicesStatuses[2].state.name = 'not_operational';
      twoClusters[1].servicesStatuses[2].state.name = 'not_configured';
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('outage');
    });

    it('should return *degraded* if one host is *running* and one is *not_operational*', function () {
      twoClusters[0].servicesStatuses[2].state.name = 'not_operational';
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('impaired');
    });

    it('should return *degraded* if no connector is running, even when the statuses are temporary', function () {
      twoClusters[0].servicesStatuses[2].state.name = 'downloading';
      twoClusters[1].servicesStatuses[2].state.name = 'downloading';
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('impaired');
    });

    it('should return *operational* during an upgrade the other cluster has at least one running connector', function () {
      twoClusters[0].servicesStatuses[2].state.name = 'downloading';
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('operational');
      twoClusters[0].servicesStatuses[2].state.name = 'installing';
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('operational');
    });

    it('should not let Call Connector statuses impact Calendar Connector aggregation', function () {
      twoClusters[0].servicesStatuses[1].state.name = 'offline';
      twoClusters[0].servicesStatuses[1].state.name = 'offline';
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-cal', twoClusters)).toBe('operational');
    });

    it('should handle invalid service types by falling back to *outage*', function () {
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-invalid-service', twoClusters)).toBe('outage');
    });

    it('should handle invalid cluster lists by falling back to *outage*', function () {
      var malformedClusterList = {
        clusters: 'not exactly a valid list of clusters'
      };
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-call', malformedClusterList)).toBe('outage');
    });

    it('should return *outage* when all hosts are *upgrading*', function () {
      twoClusters[0].servicesStatuses[2].serviceId = 'squared-fusion-media';
      twoClusters[0].servicesStatuses[2].state.name = 'upgrading';
      twoClusters[1].servicesStatuses[2].serviceId = 'squared-fusion-media';
      twoClusters[1].servicesStatuses[2].state.name = 'upgrading';
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-media', twoClusters)).toBe('outage');
    });

    it('should return *impaired* if one host is *running* and one is *upgrading*', function () {
      twoClusters[0].servicesStatuses[2].serviceId = 'squared-fusion-media';
      twoClusters[0].servicesStatuses[2].state.name = 'running';
      twoClusters[1].servicesStatuses[2].serviceId = 'squared-fusion-media';
      twoClusters[1].servicesStatuses[2].state.name = 'upgrading';
      expect(FusionClusterService.processClustersToAggregateStatusForService('squared-fusion-media', twoClusters)).toBe('impaired');
    });
  });

  describe('processClustersToSeeIfServiceIsSetup()', function () {

    describe('Org with Call and Calendar', function () {

      // Test cluster: Two clusters where Call is installed on one cluster, and Calendar is installed on both clusters
      var baseClusters;
      beforeEach(function () {
        jasmine.getJSONFixtures().clearCache(); // See https://github.com/velesin/jasmine-jquery/issues/239
        baseClusters = getJSONFixture('hercules/fusion-cluster-service-test-clusters.json');
      });

      it('should find that Call is enabled', function () {
        expect(FusionClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-uc', baseClusters)).toBe(true);
      });

      it('should find that Calendar is enabled', function () {
        expect(FusionClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-cal', baseClusters)).toBe(true);
      });

      it('should find that Management is enabled', function () {
        expect(FusionClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-mgmt', baseClusters)).toBe(true);
      });

      it('should find that InvalidService is *not* enabled', function () {
        expect(FusionClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-invalid-service', baseClusters)).toBe(false);
      });

      it('should find that Media is *not* enabled in the base cluster list', function () {
        expect(FusionClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-media', baseClusters)).toBe(false);
      });
    });

    describe('Disco Systems, an org with Call, Calendar, and Media,', function () {

      // Test clusters: Disco Systems, org
      var discothequeClusters;
      beforeEach(function () {
        jasmine.getJSONFixtures().clearCache(); // See https://github.com/velesin/jasmine-jquery/issues/239
        discothequeClusters = getJSONFixture('hercules/disco-systems-cluster-list.json');
      });

      it('should find that Media is enabled in the Discotheque org', function () {
        expect(FusionClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-media', discothequeClusters)).toBe(true);
      });

      it('should find that Call is enabled in the Discotheque org', function () {
        expect(FusionClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-uc', discothequeClusters)).toBe(true);
      });

      it('should find that Calendar is enabled in the Discotheque org', function () {
        expect(FusionClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-cal', discothequeClusters)).toBe(true);
      });

    });

    describe('An org with nothing at all,', function () {

      // Test clusters: Two clusters, with nothing provisioned and nothing installed
      var clustersWithNothingInstalled;
      beforeEach(function () {
        jasmine.getJSONFixtures().clearCache(); // See https://github.com/velesin/jasmine-jquery/issues/239
        clustersWithNothingInstalled = getJSONFixture('hercules/nothing-provisioned-cluster-list.json');
      });

      it('should find that Media is *dis*-abled', function () {
        expect(FusionClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-media', clustersWithNothingInstalled)).toBe(false);
      });

      it('should find that Call is *dis*-abled', function () {
        expect(FusionClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-uc', clustersWithNothingInstalled)).toBe(false);
      });

      it('should find that Calendar is *dis*-abled', function () {
        expect(FusionClusterService.processClustersToSeeIfServiceIsSetup('squared-fusion-cal', clustersWithNothingInstalled)).toBe(false);
      });

    });

  });

  describe('getResourceGroups()', function () {
    beforeEach(function () {
      jasmine.getJSONFixtures().clearCache(); // See https://github.com/velesin/jasmine-jquery/issues/239
      var org = getJSONFixture('hercules/org-with-resource-groups.json');
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3?fields=@wide').respond(org);
    });

    afterEach(function () {
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('extract unassigned clusters and sort them by name', function () {
      FusionClusterService.getResourceGroups(function (response) {
        expect(response.unassigned.length).toBe(3);
        expect(response.unassigned[0].name).toBe('Augusta National Golf Club');
        expect(response.unassigned[2].name).toBe('Tom er en hippie');
      });
    });

    it('extract resource groups and put clusters inside, sorted by name', function () {
      FusionClusterService.getResourceGroups(function (response) {
        expect(response.groups.length).toBe(4);
        expect(response.groups[0].name).toBe('ACE');
        expect(response.groups[0].clusters.length).toBe(1);
        expect(response.groups[3].name).toBe('🐷');
      });
    });
  });

});
