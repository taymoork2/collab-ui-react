'use strict';

describe('ServerErrorInterceptor', function () {
  beforeEach(angular.mock.module('core.servererrorinterceptor'));

  var Interceptor, Config, $log;

  beforeEach(inject(function (_ServerErrorInterceptor_, _$log_, _Config_) {
    $log = _$log_;
    Config = _Config_;
    Interceptor = _ServerErrorInterceptor_;
  }));

  it('should log if status > 500 and not in prod', function () {
    var response = {
      status: 500,
      config: {
        headers: {}
      }
    };
    Config.isProd = sinon.stub().returns(false);
    $log.error = sinon.stub();

    Interceptor.responseError(response);

    expect($log.error.callCount).toBe(1);
  });

  it('should not log in prod', function () {
    var response = {
      status: 500,
      config: {
        headers: {}
      }
    };
    Config.isProd = sinon.stub().returns(true);
    $log.error = sinon.stub();

    Interceptor.responseError(response);

    expect($log.error.callCount).toBe(0);
  });

  it('should not log if status is 404', function () {
    var response = {
      status: 404,
      config: {
        headers: {}
      }
    };
    Config.isProd = sinon.stub().returns(false);
    $log.error = sinon.stub();

    Interceptor.responseError(response);

    expect($log.error.callCount).toBe(0);
  });

});
