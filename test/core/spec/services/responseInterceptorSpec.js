'use strict';

describe('ResponseInterceptor', function () {
  beforeEach(module('Core'));

  var $httpBackend, Interceptor, Storage, Auth;

  beforeEach(function () {
    module(function ($provide) {
      Storage = {
        get: sinon.stub()
      };
      Auth = {
        logout: sinon.stub(),
        refreshAccessTokenAndResendRequest: sinon.stub()
      };
      $provide.value('Auth', Auth);
      $provide.value('Storage', Storage);
    });
  });

  beforeEach(inject(function ($injector, _ResponseInterceptor_) {
    Interceptor = _ResponseInterceptor_;
  }));

  it('should refresh token for 200001 errors', function () {
    Interceptor.responseError({
      status: 401,
      data: {
        Errors: [{
          errorCode: '200001'
        }]
      }
    });

    expect(Auth.refreshAccessTokenAndResendRequest.calledOnce).toBe(true);
  });

  it('should refresh token for HTTP auth errors', function () {
    Interceptor.responseError({
      status: 401,
      data: 'This request requires HTTP authentication.'
    });

    expect(Auth.refreshAccessTokenAndResendRequest.calledOnce).toBe(true);
  });

  it('should refresh token for hercules 400 auth error responses', function () {
    Interceptor.responseError({
      status: 400,
      data: {
        error: {
          message: [{
            description: "Invalid access token."
          }]
        }
      }
    });

    expect(Auth.refreshAccessTokenAndResendRequest.calledOnce).toBe(true);
  });

  it('should logout when token has expired', function () {
    Storage.get.onCall(0).returns(true);

    Interceptor.responseError({
      status: 400,
      data: {
        error_description: 'The refresh token provided is expired'
      }
    });

    expect(Auth.logout.calledOnce).toBe(true);
  });

});
