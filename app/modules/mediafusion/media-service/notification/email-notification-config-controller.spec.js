'use strict';

describe('EmailNotificationConfigController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var service, controller, $scope, notification, validator;

  beforeEach(inject(function (_$controller_) {
    $scope = {
      $watch: sinon.stub()
    };
    service = {
      read: sinon.stub(),
      write: sinon.stub()
    };
    notification = {
      notify: sinon.stub()
    };

    controller = _$controller_('EmailNotificationConfigController', {
      $scope: $scope,
      XhrNotificationService: notification,
      EmailNotificationConfigService: service
    });
  }));

  it('reads data and updates scope', function () {
    expect($scope.loading).toBe(true);
    expect(service.read.callCount).toBe(1);
    service.read.callArgWith(0, null, {
      foo: 'bar'
    });
    expect($scope.loading).toBe(false);
    expect($scope.config.foo).toBe('bar');
  });

  it('inits to default object when fetch returns null', function () {
    service.read.callArgWith(0, null, null);
    expect($scope.config).not.toBe(null);
    expect(_.size($scope.config)).toBe(0);
  });

  it('notifies when read fails', function () {
    expect($scope.loading).toBe(true);
    expect(service.read.callCount).toBe(1);
    service.read.callArgWith(0, ['fails'], null);
    expect($scope.loading).toBe(false);
    expect(notification.notify.callCount).toBe(1);
  });

  it('notifies when read fails with default msg', function () {
    expect(service.read.callCount).toBe(1);
    service.read.callArgWith(0, [null, 123], null);
    expect(notification.notify.callCount).toBe(1);
  });

  it('writes data', function () {
    $scope.config = {
      foo: 'bar'
    };
    $scope.$parent = {
      modal: {
        close: sinon.stub()
      }
    };
    expect(service.write.callCount).toBe(0);
    expect($scope.saving).toBe(false);

    $scope.writeConfig();
    expect($scope.saving).toBe(true);
    expect(service.write.callCount).toBe(1);
    expect(service.write.args[0][0].foo).toBe('bar');

    service.write.callArgWith(1, null);
    expect($scope.saving).toBe(false);
    expect(notification.notify.callCount).toBe(0);
    expect($scope.$parent.modal.close.callCount).toBe(1);
  });

  it('notifies when write fails', function () {
    $scope.config = {
      foo: 'bar'
    };
    $scope.writeConfig();
    expect(service.write.callCount).toBe(1);
    expect(service.write.args[0][0].foo).toBe('bar');
    expect($scope.saving).toBe(true);

    service.write.callArgWith(1, ['err']);
    expect(notification.notify.callCount).toBe(1);
    expect($scope.saving).toBe(false);
  });

  it('errors on bad email', function () {
    expect($scope.error).toBeFalsy();
    $scope.config = {
      wx2users: 'bar'
    };
    $scope.writeConfig();
    expect($scope.error).toBeTruthy();
  });

  it('works on good email', function () {
    expect($scope.error).toBeFalsy();
    $scope.config = {
      wx2users: 'foo@bar.com'
    };
    $scope.writeConfig();
    expect($scope.error).toBeFalsy();
  });

});
