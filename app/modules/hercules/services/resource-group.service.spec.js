'use strict';

describe('Service: ResourceGroupService', function () {
  var ResourceGroupService, $httpBackend, $rootScope, FusionClusterService, $q;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('core.urlconfig'));
  beforeEach(angular.mock.module(mockDependencies));
  beforeEach(inject(dependencies));

  function dependencies(_$rootScope_, _$httpBackend_, _ResourceGroupService_, _FusionClusterService_, _$q_) {
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    ResourceGroupService = _ResourceGroupService_;
    FusionClusterService = _FusionClusterService_;
    $q = _$q_;
  }

  function mockDependencies($provide) {
    var Authinfo = {
      getOrgId: sinon.stub().returns('0FF1C3'),
    };
    $provide.value('Authinfo', Authinfo);
    var UrlConfig = {
      getHerculesUrlV2: sinon.stub().returns('http://elg.no'),
      getUssUrl: sinon.stub().returns('http://whatever.no/'),
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

    it('should call the right backend with no orgId', function () {
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3/resourceGroups').respond([]);
      ResourceGroupService.getAll();
    });

    it('should call the right backend when orgId is given', function () {
      $httpBackend.expectGET('http://elg.no/organizations/ladida/resourceGroups').respond([]);
      ResourceGroupService.getAll('ladida');
    });

  });

  describe('get()', function () {

    afterEach(verifyHttpBackend);

    function verifyHttpBackend() {
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    }

    it('should call the right backend with no orgId', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/0FF1C3/resourceGroups/myResourceGroup')
        .respond(200, 'dummy response');
      ResourceGroupService.get('myResourceGroup');
    });

    it('should call the right backend when orgId is given', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/ladida/resourceGroups/myResourceGroup')
        .respond(200, 'dummy response');
      ResourceGroupService.get('myResourceGroup', 'ladida');
    });

  });

  describe('resourceGroupHasEligibleCluster()', function () {

    it('should return false when there are no clusters', function () {
      var resolvedValue;
      var resourceGroupId = '';
      var connectorType = 'c_cal';

      spyOn(FusionClusterService, 'getAll').and.returnValue($q.resolve([]));
      ResourceGroupService.resourceGroupHasEligibleCluster(resourceGroupId, connectorType)
        .then(function (hasEligibleCluster) {
          resolvedValue = hasEligibleCluster;
        });
      $rootScope.$apply();

      expect(resolvedValue).toBe(false);

    });

    it('should return true when there are one or more connectors of the correct type in the Resource Group', function () {
      var resolvedValue;
      var clusterList = getJSONFixture('hercules/clusters-for-resource-group-testing.json');
      var resourceGroupId = '2c2bdd6d-8149-4090-bbb6-fd87edd5416f';
      var connectorType = 'c_cal';

      spyOn(FusionClusterService, 'getAll').and.returnValue($q.resolve(clusterList));
      ResourceGroupService.resourceGroupHasEligibleCluster(resourceGroupId, connectorType)
        .then(function (hasEligibleCluster) {
          resolvedValue = hasEligibleCluster;
        });
      $rootScope.$apply();

      expect(resolvedValue).toBe(true);
    });

    it('should return false when there are no connectors of the correct type in the Resource Group', function () {
      var resolvedValue;
      var clusterList = getJSONFixture('hercules/clusters-for-resource-group-testing.json');
      var resourceGroupId = '00e48fd5-4d2e-4f24-b5a8-80e14aa06a01';
      var connectorType = 'c_cal';

      spyOn(FusionClusterService, 'getAll').and.returnValue($q.resolve(clusterList));
      ResourceGroupService.resourceGroupHasEligibleCluster(resourceGroupId, connectorType)
        .then(function (hasEligibleCluster) {
          resolvedValue = hasEligibleCluster;
        });
      $rootScope.$apply();

      expect(resolvedValue).toBe(false);
    });

    it('should return true when there are one or more connectors of the correct type and there is no Resource Group', function () {
      var resolvedValue;
      var clusterList = getJSONFixture('hercules/clusters-for-resource-group-testing.json');
      var resourceGroupId = '';
      var connectorType = 'c_cal';

      spyOn(FusionClusterService, 'getAll').and.returnValue($q.resolve(clusterList));
      ResourceGroupService.resourceGroupHasEligibleCluster(resourceGroupId, connectorType)
        .then(function (hasEligibleCluster) {
          resolvedValue = hasEligibleCluster;
        });
      $rootScope.$apply();

      expect(resolvedValue).toBe(true);
    });

    it('should return false when the connectorType is invalid', function () {
      var resolvedValue;
      var clusterList = getJSONFixture('hercules/clusters-for-resource-group-testing.json');
      var resourceGroupId = '2c2bdd6d-8149-4090-bbb6-fd87edd5416f';
      var connectorType = 'c_jose_mourinho';

      spyOn(FusionClusterService, 'getAll').and.returnValue($q.resolve(clusterList));

      ResourceGroupService.resourceGroupHasEligibleCluster(resourceGroupId, connectorType)
        .then(function (hasEligibleCluster) {
          resolvedValue = hasEligibleCluster;
        });
      $rootScope.$apply();

      expect(resolvedValue).toBe(false);
    });

  });

});
