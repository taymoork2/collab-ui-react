'use strict';

describe('SWUpgradeController', function () {
  beforeEach(module('Hercules'));

  var $scope, controller, service;

  beforeEach(inject(function (_$controller_, $rootScope) {
    service = {
      upgradeSoftware: sinon.stub().returns({
        then: sinon.stub()
      })
    };
    $scope = $rootScope.$new();
    $scope.cluster = {
      id: 'clusterid'
    };
    $scope.upgradePackage = {
      service: {
        displayName: 'foo',
        version: '1',
        service_type: 'servicetype'
      },
      releaseNotes: 'foobar'
    };
    controller = _$controller_('SWUpgradeController', {
      $scope: $scope,
      ClusterService: service
    });
  }));

  it('upgrades software', function () {
    expect(service.upgradeSoftware.callCount).toBe(0);

    $scope.upgradeSoftware();

    expect(service.upgradeSoftware.calledOnce).toBe(true);
    expect(service.upgradeSoftware.args[0][0]).toBe('clusterid');
    expect(service.upgradeSoftware.args[0][1]).toBe('servicetype');
  });

  // we dont have a callback anymore, maybe we should?
  // it('triggers callback on software upgrade', function () {
  //   var callback = sinon.stub();
  //   $scope._poll = sinon.stub();

  //   $scope.upgradeSoftware(callback);
  //   expect(callback.callCount).toBe(0);

  //   service.upgradeSoftware.args[0][2]();
  //   service.fetch.callArgWith(0, null, []);

  //   expect(callback.callCount).toBe(1);
  //   expect($scope._poll.callCount).toBe(1);
  // });

});
