'use strict';

describe('ClusterProxy', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var clusterProxy, connectorService, $interval, fetchDeferral, deleteDeferral, $rootScope;

  beforeEach(function () {
    module(function ($provide) {
      connectorService = {
        fetch: sinon.stub(),
        deleteHost: sinon.stub(),
        upgradeSoftware: sinon.stub()
      };
      $provide.value('ConnectorService', connectorService);
    });
  });

  beforeEach(inject(function ($q, $injector, _$interval_, _ClusterProxy_, _$rootScope_) {
    $rootScope = _$rootScope_;
    fetchDeferral = $q.defer();
    deleteDeferral = $q.defer();
    connectorService.fetch.returns(fetchDeferral.promise);
    connectorService.deleteHost.returns(deleteDeferral.promise);
    $interval = _$interval_;
    clusterProxy = _ClusterProxy_;
    $injector.get('$httpBackend').when('GET', 'l10n/en_US.json').respond({});
  }));

  function resolveFetch(data) {
    fetchDeferral.resolve(data);
    $rootScope.$apply();
  }

  function resolveDelete(data) {
    deleteDeferral.resolve(data);
    $rootScope.$apply();
  }

  it('should start and stop polling', function () {
    expect(clusterProxy._isPolling()).toBeFalsy();

    clusterProxy.startPolling();
    expect(clusterProxy._isPolling()).toBeTruthy();

    clusterProxy.startPolling();
    expect(clusterProxy._isPolling()).toBeTruthy();

    clusterProxy.stopPolling();
    expect(clusterProxy._isPolling()).toBeTruthy();

    clusterProxy.stopPolling();
    expect(clusterProxy._isPolling()).toBeFalsy();

    clusterProxy.stopPolling();
    expect(clusterProxy._isPolling()).toBeFalsy();
  });

  it('should return data after service is started', function () {
    expect(clusterProxy.getClusters().clusters.length).toBe(0);

    clusterProxy.startPolling();
    $interval.flush(10000);
    expect(connectorService.fetch.callCount).toBe(1);

    resolveFetch([{
      id: 'foo'
    }]);

    expect(clusterProxy.getClusters().clusters.length).toBe(1);
    expect(clusterProxy.getClusters().clusters[0].id).toBe('foo');
  });

  it('should poll', function () {
    $interval.flush(2000);
    expect(connectorService.fetch.callCount).toBe(0);

    clusterProxy.startPolling();
    $interval.flush(2000);
    expect(connectorService.fetch.callCount).toBe(1);

    resolveFetch([{
      id: 'foo'
    }]);

    $interval.flush(2000);
    expect(connectorService.fetch.callCount).toBe(2);
  });

  it('should delete host and poll', function () {
    clusterProxy.startPolling();
    var cb = sinon.stub();
    clusterProxy.deleteHost('clusterId', 'serial').then(cb);

    resolveDelete();

    expect(connectorService.fetch.callCount).toBe(1);

    resolveFetch();

    expect(cb.callCount).toBe(1);
  });

  it('should allow callback to be passed to start', function () {
    var cb = sinon.stub();
    clusterProxy.startPolling(cb);

    $interval.flush(2000);

    resolveFetch([{}]);

    expect(cb.callCount).toBe(1);
  });

});
