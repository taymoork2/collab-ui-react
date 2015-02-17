describe('DashboardController', function() {
  beforeEach(module('wx2AdminWebClientApp'));

  var $scope, $interval, controller, service;

  beforeEach(inject(function(_$controller_){
    service = {
      fetch: sinon.stub(),
      services: sinon.stub(),
      upgradeSoftware: sinon.stub()
    }
    $scope = {
      $on: sinon.stub()
    }
    $interval = sinon.stub();
    $interval.cancel = sinon.stub();
    controller = _$controller_('DashboardController', {
      $scope: $scope,
      $interval: $interval,
      ConnectorService: service
    });
  }));

  it('calls poll after fetch success', function() {
    $scope._poll = sinon.stub();
    service.fetch.callArgWith(0, null, 'clusterdata');
    expect($scope._poll.callCount).toBe(1);
  });

  it('resets poll has failed after success', function() {
    $scope.pollHasFailed = true;
    service.fetch.callArgWith(0, null, 'clusterdata');
    expect($scope.pollHasFailed).toBe(false);
  });

  it('does not poll after fetch fail, but shows button', function() {
    $scope._poll = sinon.stub();
    expect($scope.pollHasFailed).toBe(false);
    service.fetch.callArgWith(0, 'err', 'clusterdata');
    expect($scope._poll.callCount).toBe(0);
    expect($scope.pollHasFailed).toBe(true);
  });

  it('polls until interval is nulled', function() {
    $interval.returns(true);
    expect($interval.callCount).toBe(0);
    $scope._poll();
    expect($interval.callCount).toBe(1);
    $scope._poll();
    expect($interval.callCount).toBe(2);
    $scope._promise = null;
    $scope._poll();
    expect($interval.callCount).toBe(2);
  });

  it('clears interval on destroy', function() {
    expect($scope.$on.calledOnce).toEqual(true);
    expect($interval.cancel.callCount).toEqual(0);
    expect($scope._promise).not.toBe(null);
    $scope.$on.callArg(1);
    expect($interval.cancel.callCount).toEqual(1);
    expect($scope._promise).toBe(null);
  });

  it('initializes scope.loading and fetches initial data', function() {
    expect($scope.loading).toEqual(true);
    expect(service.fetch.calledOnce).toEqual(true);

    service.fetch.callArgWith(0, null, 'clusterdata');
    expect($scope.loading).toEqual(false);
    expect($scope.clusters).toBe('clusterdata');
  });

  it('expands all panels except the ones that have been collapsed', function() {
    $scope.panelStates['foo'] = false;
    $scope.panelStates['bar'] = null;

    service.fetch.callArgWith(0, null, [{id: 'foo'},{id: 'bar'},{id: 'baz'}]);
    expect($scope.panelStates['foo']).toBe(false);
    expect($scope.panelStates['bar']).toBe(true);
    expect($scope.panelStates['baz']).toBe(true);
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
    expect(service.upgradeSoftware.args[0][0]).toBe('clusterid');
    expect(service.upgradeSoftware.args[0][1]).toBe('servicetype');
  });

  it('triggers callback on software upgrade', function() {
    var callback = sinon.stub();
    $scope.reload = sinon.stub()

    $scope.upgradeSoftware('clusterid', 'servicetype', callback);
    expect(callback.callCount).toBe(0);
    expect($scope.reload.callCount).toBe(0);

    service.upgradeSoftware.args[0][2]()
    expect($scope.reload.callCount).toBe(1);

    $scope.reload.callArgWith(0, null);
    expect(callback.callCount).toBe(1);
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
    expect($scope.reload.callCount).toBe(1);

    $scope.reload.callArgWith(0, null);
    expect($scope.deleteHostInflight).toBe(false);
  });

  it('updates state on toggle alarms', function() {
    expect(_.size($scope.visibleAlarm)).toBe(0);

    $scope.toggleAlarms('clid', 'srv', 'host');
    expect(_.size($scope.visibleAlarm)).toBe(3);
    expect($scope.visibleAlarm.clusterId).toBe('clid');
    expect($scope.visibleAlarm.serviceType).toBe('srv');
    expect($scope.visibleAlarm.hostName).toBe('host');

    $scope.toggleAlarms('clid', 'srv', 'host2');
    expect(_.size($scope.visibleAlarm)).toBe(3);
    expect($scope.visibleAlarm.clusterId).toBe('clid');
    expect($scope.visibleAlarm.serviceType).toBe('srv');
    expect($scope.visibleAlarm.hostName).toBe('host2');

    $scope.toggleAlarms('clid', 'srv', 'host2');
    expect(_.size($scope.visibleAlarm)).toBe(0);
  });

  it('shows modal', function(){
    expect($scope.modal).toBeFalsy()
    $scope.showNotificationConfigDialog();
    expect($scope.modal).toBeTruthy()
  });

});
