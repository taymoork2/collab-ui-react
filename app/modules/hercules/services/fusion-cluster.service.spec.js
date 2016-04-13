'use strict';

describe('Service: ExampleService', function () {
  var FusionClusterService, $httpBackend;

  beforeEach(module('Hercules'));
  beforeEach(module(mockDependencies));
  beforeEach(inject(dependencies));
  afterEach(verifyHttpBackend);

  function dependencies(_$httpBackend_, _FusionClusterService_) {
    $httpBackend = _$httpBackend_;
    FusionClusterService = _FusionClusterService_;
  }

  function mockDependencies($provide) {
    var Authinfo = {
      getOrgId: sinon.stub().returns('0FF1C3')
    };
    $provide.value('Authinfo', Authinfo);
    var UrlConfig = {
      getHerculesUrlV2: sinon.stub().returns('http://elg.no')
    };
    $provide.value('UrlConfig', UrlConfig);
  }

  function verifyHttpBackend() {
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  }

  describe('getAll()', function () {
    it('should call the right backend', function () {
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3?fields=@wide').respond([]);
      FusionClusterService.getAll();
    });

    it('should filter out non-fused clusters', function () {
      $httpBackend
        .when('GET', 'http://elg.no/organizations/0FF1C3?fields=@wide')
        .respond([{
          state: 'fused',
          connectors: []
        },
        {
          state: 'defused',
          connectors: []
        }]);
      FusionClusterService.getAll()
        .then(function (clusters) {
          expect(clusters.length).toBe(1);
        });
    });

    it('should add servicesStatuses property to each cluster', function () {
      $httpBackend
        .when('GET', 'http://elg.no/organizations/0FF1C3?fields=@wide')
        .respond([{
          state: 'fused',
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
        }]);
      FusionClusterService.getAll()
        .then(function (clusters) {
          expect(clusters[0].servicesStatuses[0].state.label).toBe('error');
          expect(clusters[0].servicesStatuses[0].total).toBe(2);
          expect(clusters[0].servicesStatuses[1].total).toBe(0);
          expect(clusters[0].servicesStatuses[2].total).toBe(0);
        });
    });
  });
});
