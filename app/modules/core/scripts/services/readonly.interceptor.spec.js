'use strict';

describe('ReadonlyInterceptor', function () {
  beforeEach(module('Core'));

  var $httpBackend, Interceptor, Authinfo, Notification, $q;

  beforeEach(inject(function (_$q_, _$httpBackend_, $injector, _ReadonlyInterceptor_, _Authinfo_, _Notification_) {
    Interceptor = _ReadonlyInterceptor_;
    Authinfo = _Authinfo_;
    Notification = _Notification_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $q.reject = sinon.spy();
  }));

  describe('read-only mode', function () {

    beforeEach(function () {
      Authinfo.isReadOnlyAdmin = sinon.stub().returns(true);
      Notification.notifyReadOnly = sinon.spy();
    });

    it('intercepts POST operations and creates a read-only notification', function () {
      Notification.notifyReadOnly = sinon.spy();

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
      var response = Interceptor.request(config);
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
      var response = Interceptor.request(config);
      expect($q.reject.callCount).toEqual(0);
      expect(Notification.notifyReadOnly.callCount).toEqual(0);
    });
  });
});
