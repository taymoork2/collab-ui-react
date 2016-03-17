/**
 * 
 */
'use strict';

describe('WebExXmlApiFact', function () {
  var WebExXmlApiFact;
  var $rootScope;
  var deferred;
  var Auth;
  var Storage;

  /**  
    var MyReporter = function () {
      jasmineRequire.JsApiReporter.apply(this, arguments);
    };
    MyReporter.prototype = jasmineRequire.JsApiReporter.prototype;
    MyReporter.prototype.constructor = MyReporter;
    MyReporter.prototype.specDone = function (o) {
      o = o || {};
      if (o.status !== "passed") {
        console.warn("Failed:" + o.fullName + o.failedExpectations[0].message);
      }
    };
    var env = jasmine.getEnv();
    env.addReporter(new MyReporter());
	**/

  beforeEach(module('WebExApp'));

  beforeEach(inject(function (_$q_, _$rootScope_, _WebExXmlApiFact_, _Auth_, _Storage_) {
    $rootScope = _$rootScope_;
    WebExXmlApiFact = _WebExXmlApiFact_;
    Auth = _Auth_;
    Storage = _Storage_;

    deferred = _$q_.defer();
    spyOn(WebExXmlApiFact, 'tokeninfo').and.returnValue(deferred.promise);

    spyOn(Auth, 'redirectToLogin');
  }));

  it('redirects to login if token is not found', function () {
    WebExXmlApiFact.validateToken();
    expect(Auth.redirectToLogin).toHaveBeenCalled();
  });

  it('does not redirect to login if token is valid', function () {
    spyOn(Storage, 'get').and.returnValue("aToken");

    WebExXmlApiFact.validateToken();

    deferred.resolve();
    $rootScope.$apply();

    expect(Auth.redirectToLogin).not.toHaveBeenCalled();
  });

  it('redirects to login if token is invalid', function () {
    spyOn(Storage, 'get').and.returnValue("aToken");

    WebExXmlApiFact.validateToken();

    deferred.reject('Error!');
    $rootScope.$apply();

    expect(Auth.redirectToLogin).toHaveBeenCalled();
  });

  afterEach(function () {
    Auth.redirectToLogin.calls.reset();
  });
});
