describe('DashboardHeaderController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $scope, aggregator;

  beforeEach(inject(function (_$controller_) {
    $scope = {
      $watch: sinon.stub()
    };
    service = {
      services: sinon.stub()
    };
    controller = _$controller_('EntitledServicesController', {
      $scope: $scope,
      ServiceDescriptor: service
    });
  }));

  it('does its magic', function () {
    expect($scope.services).toEqual(undefined);
    expect(service.services.callCount).toBe(1);

    service.services.callArgWith(0, 'bar');
    expect($scope.services).toEqual('bar');
  });

});
