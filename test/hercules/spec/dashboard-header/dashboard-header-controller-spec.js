describe('DashboardHeaderController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $scope, aggregator;

  beforeEach(inject(function (_$controller_) {
    $scope = {
      $watch: sinon.stub()
    };
    service = {
      services: sinon.stub()
    }
    aggregator = {
      aggregateServices: sinon.stub()
    }
    controller = _$controller_('DashboardHeaderController', {
      $scope: $scope,
      ServiceDescriptor: service,
      DashboardAggregator: aggregator
    });
  }));

  it('does its magic', function () {
    expect(service.services.calledOnce).toEqual(true);
    service.services.callArgWith(0, 'foo');
    expect($scope.services).toEqual('foo');

    expect(aggregator.aggregateServices.callCount).toBe(0);
    expect($scope.serviceAggregates).toBe(undefined);
    expect($scope.$watch.calledOnce).toEqual(true);

    expect($scope.serviceAggregates).toBe(undefined);
    aggregator.aggregateServices.returns('baz');
    $scope.$watch.callArgWith(1, 'bar');

    expect(aggregator.aggregateServices.callCount).toBe(1);
    expect($scope.serviceAggregates).toBe('baz');
  });

});
