describe('FusionSetupCtrl', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $scope, $interval, controller, service;

  beforeEach(inject(function (_$controller_) {
    $scope = {
      $on: sinon.stub()
    };
    $interval = sinon.stub();
    $interval.cancel = sinon.stub();
    service = {
      fetch: sinon.stub(),
      services: sinon.stub(),
      upgradeSoftware: sinon.stub()
    }
    controller = _$controller_('FusionSetupCtrl', {
      $scope: $scope,
      $interval: $interval,
      ConnectorService: service
    });
  }));

  it('fetches initial data', function () {
    expect(service.fetch.calledOnce).toEqual(true);
    service.fetch.callArgWith(0, null, 'foo');
    expect($scope.clusters).toEqual('foo');
    expect($interval.calledOnce).toEqual(true);
  });

  it('stops polling on error', function () {
    $scope._poll = sinon.stub()
    service.fetch.callArgWith(0, 'err', 'foo');
    expect($scope._poll.callCount).toEqual(0);
  });

  it('clears interval on destroy', function () {
    expect($scope.$on.calledOnce).toEqual(true);
    expect($interval.cancel.callCount).toEqual(0);
    $scope.$on.callArg(1);
    expect($interval.cancel.callCount).toEqual(1);
    expect($scope._promise).toBe(null);
  });

  it('does not poll if inteval has been cleared', function () {
    $scope._promise = null;
    $scope._poll();
    expect($scope._promise).toBe(null);
  });

  it('set default data if server borks', function () {
    expect(service.fetch.calledOnce).toEqual(true);
    service.fetch.callArgWith(0, null, null);
    expect($scope.clusters).toEqual([]);
  });

});
