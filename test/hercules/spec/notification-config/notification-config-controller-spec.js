describe('NotificationConfigController', function() {
  beforeEach(module('wx2AdminWebClientApp'));

  var service, controller, $scope, notification;

  beforeEach(inject(function(_$controller_){
    $scope = {
      $watch: sinon.stub()
    };
    service = {
      read: sinon.stub(),
      write: sinon.stub()
    }
    notification = {
      notify: sinon.stub()
    }
    controller = _$controller_('NotificationConfigController', {
      $scope: $scope,
      Notification: notification,
      NotificationConfigService: service,
    });
  }));

  it('reads data and updates scope', function() {
    expect($scope.loading).toBe(true);
    expect(service.read.callCount).toBe(1);
    service.read.callArgWith(0, null, { foo: 'bar' });
    expect($scope.loading).toBe(false);
    expect($scope.config.foo).toBe('bar');
  });

  it('notifies when read fails', function() {
    expect($scope.loading).toBe(true);
    expect(service.read.callCount).toBe(1);
    service.read.callArgWith(0, ['fails'], null);
    expect($scope.loading).toBe(false);
    expect(notification.notify.callCount).toBe(1);
    expect(notification.notify.args[0][0].length).toBe(1);
    expect(notification.notify.args[0][0][0]).toBe('fails');
    expect(notification.notify.args[0][1]).toBe('error');
  });

  it('notifies when read fails with default msg', function() {
    expect(service.read.callCount).toBe(1);
    service.read.callArgWith(0, [null, 123], null);
    expect(notification.notify.callCount).toBe(1);
    expect(notification.notify.args[0][0][0]).toBe('Request failed with status 123');
  });

  it('writes data', function() {
    $scope.config = { foo: 'bar' };
    $scope.$parent = { modal: { close: sinon.stub() } };
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

  it('notifies when write fails', function() {
    $scope.config = { foo: 'bar' };
    $scope.writeConfig();
    expect(service.write.callCount).toBe(1);
    expect(service.write.args[0][0].foo).toBe('bar');
    expect($scope.saving).toBe(true);

    service.write.callArgWith(1, ['err']);
    expect(notification.notify.callCount).toBe(1);
    expect($scope.saving).toBe(false);
  });

});
