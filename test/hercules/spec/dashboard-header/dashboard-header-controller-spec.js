'use strict';

describe('DashboardHeaderController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $scope, aggregator, descriptor;

  beforeEach(inject(function (_$controller_) {
    $scope = {
      $watch: sinon.stub()
    };
    descriptor = {
      services: sinon.stub()
    };
    aggregator = {
      aggregateServices: sinon.stub()
    };
    _$controller_('DashboardHeaderController', {
      $scope: $scope,
      ServiceDescriptor: descriptor,
      DashboardAggregator: aggregator
    });
  }));

  it('does its magic', function () {
    expect(descriptor.services.calledOnce).toEqual(true);
    descriptor.services.callArgWith(0, null, 'foo');

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
