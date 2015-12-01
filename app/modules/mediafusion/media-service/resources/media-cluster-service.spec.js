'use strict';

describe('Service: MediaClusterService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $httpBackend, $location, Service, converter, authinfo;
  var rootPath = 'https://hercules-integration.wbx2.com/v1/organizations/orgId';

  beforeEach(function () {
    module(function ($provide) {
      converter = {
        convertClusters: sinon.stub()
      };
      authinfo = {
        getOrgId: sinon.stub()
      };
      authinfo.getOrgId.returns("orgId");
      $provide.value('MediaConverterService', converter);
      $provide.value('Authinfo', authinfo);
    });
  });

  beforeEach(inject(function ($injector, _$location_, _MediaClusterService_) {
    Service = _MediaClusterService_;
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
      .when('GET', rootPath + '/clusters')
      .respond('foo');

    converter.convertClusters.returns({
      id: 'foo'
    });

    var callback = sinon.stub();
    Service.fetch().then(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].id).toBe('foo');
  });

  it('should be possible to set mock backend', function () {
    $location.search('hercules-backend', 'mock');
    converter.convertClusters.returns('foo');

    var callback = sinon.stub();
    Service.fetch().then(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBe('foo');

    expect(converter.convertClusters.callCount).toBe(1);
    expect(converter.convertClusters.args[0][0].length).toBe(5);
  });

  it('should be possible to set empty backend', function () {
    $location.search('hercules-backend', 'nodata');

    var callback = sinon.stub();
    Service.fetch().then(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].length).toBe(0);
  });

  it('should delete a host', function () {
    $httpBackend
      .when(
        'DELETE',
        rootPath + '/clusters/clusterid/hosts/serial'
      )
      .respond(200);

    var callback = sinon.stub();
    Service.deleteHost('clusterid', 'serial').then(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
  });

  it('should handle host deletion failures', function () {
    $httpBackend
      .when(
        'DELETE',
        rootPath + '/clusters/clusterid/hosts/serial'
      )
      .respond(500);

    var callback = sinon.stub();
    Service.deleteHost('clusterid', 'serial').then(undefined, callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
  });

  it('should call error callback on failure', function () {
    $httpBackend
      .when('GET', rootPath + '/clusters')
      .respond(500, null);

    var callback = sinon.stub();
    Service.fetch().then(null, callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
  });

});
