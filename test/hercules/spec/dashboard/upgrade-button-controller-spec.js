describe('UpgradeButtonController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $scope, $attrs, controller;

  beforeEach(inject(function (_$controller_) {
    $scope = {
      $on: sinon.stub()
    };
    $attrs = {};
    controller = _$controller_('UpgradeButtonController', {
      $attrs: $attrs,
      $scope: $scope
    });
  }));

  it('upgrades software with inflight status set', function () {
    $attrs.clusterId = 'cl_id';
    $attrs.serviceType = 'srv_type';
    $scope.upgradeSoftware = sinon.stub();
    expect($scope.inflight).toEqual(false);
    expect($scope.upgradeSoftware.callCount).toEqual(0);

    $scope.upgradeClicked();

    expect($scope.inflight).toEqual(true);
    expect($scope.upgradeSoftware.callCount).toEqual(1);
    expect($scope.upgradeSoftware.args[0][0]).toEqual('cl_id');
    expect($scope.upgradeSoftware.args[0][1]).toEqual('srv_type');

    $scope.upgradeSoftware.args[0][2]();
    expect($scope.inflight).toEqual(false);
  });

});
