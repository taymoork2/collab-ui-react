describe('DashboardController', function() {
  beforeEach(module('wx2AdminWebClientApp'));

  var $scope, controller, notification, service;

  beforeEach(inject(function(_$controller_){
    notification = {
      notify: sinon.stub()
    }
    service = {
      fetch: sinon.stub(),
      services: sinon.stub(),
      upgradeSoftware: sinon.stub()
    }
    $scope = {}
    controller = _$controller_('DashboardController', {
      $scope: $scope,
      ConnectorService: service,
      Notification: notification
    });
  }));

  it('initializes scope.loading and fetches initial data', function() {
    expect($scope.loading).toEqual(true);
    expect(service.fetch.calledOnce).toEqual(true);

    service.fetch.callArgWith(0, null, 'clusterdata');
    expect($scope.loading).toEqual(false);
    expect($scope.clusters).toBe('clusterdata');
    expect(notification.notify.callCount).toEqual(0);
  });

  it('returns empty array on fubar data from backend', function() {
    service.fetch.callArgWith(0, null, null);
    expect($scope.clusters).toEqual([]);
  });

  it('reloads data on reload', function() {
    expect($scope.loading).toEqual(true);
    expect($scope.inflight).toEqual(true);

    service.fetch.callArgWith(0, null, []);
    expect($scope.loading).toEqual(false);
    expect($scope.inflight).toEqual(false);

    $scope.reload();
    expect($scope.loading).toEqual(false);
    expect($scope.inflight).toEqual(true);

    expect(service.fetch.calledTwice).toBe(true);
  });

  it('upgrades software', function() {
    expect(service.upgradeSoftware.callCount).toBe(0);

    $scope.upgradeSoftware('clusterid', 'servicetype', sinon.stub());

    expect(service.upgradeSoftware.calledOnce).toBe(true);
    expect(service.upgradeSoftware.args[0][0].clusterId).toBe('clusterid');
    expect(service.upgradeSoftware.args[0][0].serviceType).toBe('servicetype');
  });

  it('triggers callback on software upgrade', function() {
    var callback = sinon.stub();
    $scope.reload = sinon.stub()

    $scope.upgradeSoftware('clusterid', 'servicetype', callback);
    expect(callback.callCount).toBe(0);
    expect($scope.reload.callCount).toBe(0);

    service.upgradeSoftware.args[0][0].callback()
    expect(callback.callCount).toBe(1);
    expect($scope.reload.callCount).toBe(1);
  });

  it('updates state on toggle edit', function() {
    expect($scope.editingHost).toBeFalsy();

    $scope.toggleEdit('foo');
    expect($scope.editingHost).toBe('foo');

    $scope.toggleEdit('bar');
    expect($scope.editingHost).toBe('bar');

    $scope.toggleEdit('bar');
    expect($scope.editingHost).toBeFalsy();
  });

  it('deletes host', function() {
    service.deleteHost = sinon.stub();
    expect($scope.deleteHostInflight).toBeFalsy();

    $scope.deleteHost('clusterId', 'serial#');
    expect($scope.deleteHostInflight).toBe(true);
    expect(service.deleteHost.callCount).toBe(1);
    expect(service.deleteHost.args[0][0]).toBe('clusterId');
    expect(service.deleteHost.args[0][1]).toBe('serial#');

    $scope.reload = sinon.stub()
    service.deleteHost.callArgWith(2, null);
    expect($scope.deleteHostInflight).toBe(false);
    expect($scope.reload.callCount).toBe(1);
  });

});
