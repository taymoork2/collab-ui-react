/**
 * 
 */
'use strict';

describe('WebExUtilsFactTest', function () {

  var $q;
  var $rootScope;
  var deferred;
  var deferredXml;
  var WebExXmlApiFact;

  var isIframeXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:ep="http://www.webex.com/schemas/2002/06/service/ep" xmlns:meet="http://www.webex.com/schemas/2002/06/service/meeting"><serv:header><serv:response><serv:result>SUCCESS</serv:result><serv:gsbStatus>PRIMARY</serv:gsbStatus></serv:response></serv:header><serv:body><serv:bodyContent xsi:type="ep:getAPIVersionResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><ep:apiVersion>WebEx XML API V10.0.0</ep:apiVersion><ep:trainReleaseVersion>T31L</ep:trainReleaseVersion><ep:trainReleaseOrder>400</ep:trainReleaseOrder></serv:bodyContent></serv:body></serv:message>';
  var isNotIframeXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:ep="http://www.webex.com/schemas/2002/06/service/ep" xmlns:meet="http://www.webex.com/schemas/2002/06/service/meeting"><serv:header><serv:response><serv:result>SUCCESS</serv:result><serv:gsbStatus>PRIMARY</serv:gsbStatus></serv:response></serv:header><serv:body><serv:bodyContent xsi:type="ep:getAPIVersionResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><ep:apiVersion>WebEx XML API V10.0.0</ep:apiVersion><ep:trainReleaseVersion>T31L</ep:trainReleaseVersion><ep:trainReleaseOrder>100</ep:trainReleaseOrder></serv:bodyContent></serv:body></serv:message>';

  beforeEach(module('WebExUtils'));
  beforeEach(module('WebExXmlApi'));

  /**  
    beforeEach(module(function ($provide) {

      var mockWebExXmlApiFact = {
        getSessionTicket: function (siteUrl) {
          console.log("getSessionTicket");
          deferred = $q.defer();
          console.log("defer session ticket");
          return deferred.promise;
        },
        getSiteVersion: function (xmlApiAccessInfo) {
          console.log("getSiteVersion");
          deferredXml = $q.defer();
          console.log("defer site version ");
          return deferredXml.promise;
        }
      };

      $provide.value('WebExXmlApiFact', mockWebExXmlApiFact);

    }));
  **/

  beforeEach(inject(function (_$q_, _$rootScope_, _WebExXmlApiFact_) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    WebExXmlApiFact = _WebExXmlApiFact_;

    deferred = $q.defer();
    deferredXml = $q.defer();
    spyOn(WebExXmlApiFact, "getSessionTicket").and.returnValue(deferred.promise);
    spyOn(WebExXmlApiFact, "getSiteVersion").and.returnValue(deferredXml.promise);

  }));

  it('can check if site supports iframe', inject(function (WebExUtilsFact) {
    WebExUtilsFact.isSiteSupportsIframe("test.site.com").then(
      function isSiteSupportsIframeSuccess(iFrame) {
        expect(iFrame).toBe(true);
      },
      function isSiteSupportsIframeError(response) {
        this.fail();
      }
    );

    deferred.resolve("ticket");
    $rootScope.$apply();

    deferredXml.resolve(isIframeXml);
    $rootScope.$apply();

    expect(WebExXmlApiFact.getSessionTicket).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteVersion).toHaveBeenCalled();
  }));

  it('can check if site does not support iframe', inject(function (WebExUtilsFact) {
    WebExUtilsFact.isSiteSupportsIframe("test.site.com").then(
      function isSiteSupportsIframeSuccess(iFrame) {
        expect(iFrame).toBe(false);
      },
      function isSiteSupportsIframeError(response) {
        this.fail();
      }
    );

    deferred.resolve("ticket");
    $rootScope.$apply();

    deferredXml.resolve(isNotIframeXml);
    $rootScope.$apply();

    expect(WebExXmlApiFact.getSessionTicket).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteVersion).toHaveBeenCalled();
  }));
});
