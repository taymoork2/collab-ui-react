'use strict';

describe('ResponseInterceptor', function () {
  beforeEach(angular.mock.module('core.responseinterceptor'));

  var Interceptor, Auth;

  afterEach(function () {
    Interceptor = Auth = undefined;
  });

  beforeEach(function () {
    angular.mock.module(function ($provide) {
      Auth = {
        logout: jasmine.createSpy('logout'),
        refreshAccessTokenAndResendRequest: jasmine.createSpy('refreshAccessTokenAndResendRequest')
      };
      $provide.value('Auth', Auth);
    });
  });

  beforeEach(inject(function (_ResponseInterceptor_) {
    Interceptor = _ResponseInterceptor_;
  }));

  it('should refresh token for 200001 errors', function () {
    testRefreshAccessTokenAndResendRequestForResponse({
      status: 401,
      data: {
        Errors: [{
          errorCode: '200001'
        }]
      }
    });
  });

  it('should refresh token for HTTP auth errors', function () {
    testRefreshAccessTokenAndResendRequestForResponse({
      status: 401,
      data: 'This request requires HTTP authentication.'
    });
  });

  it('should refresh token for Request unauthorized', function () {
    testRefreshAccessTokenAndResendRequestForResponse({
      status: 401,
      data: {
        error: {
          message: 'Request unauthorized'
        }
      }
    });
  });

  it('should refresh token for hercules 400 auth error responses', function () {
    testRefreshAccessTokenAndResendRequestForResponse({
      status: 400,
      data: {
        error: {
          message: [{
            description: "Invalid access token."
          }]
        }
      }
    });
  });

  it('should logout when token has expired', function () {
    testLogoutForResponse({
      status: 400,
      data: {
        error_description: 'The refresh token provided is expired'
      }
    });
  });

  it('should logout when refresh token is invalid because requested scope is invalid', function () {
    testLogoutForResponse({
      status: 400,
      data: {
        error_description: 'The requested scope is invalid'
      }
    });
  });

  function testRefreshAccessTokenAndResendRequestForResponse(response) {
    Interceptor.responseError(response);
    expect(Auth.refreshAccessTokenAndResendRequest).toHaveBeenCalledTimes(1);

    // Assume same request is retried - it should not invoke the refresh/resend again
    Interceptor.responseError(response);
    expect(Auth.refreshAccessTokenAndResendRequest).toHaveBeenCalledTimes(1);
  }

  function testLogoutForResponse(response) {
    Interceptor.responseError(response);
    expect(Auth.logout).toHaveBeenCalledTimes(1);
  }

});
