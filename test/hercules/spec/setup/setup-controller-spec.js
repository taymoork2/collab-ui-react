describe('Hercules: SetupController', function() {
  beforeEach(module('wx2AdminWebClientApp'));

  var $scope, $interval, controller, service;

  beforeEach(inject(function(_$controller_){
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

  it('fetches initial data', function() {
    expect(service.fetch.calledOnce).toEqual(true);
    service.fetch.callArgWith(0, null, 'foo');
    expect($scope.clusters).toEqual('foo');
    expect($interval.calledOnce).toEqual(true);
  });

  it('clears interval on destroy', function() {
    expect($scope.$on.calledOnce).toEqual(true);
    expect($interval.cancel.callCount).toEqual(0);
    $scope.$on.callArg(1);
    expect($interval.cancel.callCount).toEqual(1);
  });

});
