'use strict';

describe('ReadonlyInterceptor', function () {
  beforeEach(module('Core'));

  var $httpBackend, Interceptor, Authinfo, Notification;

  beforeEach(inject(function ($injector, _ReadonlyInterceptor_, _Authinfo_, _Notification_) {
    Interceptor = _ReadonlyInterceptor_;
    Authinfo = _Authinfo_;
    Notification = _Notification_;
  }));

  it('write operations are intercepted with special notification in read only mode', function () {
    sinon.stub().returns(false);
    Authinfo.isReadOnlyAdmin = sinon.stub().returns(true);
    Notification.notifyReadOnly = sinon.stub();
    Interceptor.request({
      data: "x",
      method: "POST"
    });
    expect(Notification.notifyReadOnly.calledOnce);
  });

  it('read operations are not intercepted with special notification in read only mode', function () {
    sinon.stub().returns(false);
    Authinfo.isReadOnlyAdmin = sinon.stub().returns(true);
    Notification.notifyReadOnly = sinon.stub();
    var config = {
      data: "x",
      method: "POST"
    };
    var response = Interceptor.request(config);
    expect(Notification.notifyReadOnly.notCalled);
  });

  it('write operations are NOT intercepted with special notification when NOT in read only mode', function () {
    sinon.stub().returns(false);
    Authinfo.isReadOnlyAdmin = sinon.stub().returns(false);
    Notification.notifyReadOnly = sinon.stub();
    var config = {
      data: "x",
      method: "POST"
    };
    var response = Interceptor.request(config);
    expect(Notification.notifyReadOnly.notCalled);
  });

});
