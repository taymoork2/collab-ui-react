'use strict';

describe('ReadonlyInterceptor', function () {
  beforeEach(angular.mock.module('core.readonlyinterceptor'));

  var Interceptor, Authinfo, Notification, $q;

  beforeEach(inject(function (_$q_, _ReadonlyInterceptor_, _Authinfo_, _Notification_) {
    Interceptor = _ReadonlyInterceptor_;
    Authinfo = _Authinfo_;
    Notification = _Notification_;
    $q = _$q_;
    $q.reject = sinon.spy();
  }));

  describe('read-only mode', function () {

    //TODO: Reintroduce test of logging...
    beforeEach(function () {
      Authinfo.isReadOnlyAdmin = sinon.stub().returns(true);
      Notification.notifyReadOnly = sinon.spy();
    });

    it('intercepts POST operations and creates a read-only notification', function () {
      Interceptor.request({
        data: "x",
        method: "POST"
      });
      expect($q.reject.callCount).toEqual(1);
      expect(Notification.notifyReadOnly.callCount).toEqual(1);
    });

    it('intercepts PUT operations and creates a read-only notification', function () {
      Interceptor.request({
        data: "x",
        method: "PUT"
      });
      expect($q.reject.callCount).toEqual(1);
      expect(Notification.notifyReadOnly.callCount).toEqual(1);
    });

    it('intercepts DELETE operations and creates a read-only notification', function () {
      Interceptor.request({
        data: "x",
        method: "DELETE"
      });
      expect($q.reject.callCount).toEqual(1);
      expect(Notification.notifyReadOnly.callCount).toEqual(1);
    });

    it('intercepts PATCH operations and creates a read-only notification', function () {
      Interceptor.request({
        data: "x",
        method: "PATCH"
      });
      expect($q.reject.callCount).toEqual(1);
      expect(Notification.notifyReadOnly.callCount).toEqual(1);
    });

    it('does not intercept read operations', function () {
      var config = {
        data: "x",
        method: "GET"
      };
      Interceptor.request(config);
      expect($q.reject.callCount).toEqual(0);
      expect(Notification.notifyReadOnly.callCount).toEqual(0);
    });

  });

  describe('while not in read-only mode', function () {

    it('does not manipulate requests', function () {
      Authinfo.isReadOnlyAdmin = sinon.stub().returns(false);
      Notification.notifyReadOnly = sinon.spy();
      var config = {
        data: "x",
        method: "POST"
      };
      Interceptor.request(config);
      expect($q.reject.callCount).toEqual(0);
      expect(Notification.notifyReadOnly.callCount).toEqual(0);
    });
  });
});
