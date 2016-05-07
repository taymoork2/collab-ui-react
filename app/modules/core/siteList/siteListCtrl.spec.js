'use strict';

describe('SiteListCtrl(): grid update test', function () {
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));

  var SiteListCtrl;
  var SiteListService;
  var WebExUtilsService;

  var $scope;
  var $q;
  var $controller;
  var Authinfo;
  var fakeConferenceServices;
  var deferredCheckWebExFeaturToggle;

  beforeEach(inject(function (
    $rootScope,
    _$q_,
    _$controller_,
    _SiteListService_,
    _WebExUtilsService_
  ) {

    $scope = $rootScope.$new();

    $q = _$q_;
    $controller = _$controller_;

    SiteListService = _SiteListService_;
    WebExUtilsService = _WebExUtilsService_;

    deferredCheckWebExFeaturToggle = $q.defer();

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
    }];

    Authinfo = {
      'getConferenceServicesWithoutSiteUrl': function () {
        return fakeConferenceServices;
      },

      'getPrimaryEmail': function () {
        return "nobody@nowhere.com";
      }
    };

    SiteListCtrl = $controller('SiteListCtrl', {
      $scope: $scope,
      Authinfo: Authinfo
    });

    spyOn(WebExUtilsService, 'checkWebExFeaturToggle').and.returnValue(deferredCheckWebExFeaturToggle.promise);
  })); // beforeEach()

  it('', function () {
    expect(SiteListCtrl).toBeDefined();
    expect(SiteListCtrl.gridData).toBeDefined();
    expect(SiteListCtrl.gridData.length).toEqual(1);
    expect(SiteListCtrl.gridData[0].showCSVIconAndResults).toBeDefined();
    expect(SiteListCtrl.gridData[0].showCSVIconAndResults).toEqual(false);
  });

}); // describe()

describe('Testing controller: SiteListCtrl', function () {
  // load the controller's module
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));

  var SiteListCtrl, WebExApiGatewayService, WebExApiGatewayConstsService, SiteListService, Notification;
  var scope, $q, $controller, Authinfo, fakeConferenceServices, deferredCsvExport, fakeSiteRow;

  beforeEach(inject(function (
    $rootScope,
    _$q_,
    _$controller_,
    _SiteListService_,
    _FeatureToggleService_,
    _WebExApiGatewayService_,
    _WebExApiGatewayConstsService_,
    _Notification_
  ) {

    scope = $rootScope.$new();

    $q = _$q_;
    $controller = _$controller_;

    SiteListService = _SiteListService_;
    Notification = _Notification_;
    WebExApiGatewayService = _WebExApiGatewayService_;
    WebExApiGatewayConstsService = _WebExApiGatewayConstsService_;

    deferredCsvExport = $q.defer();

    fakeSiteRow = {
      license: {
        siteUrl: "fake.webex.com"
      },

      csvMock: {
        mockStatus: true,
        mockStatusStartIndex: 0,
        mockStatusEndIndex: 0,
        mockStatusCurrentIndex: null,
        mockExport: true,
        mockImport: true,
        mockFileDownload: true
      },

      csvPollIntervalObj: null
    };

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

    spyOn(WebExApiGatewayService, 'csvExport').and.returnValue(deferredCsvExport.promise);
    spyOn(SiteListService, 'updateGrid');
    spyOn(SiteListService, 'updateCSVColumnInRow');
    spyOn(Notification, 'success');

    SiteListCtrl = $controller('SiteListCtrl', {
      $scope: scope,
      Authinfo: Authinfo
    });

  }));

  it('should be able to call export function with expected parameters', function () {

    deferredCsvExport.resolve({
      siteUrl: 'fake.webex.com',
      isTestResult: true,
      status: WebExApiGatewayConstsService.csvStates.exportInProgress,
      completionDetails: null,
    });

    expect(SiteListCtrl).toBeDefined();
    expect(scope).toBeDefined();

    scope.csvExport(fakeSiteRow);
    scope.$apply();

    expect(WebExApiGatewayService.csvExport).toHaveBeenCalledWith('fake.webex.com', true);
    expect(Notification.success).toHaveBeenCalledWith('siteList.exportStartedToast');
    expect(SiteListService.updateCSVColumnInRow).toHaveBeenCalled();

  });

});
