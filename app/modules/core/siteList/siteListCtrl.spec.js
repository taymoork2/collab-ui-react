'use strict';

describe('SiteListCtrl: should update gridData according to conference services', function () {
  // load the controller's module
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));

  var WebExApiGatewayService;
  var SiteListCtrl;
  var Authinfo;
  var scope;

  var fakeConferenceServices;

  beforeEach(inject(function (
    $controller,
    $rootScope,
    _WebExApiGatewayService_
  ) {

    scope = $rootScope.$new();
    WebExApiGatewayService = _WebExApiGatewayService_;

    fakeConferenceServices = [{
      "label": "Enterprise Edition 200",
      "value": 1,
      "name": "confRadio",
      "license": {
        "licenseId": "EE_97e59181-0db2-4030-b6f5-d484f6adc297_200_cisjsite032.webex.com",
        "offerName": "EE",
        "licenseType": "CONFERENCING",
        "billingServiceId": "SubCt31test0303032",
        "features": ["cloudmeetings"],
        "volume": 200,
        "isTrial": false,
        "status": "PENDING",
        "capacity": 200,
        "siteUrl": "cisjsite032.webex.com"
      },
      "isCustomerPartner": false
    }, {
      "label": "Enterprise Edition 200",
      "value": 1,
      "name": "confRadio",
      "license": {
        "licenseId": "EE_31c6fb41-a131-4813-a370-edaaf0c588f7_200_cisjsite034.webex.com",
        "offerName": "EE",
        "licenseType": "CONFERENCING",
        "billingServiceId": "SubCt31test0303034",
        "features": ["cloudmeetings"],
        "volume": 200,
        "isTrial": false,
        "status": "PENDING",
        "capacity": 200,
        "siteUrl": "cisjsite034.webex.com"
      },
      "isCustomerPartner": false
    }];

    Authinfo = {
      'getConferenceServicesWithoutSiteUrl': function () {
        return fakeConferenceServices;
      },

      'getPrimaryEmail': function () {
        return "nobody@nowhere.com";
      }
    };

    WebExApiGatewayService.csvStatusTypes = [
      'none',
      'exportInProgress',
      'exportCompletedNoErr',
      'exportCompletedWithErr',
      'importInProgress',
      'importCompletedNoErr',
      'importCompletedWithErr'
    ];

    SiteListCtrl = $controller('SiteListCtrl', {
      $scope: scope,
      Authinfo: Authinfo,
      WebExApiGatewayService: WebExApiGatewayService
    });
  }));

  it('should initialize gridData', function () {
    expect(SiteListCtrl).toBeDefined();
    expect(SiteListCtrl.gridData).toBeDefined();
    expect(SiteListCtrl.gridData.length).toEqual(2);

    expect(SiteListCtrl.gridData[0].license.siteUrl).toEqual("cisjsite032.webex.com");
    expect(SiteListCtrl.gridData[1].license.siteUrl).toEqual("cisjsite034.webex.com");
  });
});

describe('SiteListCtrl: should update gridData and filter out bad conference service', function () {
  // load the controller's module
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));

  var WebExApiGatewayService;
  var SiteListCtrl;
  var Authinfo;
  var scope;

  var fakeConferenceServices;

  beforeEach(inject(function (
    $controller,
    $rootScope,
    _WebExApiGatewayService_
  ) {

    scope = $rootScope.$new();
    WebExApiGatewayService = _WebExApiGatewayService_;

    fakeConferenceServices = [{
      "label": "Enterprise Edition 200",
      "value": 1,
      "name": "confRadio",
      "license": {
        "licenseId": "EE_97e59181-0db2-4030-b6f5-d484f6adc297_200_cisjsite032.webex.com",
        "offerName": "EE",
        "licenseType": "CONFERENCING",
        "billingServiceId": "SubCt31test0303032",
        "features": ["cloudmeetings"],
        "volume": 200,
        "isTrial": false,
        "status": "PENDING",
        "capacity": 200,
        "siteUrl": "cisjsite032.webex.com"
      },
      "isCustomerPartner": false
    }, {
      "label": "Enterprise Edition 200",
      "value": 1,
      "name": "confRadio",
      "license": {
        "licenseId": "EE_31c6fb41-a131-4813-a370-edaaf0c588f7_200_cisjsite034.webex.com",
        "offerName": "EE",
        "licenseType": "CONFERENCING",
        "billingServiceId": "SubCt31test0303034",
        "features": ["cloudmeetings"],
        "volume": 200,
        "isTrial": false,
        "status": "PENDING",
        "capacity": 200,
        "siteUrl": "cisjsite032.webex.com"
      },
      "isCustomerPartner": false
    }];

    Authinfo = {
      'getConferenceServicesWithoutSiteUrl': function () {
        return fakeConferenceServices;
      },

      'getPrimaryEmail': function () {
        return "nobody@nowhere.com";
      }
    };

    WebExApiGatewayService.csvStatusTypes = [
      'none',
      'exportInProgress',
      'exportCompletedNoErr',
      'exportCompletedWithErr',
      'importInProgress',
      'importCompletedNoErr',
      'importCompletedWithErr'
    ];

    SiteListCtrl = $controller('SiteListCtrl', {
      $scope: scope,
      Authinfo: Authinfo,
      WebExApiGatewayService: WebExApiGatewayService
    });
  }));

  it('should initialize gridData', function () {
    expect(SiteListCtrl).toBeDefined();
    expect(SiteListCtrl.gridData).toBeDefined();
    expect(SiteListCtrl.gridData.length).toEqual(1);

    expect(SiteListCtrl.gridData[0].license.siteUrl).toEqual("cisjsite032.webex.com");
  });
});
