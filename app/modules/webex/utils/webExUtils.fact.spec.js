/**
 * 
 */
'use strict';

describe('WebExUtilsFact', function () {

  var $q;
  var $rootScope;
  var deferred;
  var deferredVersionXml;
  var deferredSiteInfoXml;
  var WebExXmlApiFact;
  var WebExUtilsFact;

  var isIframeSupportedXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="ht
  var isNotIframeSupportedXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com=
  var isNullIframSupportedXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com=

  var isAdminReportEnabledXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com=
  var isNotAdminReportEnabledXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:c

  var hostName = 'aaa.bbb.com';
  var siteName = 'foo';
  var urlPart = 'https://' + hostName + '/wbxadmin/clearcookie.do?proxyfrom=atlas&siteurl=';
  var url = urlPart + siteName;

  beforeEach(module('WebExUtils'));
  beforeEach(module('WebExXmlApi'));

  beforeEach(inject(function (_$q_, _$rootScope_, _WebExXmlApiFact_, _WebExUtilsFact_) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    WebExXmlApiFact = _WebExXmlApiFact_;
    WebExUtilsFact = _WebExUtilsFact_;

    deferred = $q.defer();
    deferredVersionXml = $q.defer();
    deferredSiteInfoXml = $q.defer();

    spyOn(WebExXmlApiFact, "getSessionTicket").and.returnValue(deferred.promise);
    spyOn(WebExXmlApiFact, "getSiteVersion").and.returnValue(deferredVersionXml.promise);
    spyOn(WebExXmlApiFact, "getSiteInfo").and.returnValue(deferredSiteInfoXml.promise);
  }));

  it('can check if site supports iframe', inject(function (WebExUtilsFact) {
    WebExUtilsFact.isSiteSupportsIframe("test.site.com").then(
      function isSiteSupportsIframeSuccess(response) {
        var isIframeSupported = response.isIframeSupported;
        expect(isIframeSupported).toBe(true);
      },

      function isSiteSupportsIframeError(response) {
        this.fail();
      }
    );

    deferred.resolve("ticket");
    $rootScope.$apply();

    deferredVersionXml.resolve(isIframeSupportedXml);
    $rootScope.$apply();

    deferredSiteInfoXml.resolve(isAdminReportEnabledXml);
    $rootScope.$apply();

    expect(WebExXmlApiFact.getSessionTicket).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteVersion).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteInfo).toHaveBeenCalled();
  }));

  it('can check if site does not supports iframe', inject(function (WebExUtilsFact) {
    WebExUtilsFact.isSiteSupportsIframe("test.site.com").then(
      function isSiteSupportsIframeSuccess(response) {
        var isIframeSupported = response.isIframeSupported;
        expect(isIframeSupported).toBe(false);
      },

      function isSiteSupportsIframeError(response) {
        this.fail();
      }
    );

    deferred.resolve("ticket");
    $rootScope.$apply();

    deferredVersionXml.resolve(isNotIframeSupportedXml);
    $rootScope.$apply();

    deferredSiteInfoXml.resolve(isAdminReportEnabledXml);
    $rootScope.$apply();

    expect(WebExXmlApiFact.getSessionTicket).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteVersion).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteInfo).toHaveBeenCalled();
  }));

  it('can check if supports iframe is null', inject(function (WebExUtilsFact) {
    WebExUtilsFact.isSiteSupportsIframe("test.site.com").then(
      function isSiteSupportsIframeSuccess(response) {
        var isIframeSupported = response.isIframeSupported;
        expect(isIframeSupported).toBe(false);
      },

      function isSiteSupportsIframeError(response) {
        this.fail();
      }
    );

    deferred.resolve("ticket");
    $rootScope.$apply();

    deferredVersionXml.resolve(isNullIframSupportedXml);
    $rootScope.$apply();

    deferredSiteInfoXml.resolve(isAdminReportEnabledXml);
    $rootScope.$apply();

    expect(WebExXmlApiFact.getSessionTicket).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteVersion).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteInfo).toHaveBeenCalled();
  }));

  it('can check if site report is enabled', inject(function (WebExUtilsFact) {
    WebExUtilsFact.isSiteSupportsIframe("test.site.com").then(
      function isSiteSupportsIframeSuccess(response) {
        var isAdminReportEnabled = response.isAdminReportEnabled;
        expect(isAdminReportEnabled).toBe(true);
      },

      function isSiteSupportsIframeError(response) {
        this.fail();
      }
    );

    deferred.resolve("ticket");
    $rootScope.$apply();

    deferredVersionXml.resolve(isIframeSupportedXml);
    $rootScope.$apply();

    deferredSiteInfoXml.resolve(isAdminReportEnabledXml);
    $rootScope.$apply();

    expect(WebExXmlApiFact.getSessionTicket).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteVersion).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteInfo).toHaveBeenCalled();
  }));

  it('can check if site report is not enabled', inject(function (WebExUtilsFact) {
    WebExUtilsFact.isSiteSupportsIframe("test.site.com").then(
      function isSiteSupportsIframeSuccess(response) {
        var isAdminReportEnabled = response.isAdminReportEnabled;
        expect(isAdminReportEnabled).toBe(false);
      },

      function isSiteSupportsIframeError(response) {
        this.fail();
      }
    );

    deferred.resolve("ticket");
    $rootScope.$apply();

    deferredVersionXml.resolve(isIframeSupportedXml);
    $rootScope.$apply();

    deferredSiteInfoXml.resolve(isNotAdminReportEnabledXml);
    $rootScope.$apply();

    expect(WebExXmlApiFact.getSessionTicket).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteVersion).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteInfo).toHaveBeenCalled();
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
    })

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