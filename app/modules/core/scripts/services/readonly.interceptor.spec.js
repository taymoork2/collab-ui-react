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
      Authinfo.getUserOrgId = sinon.stub().returns('fe5acf7a-6246-484f-8f43-3e8c910fc50d');
      Authinfo.getUserId = sinon.stub().returns('09bd9c92-bdd0-4dfb-832d-618494246be5');
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

    it('allows CI patches to self (own user)', function () {
      var config = {
        url: "https://identity.webex.com/identity/scim/fe5acf7a-6246-484f-8f43-3e8c910fc50d/v1/Users/09bd9c92-bdd0-4dfb-832d-618494246be5",
        method: "PATCH"
      };
      Interceptor.request(config);
      expect($q.reject.callCount).toEqual(0);
      expect(Notification.notifyReadOnly.callCount).toEqual(0);
    });

    it('intercepts PATCH requests to other CI users)', function () {
      var config = {
        url: "https://identity.webex.com/identity/scim/fe5acf7a-6246-484f-8f43-3e8c910fc50d/v1/Users/2c5c9a99-3ab4-4266-aeb1-e950f52ec806",
        method: "PATCH"
      };
      Interceptor.request(config);
      expect($q.reject.callCount).toEqual(1);
      expect(Notification.notifyReadOnly.callCount).toEqual(1);
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
