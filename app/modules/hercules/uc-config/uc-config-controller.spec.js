'use strict';

describe('UConfigController', function () {
  beforeEach(module('Hercules'));

  var ussService, controller, $scope, notification, Authinfo;

  beforeEach(inject(function (_$controller_) {
    $scope = {
      $watch: sinon.stub()
    };
    ussService = {
      getOrg: sinon.stub(),
      updateOrg: sinon.stub()
    };
    notification = {
      notify: sinon.stub()
    };
    Authinfo = {
      getOrgId: sinon.stub()
    };
    controller = _$controller_('UCConfigController', {
      $scope: $scope,
      USSService: ussService,
      XhrNotificationService: notification,
      Authinfo: Authinfo
    });
  }));

  it('updates sipDomain', function () {
    $scope.org = {
      id: 'foo',
      sipDomain: 'bar'
    };
    $scope.$parent = {
      modal: {
        close: sinon.stub()
      }
    };
    expect(ussService.updateOrg.callCount).toBe(0);
    expect($scope.saving).toBe(false);

    $scope.update();
    expect($scope.saving).toBe(true);
    expect(ussService.updateOrg.callCount).toBe(1);
    expect(ussService.updateOrg.args[0][0].id).toBe('foo');
    expect(ussService.updateOrg.args[0][0].sipDomain).toBe('bar');

    ussService.updateOrg.callArgWith(1, null);
    expect($scope.saving).toBe(false);
    expect(notification.notify.callCount).toBe(0);
    expect($scope.$parent.modal.close.callCount).toBe(1);
  });

  it('error is set when update fails', function () {
    $scope.org = {
      id: 'foo',
      sipDomain: 'bar'
    };
    $scope.update();
    expect(ussService.updateOrg.callCount).toBe(1);
    expect(ussService.updateOrg.args[0][0].id).toBe('foo');
    expect(ussService.updateOrg.args[0][0].sipDomain).toBe('bar');
    expect($scope.saving).toBe(true);

    ussService.updateOrg.callArgWith(1, ['err']);
    expect($scope.error).toBeTruthy();
    expect($scope.saving).toBe(false);
  });

});
