import moduleName, { ResourceGroupService } from 'modules/hercules/services/resource-group.service';
import { ConnectorType } from 'modules/hercules/hybrid-services.types';

describe('Service: ResourceGroupService', function () {
  let ResourceGroupService: ResourceGroupService, $httpBackend, $rootScope, HybridServicesClusterService, $q;

  beforeEach(angular.mock.module(moduleName));
  beforeEach(angular.mock.module(mockDependencies));
  beforeEach(inject(dependencies));

  function dependencies(_$rootScope_, _$httpBackend_, _ResourceGroupService_, _HybridServicesClusterService_, _$q_) {
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    ResourceGroupService = _ResourceGroupService_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    $q = _$q_;
  }

  function mockDependencies($provide) {
    const Authinfo = {
      getOrgId: jasmine.createSpy('Authinfo.getOrgId').and.returnValue('0FF1C3'),
    };
    $provide.value('Authinfo', Authinfo);
    const UrlConfig = {
      getHerculesUrlV2: jasmine.createSpy('Authinfo.getHerculesUrlV2').and.returnValue('http://elg.no'),
      getUssUrl: jasmine.createSpy('Authinfo.getUssUrl').and.returnValue('http://whatever.no/'),
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
      let resolvedValue;
      const resourceGroupId = '';
      const connectorType = 'c_cal';

      spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve([]));
      ResourceGroupService.resourceGroupHasEligibleCluster(resourceGroupId, connectorType)
        .then((hasEligibleCluster) => {
          resolvedValue = hasEligibleCluster;
        });
      $rootScope.$apply();

      expect(resolvedValue).toBe(false);

    });

    it('should return true when there are one or more connectors of the correct type in the Resource Group', function () {
      let resolvedValue;
      const clusterList = getJSONFixture('hercules/clusters-for-resource-group-testing.json');
      const resourceGroupId = '2c2bdd6d-8149-4090-bbb6-fd87edd5416f';
      const connectorType = 'c_cal';

      spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve(clusterList));
      ResourceGroupService.resourceGroupHasEligibleCluster(resourceGroupId, connectorType)
        .then((hasEligibleCluster) => {
          resolvedValue = hasEligibleCluster;
        });
      $rootScope.$apply();

      expect(resolvedValue).toBe(true);
    });

    it('should return false when there are no connectors of the correct type in the Resource Group', function () {
      let resolvedValue;
      const clusterList = getJSONFixture('hercules/clusters-for-resource-group-testing.json');
      const resourceGroupId = '00e48fd5-4d2e-4f24-b5a8-80e14aa06a01';
      const connectorType = 'c_cal';

      spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve(clusterList));
      ResourceGroupService.resourceGroupHasEligibleCluster(resourceGroupId, connectorType)
        .then((hasEligibleCluster) => {
          resolvedValue = hasEligibleCluster;
        });
      $rootScope.$apply();

      expect(resolvedValue).toBe(false);
    });

    it('should return true when there are one or more connectors of the correct type and there is no Resource Group', function () {
      let resolvedValue;
      const clusterList = getJSONFixture('hercules/clusters-for-resource-group-testing.json');
      const resourceGroupId = '';
      const connectorType = 'c_cal';

      spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve(clusterList));
      ResourceGroupService.resourceGroupHasEligibleCluster(resourceGroupId, connectorType)
        .then((hasEligibleCluster) => {
          resolvedValue = hasEligibleCluster;
        });
      $rootScope.$apply();

      expect(resolvedValue).toBe(true);
    });

    it('should return false when the connectorType is invalid', function () {
      let resolvedValue;
      const clusterList = getJSONFixture('hercules/clusters-for-resource-group-testing.json');
      const resourceGroupId = '2c2bdd6d-8149-4090-bbb6-fd87edd5416f';
      const connectorType = 'c_jose_mourinho';

      spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve(clusterList));

      ResourceGroupService.resourceGroupHasEligibleCluster(resourceGroupId, (connectorType as ConnectorType))
        .then((hasEligibleCluster) => {
          resolvedValue = hasEligibleCluster;
        });
      $rootScope.$apply();

      expect(resolvedValue).toBe(false);
    });

  });

});
