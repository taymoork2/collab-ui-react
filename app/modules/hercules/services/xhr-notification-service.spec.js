'use strict';

describe('XhrNotificationService', function () {
  beforeEach(angular.mock.module('Hercules'));

  var notification;
  beforeEach(function () {
    angular.mock.module(function ($provide) {
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
    Service.notify([{
      "error": {
        "key": 500,
        "message": ["foo"]
      }
    }]);
    expect(notification.notify.callCount).toBe(1);
    expect(notification.notify.args[0][0][0]).toBe('foo');
  });

  it('should handle complex json error arrays', function () {
    Service.notify([{
      "error": {
        "key": "404",
        "message": [{
          "description": {
            "key": 404,
            "message": "Resource not found"
          },
          "code": "404"
        }]
      }
    }]);
    expect(notification.notify.callCount).toBe(1);
    expect(notification.notify.args[0][0][0]).toBe('Resource not found');
  });

  it('should handle description as string', function () {
    Service.notify([{
      "error": {
        "key": "404",
        "message": [{
          "description": "Resource not found"
        }]
      }
    }]);
    expect(notification.notify.callCount).toBe(1);
    expect(notification.notify.args[0][0][0]).toBe('Resource not found');
  });

  it('should handle json error strings', function () {
    Service.notify([{
      "error": {
        "key": 500,
        "message": "foo"
      }
    }]);
    expect(notification.notify.callCount).toBe(1);
    expect(notification.notify.args[0][0][0]).toBe('foo');
  });

  it('should handle generic errors', function () {
    Service.notify([null, 404]);
    expect(notification.notify.callCount).toBe(1);
    expect(notification.notify.args[0][0][0]).toBe('Backend responded with status 404.');
  });

  it('should handle generic errors with null status', function () {
    Service.notify([null, 0]);
    expect(notification.notify.callCount).toBe(1);
    expect(notification.notify.args[0][0][0]).toBe('An unexpected error occurred.');
  });

  it('should handle custom messages', function () {
    Service.notify('msg', [null, 404]);
    expect(notification.notify.callCount).toBe(1);
    expect(notification.notify.args[0][0][0]).toBe('msg');
    expect(notification.notify.args[0][0][1]).toBeTruthy();
  });

  it('should handle res object', function () {
    Service.notify({
      "data": {
        "error": {
          "key": 500,
          "message": "foo"
        }
      }
    });
    expect(notification.notify.callCount).toBe(1);
    expect(notification.notify.args[0][0][0]).toBe('foo');
  });

  it('should extract errors from message', function () {
    Service.notify({
      data: {
        message: "Experimental Endpoint",
        errors: Array[1],
        trackingId: "ATLAS_12cd34b1-0f3a-756b-ba2a-9a59db7574bc"
      }
    });
    expect(notification.notify.callCount).toBe(1);
    expect(notification.notify.args[0][0][0]).toBe('Experimental Endpoint');
  });

  it('should show simple messages', function () {
    Service.notify('foo');
    expect(notification.notify.callCount).toBe(1);
    expect(notification.notify.args[0][0][0]).toBe('foo');
  });

  it('should show default message for default error object', function () {
    Service.notify({
      data: null,
      status: -1,
      config: {},
      statusText: ''
    });
    expect(notification.notify.callCount).toBe(1);
    expect(notification.notify.args[0][0][0]).toBe('An unexpected error occurred.');
  });

});
