'use strict';
describe('Service: MediaClusterServiceV2', function () {
  beforeEach(module('wx2AdminWebClientApp'));
  var $httpBackend, $location, Service, converter, authinfo;
  var rootPath = 'https://hercules-integration.wbx2.com/v1/organizations/orgId';
  var herculesUrlV2Path = 'https://hercules-integration.wbx2.com/hercules/api/v2/organizations/orgId';

  beforeEach(inject(function ($injector, _$location_, _MediaClusterServiceV2_, _Authinfo_) {
    authinfo = _Authinfo_;
    authinfo.getOrgId = sinon.stub().returns("orgId");
    Service = _MediaClusterServiceV2_;
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('GET', 'l10n/en_US.json').respond({});
    $location = _$location_;
  }));
  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
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
