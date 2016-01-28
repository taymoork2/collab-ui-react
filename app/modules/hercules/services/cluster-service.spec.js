'use strict';

describe('Service: ClusterService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $httpBackend, $location, Service, authinfo;
  var rootPath = 'https://hercules-integration.wbx2.com/v1/organizations/orgId';

  beforeEach(function () {
    module(function ($provide) {
      authinfo = {
        getOrgId: sinon.stub()
      };
      authinfo.getOrgId.returns('orgId');
      $provide.value('Authinfo', authinfo);
    });
  });

  beforeEach(inject(function ($injector, _$location_, _ClusterService_) {
    Service = _ClusterService_;
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});
    $location = _$location_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should fetch and return data from the correct backend', function () {
    $httpBackend
      .when('GET', rootPath + '?fields=@wide')
      .respond({
        id: 'org_0',
        name: 'Org',
        clusters: [{
          id: 'cluster_0',
          name: 'Cluster',
          connectors: [{
            alarms: [],
            hostname: 'host.example.com',
            state: 'running',
            connectorType: 'c_mgmt'
          }]
        }]
      });

    var callback = sinon.stub();
    Service.fetch().then(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    var clusterCache = callback.args[0][0];
    expect(clusterCache['cluster_0']).toBeDefined();
  });

  it('should upgrade software using the correct backend', function () {
    $httpBackend.when('GET', rootPath + '?fields=@wide').respond({}); // please $httpBackend
    $httpBackend
      .when('POST', rootPath + '/clusters/foo/services/bar/upgrade', {})
      .respond({
        foo: 'bar'
      });

    var callback = sinon.stub();
    Service.upgradeSoftware('foo', 'bar').then(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].foo).toBe('bar');
  });

  it('software upgrade should fail on 500 errors', function () {
    $httpBackend.when('GET', rootPath + '?fields=@wide').respond({}); // please $httpBackend
    $httpBackend
      .when('POST', rootPath + '/clusters/foo/services/bar/upgrade', {})
      .respond(500, {
        foo: 'bar'
      });

    var callback = sinon.stub();
    Service.upgradeSoftware('foo', 'bar').then(undefined, callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).not.toBe(null);
  });

  it('should delete a host', function () {
    $httpBackend.when('GET', rootPath + '?fields=@wide').respond({}); // please $httpBackend
    $httpBackend
      .when('DELETE', rootPath + '/clusters/clusterid/hosts/serial')
      .respond(200);

    var callback = sinon.stub();
    Service.deleteHost('clusterid', 'serial').then(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
  });

  it('should handle host deletion failures', function () {
    $httpBackend.when('GET', rootPath + '?fields=@wide').respond({}); // please $httpBackend
    $httpBackend
      .when('DELETE', rootPath + '/clusters/clusterid/hosts/serial')
      .respond(500);

    var callback = sinon.stub();
    Service.deleteHost('clusterid', 'serial').then(undefined, callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
  });

  it('should call error callback on failure', function () {
    $httpBackend
      .when('GET', rootPath + '?fields=@wide')
      .respond(500, null);

    var callback = sinon.stub();
    Service.fetch().then(null, callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
  });

});
