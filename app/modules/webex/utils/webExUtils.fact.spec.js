/**
 * 
 */
'use strict';

describe('WebExUtilsFact', function () {

  var $q;
  var $rootScope;

  var WebExXmlApiFact;
  var WebExUtilsFact;

  var hostName = 'aaa.bbb.com';
  var siteName = 'foo';
  var urlPart = 'https://' + hostName + '/wbxadmin/clearcookie.do?proxyfrom=atlas&siteurl=';
  var url = urlPart + siteName;

  beforeEach(module('WebExApp'));

  beforeEach(inject(function (_$q_, _$rootScope_, _WebExXmlApiFact_, _WebExUtilsFact_) {
    $q = _$q_;
    $rootScope = _$rootScope_;

    WebExXmlApiFact = _WebExXmlApiFact_;
    WebExUtilsFact = _WebExUtilsFact_;
  }));

  it('calls correct logout URL', function () {
    $rootScope.nginxHost = hostName;
    $rootScope.lastSite = siteName + '.webex.com';
    spyOn($, "ajax");

    var promise = WebExUtilsFact.logoutSite();
    expect($.ajax.calls.mostRecent().args[0]["url"]).toEqual(url);
  });

  it('can log out from a site', function (done) {
    $rootScope.nginxHost = hostName;
    $rootScope.lastSite = siteName + '.webex.com';
    spyOn($, "ajax").and.callFake(function (e) {
      var result = $q.defer();
      result.resolve();
      return result;
    });

    var promise = WebExUtilsFact.logoutSite();

    promise.then(function () {
      done();
    });
    $rootScope.$apply();
  });

  it('does not block if no site visited', function (done) {
    var promise = WebExUtilsFact.logoutSite();

    promise.then(function () {
      done();
    }, function () {
      done();
    });
    $rootScope.$apply();
  });

  it('does not block on error response', function (done) {
    $rootScope.nginxHost = hostName;
    $rootScope.lastSite = siteName + '.webex.com';
    spyOn($, "ajax").and.callFake(function (e) {
      var result = $q.defer();
      result.reject();
      return result;
    });

    var promise = WebExUtilsFact.logoutSite();

    promise.then(function () {
      done();
    });
    $rootScope.$apply();
  });

  afterEach(function () {
    $rootScope.nginxHost = undefined;
    $rootScope.lastSite = undefined;
  });
});
