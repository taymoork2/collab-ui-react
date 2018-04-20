'use strict';

var testModule = require('./index').default;

describe('WebExXmlApiFact', function () {
  var WebExXmlApiFact;
  var $rootScope;
  var deferred;
  var Auth;
  var TokenService;
  var reportTestData = _.cloneDeep(getJSONFixture('webex/json/test-report-xml.json'));

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

  beforeEach(angular.mock.module(testModule));

  beforeEach(inject(function (_$q_, _$rootScope_, _WebExXmlApiFact_, _Auth_, _TokenService_) {
    $rootScope = _$rootScope_;
    WebExXmlApiFact = _WebExXmlApiFact_;
    Auth = _Auth_;
    TokenService = _TokenService_;

    deferred = _$q_.defer();
    spyOn(WebExXmlApiFact, 'tokeninfo').and.returnValue(deferred.promise);

    spyOn(Auth, 'redirectToLogin');
  }));

  it('redirects to login if token is not found', function () {
    spyOn(TokenService, 'getAccessToken').and.returnValue(null);
    WebExXmlApiFact.validateToken();
    expect(Auth.redirectToLogin).toHaveBeenCalled();
  });

  it('does not redirect to login if token is valid', function () {
    spyOn(TokenService, 'getAccessToken').and.returnValue('aToken');

    WebExXmlApiFact.validateToken();

    deferred.resolve();
    $rootScope.$apply();

    expect(Auth.redirectToLogin).not.toHaveBeenCalled();
  });

  it('redirects to login if token is invalid', function () {
    spyOn(TokenService, 'getAccessToken').and.returnValue('invalidToken');

    WebExXmlApiFact.validateToken();

    deferred.reject('Error!');
    $rootScope.$apply();

    expect(Auth.redirectToLogin).toHaveBeenCalled();
  });

  it('function xml2JsonConvert should convert data correctly', function () {
    var testXmlApiXml2JsonConvert = reportTestData.testXmlApiXml2JsonConvert;
    var convertedObj = WebExXmlApiFact.xml2JsonConvert(
      'Site Version Header',
      testXmlApiXml2JsonConvert,
      '<serv:header>',
      '<serv:body>'
    );

    expect(convertedObj.body.serv_header.serv_response.serv_result).toBe('SUCCESS');
    expect(convertedObj.body.serv_header.serv_response.serv_gsbStatus).toBe('PRIMARY');
  });

  afterEach(function () {
    Auth.redirectToLogin.calls.reset();
  });
});
