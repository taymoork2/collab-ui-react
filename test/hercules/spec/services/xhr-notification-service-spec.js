'use strict';

describe('XhrNotificationService', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  var notification;
  beforeEach(function() {
    module(function ($provide) {
      notification = {
        notify: sinon.stub()
      };
      $provide.value('Notification', notification);
    });
  });

  var Service;
  beforeEach(inject(function (_XhrNotificationService_) {
    Service = _XhrNotificationService_;
  }));

  it('should handle json error arrays', function () {
    Service.notify([{"error":{"key":500,"message":["foo"]}}])
    expect(notification.notify.callCount).toBe(1);
    expect(notification.notify.args[0][0][0]).toBe('foo');
  });

  it('should handle complex json error arrays', function () {
    Service.notify([{"error":{"key":"404","message":[{"description":{"key":404,"message":"Resource not found"},"code":"404"}]}}])
    expect(notification.notify.callCount).toBe(1);
    expect(notification.notify.args[0][0][0]).toBe('Resource not found');
  });

  it('should handle json error strings', function () {
    Service.notify([{"error":{"key":500,"message":"foo"}}])
    expect(notification.notify.callCount).toBe(1);
    expect(notification.notify.args[0][0][0]).toBe('foo');
  });

  it('should handle generic errors', function () {
    Service.notify([null, 404])
    expect(notification.notify.callCount).toBe(1);
    expect(notification.notify.args[0][0][0]).toBe('Backend responded with status 404. Please see the browser error console for details.');
  });

  it('should handle custom messages', function () {
    Service.notify('msg', [null, 404])
    expect(notification.notify.callCount).toBe(1);
    expect(notification.notify.args[0][0][0]).toBe('msg');
    expect(notification.notify.args[0][0][1]).toBeTruthy();
  });

});
