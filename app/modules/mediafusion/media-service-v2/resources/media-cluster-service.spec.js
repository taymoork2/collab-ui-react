'use strict';
describe('Service: MediaClusterServiceV2', function () {
  beforeEach(angular.mock.module('Mediafusion'));
  var $httpBackend, $location, Service, converter, authinfo;
  var $rootScope;
  var rootPath = 'https://hercules-integration.wbx2.com/v1/organizations/orgId';
  var herculesUrlV2Path = 'https://hercules-integration.wbx2.com/hercules/api/v2/organizations/orgId';
  beforeEach(function () {
    angular.mock.module(function ($provide) {
      converter = {
        convertClusters: sinon.stub()
      };
      $provide.value('MediaConverterServiceV2', converter);
    });
  });
  beforeEach(inject(function ($injector, _$location_, _MediaClusterServiceV2_, _Authinfo_) {
    authinfo = _Authinfo_;
    authinfo.getOrgId = sinon.stub().returns("orgId");
    Service = _MediaClusterServiceV2_;
    $httpBackend = $injector.get('$httpBackend');
    $rootScope = $injector.get('$rootScope');
    $location = _$location_;
  }));
  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
  it('should fetch and return data from the correct backend', function () {
    $httpBackend.when('GET', rootPath + '/clusters').respond('foo');
    converter.convertClusters.returns({
      id: 'foo'
    });
    var callback = sinon.stub();
    Service.fetch().then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
    //   expect(callback.args[0][0].id).toBe('foo');
  });
  it('should be possible to set mock backend', function () {
    $location.search('mediaservice-backend', 'mock');
    converter.convertClusters.returns('foo');
    var callback = sinon.stub();
    Service.fetch().then(callback);
    $rootScope.$apply();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBe('foo');
    expect(converter.convertClusters.callCount).toBe(1);
    expect(converter.convertClusters.args[0][0].length).toBe(5);
  });
  it('should be possible to set empty backend', function () {
    $location.search('mediaservice-backend', 'nodata');
    var callback = sinon.stub();
    Service.fetch().then(callback);
    $rootScope.$apply();
    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].length).toBe(0);
  });
  it('should delete a host', function () {
    $httpBackend.when('DELETE', rootPath + '/clusters/clusterid/hosts/serial').respond(200);
    var callback = sinon.stub();
    Service.deleteHost('clusterid', 'serial').then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });
  it('should handle host deletion failures', function () {
    $httpBackend.when('DELETE', rootPath + '/clusters/clusterid/hosts/serial').respond(500);
    var callback = sinon.stub();
    Service.deleteHost('clusterid', 'serial').then(undefined, callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });
  it('should delete a group', function () {
    $httpBackend.when('DELETE', rootPath + '/property_sets/propertysetid').respond(204);
    var callback = sinon.stub();
    Service.deleteGroup('propertysetid').then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });
  it('should handle faliures in deleting a group', function () {
    $httpBackend.when('DELETE', rootPath + '/property_sets/propertysetid').respond(500);
    var callback = sinon.stub();
    Service.deleteGroup('propertysetid').then(undefined, callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });
  it('should update a group assignment', function () {
    $httpBackend.when('POST', rootPath + '/clusters/clusterid/assigned_property_sets').respond(204);
    var callback = sinon.stub();
    Service.updateGroupAssignment('clusterid', 'propertysetid').then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });
  it('should handle failures in updating a group assignment', function () {
    $httpBackend.when('POST', rootPath + '/clusters/clusterid/assigned_property_sets').respond(500);
    var callback = sinon.stub();
    Service.updateGroupAssignment('clusterid', 'propertysetid').then(undefined, callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });
  it('should delete group assignment', function () {
    $httpBackend.when('DELETE', rootPath + '/clusters/clusterid/assigned_property_sets/propertysetid').respond(204);
    var callback = sinon.stub();
    Service.removeGroupAssignment('clusterid', 'propertysetid').then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });
  it('should handle failures in deleting group assignment', function () {
    $httpBackend.when('DELETE', rootPath + '/clusters/clusterid/assigned_property_sets/propertysetid').respond(500);
    var callback = sinon.stub();
    Service.removeGroupAssignment('clusterid', 'propertysetid').then(undefined, callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });
  it('should call error callback on failure', function () {
    $httpBackend.when('GET', rootPath + '/clusters').respond(500, null);
    var callback = sinon.stub();
    Service.fetch().then(null, callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });
  it('should delete v2 cluster', function () {
    $httpBackend.when('DELETE', /^\w+.*/).respond(204);
    var callback = sinon.stub();
    Service.deleteV2Cluster('connectorId').then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });

  it('should update v2 cluster', function () {
    $httpBackend.when('PATCH', /^\w+.*/).respond(204);
    var callback = sinon.stub();
    Service.updateV2Cluster('clusterId', 'clusterName', 'releaseChannel').then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });

  it('should move v2 host', function () {
    $httpBackend.when('POST', /^\w+.*/).respond(204);
    var callback = sinon.stub();
    Service.moveV2Host('connectorId', 'fromCluster', 'toCluster').then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });

  it('should get a given cluster', function () {
    $httpBackend.when('GET', /^\w+.*/).respond({});
    var callback = sinon.stub();
    Service.get('clusterid').then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });
  it('should getall a given cluster', function () {
    $httpBackend.when('GET', /^\w+.*/).respond({});
    var callback = sinon.stub();
    Service.getAll().then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });

  it('should defuse V2 Connector', function () {
    $httpBackend.when('POST', /^\w+.*/).respond(204);
    var callback = sinon.stub();
    Service.defuseV2Connector('connectorId').then(callback);
    $httpBackend.flush();
    expect(callback.callCount).toBe(1);
  });
});
