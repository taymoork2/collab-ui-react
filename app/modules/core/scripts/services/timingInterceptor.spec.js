'use strict';

describe('TimingInterceptor', function () {
  beforeEach(angular.mock.module('core.timinginterceptor'));

  var Interceptor, Config, $log, now, $rootScope;

  beforeEach(inject(function (_TimingInterceptor_, _$log_, _Config_, _$rootScope_) {
    $log = _$log_;
    Config = _Config_;
    $rootScope = _$rootScope_;
    now = new Date().getTime() - 1;
    Interceptor = _TimingInterceptor_;
  }));

  it('should update config with request timestamp', function () {
    var config = {};
    Interceptor.request(config);
    expect(config.requestTimestamp).toBeGreaterThan(now);
  });

  it('should update config with response timestamp', function () {
    var response = {
      config: {
        requestTimestamp: new Date().getTime()
      }
    };
    Interceptor.response(response);
    expect(response.config.responseTimestamp).toBeGreaterThan(now);
  });

  it('should log if threshold reached and not in prod', function () {
    var response = {
      config: {
        headers: {},
        requestTimestamp: now - 15000
      }
    };
    Config.isProd = sinon.stub().returns(false);
    $log.error = sinon.stub();

    Interceptor.response(response);

    expect($log.error.callCount).toBe(1);
  });

  it('should not log in prod', function () {
    var response = {
      config: {
        requestTimestamp: now - 15000
      }
    };
    Config.isProd = sinon.stub().returns(true);
    $log.error = sinon.stub();

    Interceptor.response(response);

    expect($log.error.callCount).toBe(0);
  });

  it('should not log if thresold not reached', function () {
    var response = {
      config: {
        requestTimestamp: now
      }
    };
    Config.isProd = sinon.stub().returns(false);
    $log.error = sinon.stub();

    Interceptor.response(response);

    expect($log.error.callCount).toBe(0);
  });

  it('should return rejected promise from responseError', function (done) {
    var response = {
      config: {
        requestTimestamp: now
      }
    };
    Interceptor.responseError(response).catch(done);
    $rootScope.$digest();
  });

  it('should return the unmodified rejection from responseError if its not a response', function (done) {
    Interceptor.responseError('foo').catch(function (rejection) {
      expect(rejection).toBe('foo');
      done();
    });
    $rootScope.$digest();
  });

});
