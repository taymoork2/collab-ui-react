'use strict';

describe('Controller: SiteListCtrl', function () {

  var isNotIframeXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:ep="http://www.webex.com/schemas/2002/06/service/ep" xmlns:meet="http://www.webex.com/schemas/2002/06/service/meeting"><serv:header><serv:response><serv:result>SUCCESS</serv:result><serv:gsbStatus>PRIMARY</serv:gsbStatus></serv:response></serv:header><serv:body><serv:bodyContent xsi:type="ep:getAPIVersionResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><ep:apiVersion>WebEx XML API V10.0.0</ep:apiVersion><ep:trainReleaseVersion>T31L</ep:trainReleaseVersion><ep:trainReleaseOrder>100</ep:trainReleaseOrder></serv:bodyContent></serv:body></serv:message>';
  var isIframeXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:ep="http://www.webex.com/schemas/2002/06/service/ep" xmlns:meet="http://www.webex.com/schemas/2002/06/service/meeting"><serv:header><serv:response><serv:result>SUCCESS</serv:result><serv:gsbStatus>PRIMARY</serv:gsbStatus></serv:response></serv:header><serv:body><serv:bodyContent xsi:type="ep:getAPIVersionResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><ep:apiVersion>WebEx XML API V10.0.0</ep:apiVersion><ep:trainReleaseVersion>T31L</ep:trainReleaseVersion><ep:trainReleaseOrder>400</ep:trainReleaseOrder></serv:bodyContent></serv:body></serv:message>';

  // load the controller's module
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExUtils'));
  beforeEach(module('WebExXmlApi'));

  var SiteListCtrl, scope, Authinfo;
  var deferred;
  var deferredXml;

  // Initialize the controller and mock scope
  beforeEach(inject(function ($q, $controller, $rootScope, _WebExXmlApiFact_, $translate, _Config_, $log, _Userservice_, _WebExUtilsFact_, _WebExXmlApiInfoSvc_) {
    scope = $rootScope.$new();

    Authinfo = {
      'getConferenceServicesWithoutSiteUrl': function () {

        //        [
        //{"label":"Meeting Center 200","value":1,"name":"confRadio","license":{"licenseId":"MC_5b2fe3b2-fff2-4711-9d6e-4e45fe61ce52_200_sjsite14.webex.com","offerName":"MC","licenseType":"CONFERENCING","billingServiceId":"SubCt30test201582703","features":["webex-squared","squared-call-initiation","squared-syncup","cloudmeetings"],"volume":25,"isTrial":false,"status":"ACTIVE","capacity":200,"siteUrl":"sjsite14.webex.com"},"isCustomerPartner":false},
        //{"label":"Meeting Center 200","value":1,"name":"confRadio","license":{"licenseId":"MC_3ada1218-1763-428b-bb7f-d03f8ea91fa1_200_t30citestprov9.webex.com","offerName":"MC","licenseType":"CONFERENCING","billingServiceId":"SubCt30test1443208805","features":["webex-squared","squared-call-initiation","squared-syncup","cloudmeetings"],"volume":25,"isTrial":false,"status":"PENDING","capacity":200,"siteUrl":"t30citestprov9.webex.com"},"isCustomerPartner":false},
        //{"label":"Meeting Center 25","value":1,"name":"confRadio","license":{"licenseId":"MC_5f078901-2e59-4129-bba4-b2126d356b61_25_sjsite04.webex.com","offerName":"MC","licenseType":"CONFERENCING","billingServiceId":"SubCt30test201592302","features":["webex-squared","squared-call-initiation","squared-syncup","cloudmeetings"],"volume":25,"isTrial":false,"status":"PENDING","capacity":25,"siteUrl":"sjsite04.webex.com"},"isCustomerPartner":false},
        //{"label":"Meeting Center 200","value":1,"name":"confRadio","license":{"licenseId":"MC_66e1a7c9-3549-442f-942f-41a53b020689_200_sjsite04.webex.com","offerName":"MC","licenseType":"CONFERENCING","billingServiceId":"SubCt30test201592301","features":["webex-squared","squared-call-initiation","squared-syncup","cloudmeetings"],"volume":25,"isTrial":false,"status":"PENDING","capacity":200,"siteUrl":"sjsite04.webex.com"},"isCustomerPartner":false}
        //]

        return [{
          "label": "Meeting Center 200",
          "value": 1,
          "name": "confRadio",
          "license": {
            "licenseId": "MC_5b2fe3b2-fff2-4711-9d6e-4e45fe61ce52_200_sjsite14.webex.com",
            "offerName": "MC",
            "licenseType": "CONFERENCING",
            "billingServiceId": "SubCt30test201582703",
            "features": ["webex-squared", "squared-call-initiation", "squared-syncup", "cloudmeetings"],
            "volume": 25,
            "isTrial": false,
            "status": "ACTIVE",
            "capacity": 200,
            "siteUrl": "sjsite14.webex.com"
          },
          "isCustomerPartner": false
        }, {
          "label": "Meeting Center 25",
          "value": 1,
          "name": "confRadio",
          "license": {
            "licenseId": "MC_5f078901-2e59-4129-bba4-b2126d356b61_25_sjsite04.webex.com",
            "offerName": "MC",
            "licenseType": "CONFERENCING",
            "billingServiceId": "SubCt30test201592302",
            "features": ["webex-squared", "squared-call-initiation", "squared-syncup", "cloudmeetings"],
            "volume": 25,
            "isTrial": false,
            "status": "PENDING",
            "capacity": 25,
            "siteUrl": "sjsite04.webex.com"
          },
          "isCustomerPartner": false
        }];
      },
      'getPrimaryEmail': function () {
        return "some@email.com";
      }
    };

    deferred = $q.defer();
    spyOn(_WebExXmlApiFact_, "getSessionTicket").and.returnValue(deferred.promise);
    spyOn(_WebExXmlApiFact_, "getSiteVersion").and.callFake(function (xmlApiAccessInfo) {
      if (xmlApiAccessInfo.webexSiteName == "sjsite14") {
        return isNotIframeXml;
      }
      if (xmlApiAccessInfo.webexSiteName == "sjsite04") {
        return isIframeXml;
      }
    });

    SiteListCtrl = $controller('SiteListCtrl', {
      $q: $q,
      $translate: $translate,
      Authinfo: Authinfo,
      Config: _Config_,
      $log: $log,
      $scope: scope,
      Userservice: _Userservice_,
      WebExUtilsFact: _WebExUtilsFact_,
      WebExXmlApiFact: _WebExXmlApiFact_,
      webExXmlApiInfoObj: _WebExXmlApiInfoSvc_
    });
  }));

  it('should assign is iFrame supported site correctly', function () {
    deferred.resolve("ticket");
    scope.$apply();

    expect(SiteListCtrl).toBeDefined();
    expect(SiteListCtrl.gridData).toBeDefined();
    expect(SiteListCtrl.gridData).not.toBe(null);
    expect(SiteListCtrl.gridData[0]).not.toBe(null);
    expect(SiteListCtrl.gridData[0].iframeSupportedSite).not.toBe(null);
    expect(SiteListCtrl.gridData[0].iframeSupportedSite).toBe(false);
    expect(SiteListCtrl.gridData[0].showSiteLinks).toBe(true);

    expect(SiteListCtrl.gridData[1]).not.toBe(null);
    expect(SiteListCtrl.gridData[1].iframeSupportedSite).not.toBe(null);
    expect(SiteListCtrl.gridData[1].iframeSupportedSite).toBe(true);
    expect(SiteListCtrl.gridData[1].showSiteLinks).toBe(true);
  });

});
