'use strict';

describe('Testing controller: SiteListCtrl', function () {
  // load the controller's module
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));

  var WebExApiGatewayService, WebExApiGatewayConstsService, Userservice, SiteListService, Notification, FeatureToggleService;
  var Authinfo, fakeConferenceServices, deferredCsvStatus, deferredCsvApiRequest, deferredCsvStatus, fakeSiteRow;
  var httpBackend, scope, $q, $controller, getUserMe;
  var SiteListCtrl;

  var getCsvUserFeatureToggle = getJSONFixture('core/json/webex/siteCsvFeatureToggle.json');
  var userRegex = /.*\/locus\/api\/v1\/features\/users\.*/;

  beforeEach(inject(function (
    $rootScope,
    _$q_,
    _$httpBackend_,
    _$controller_,
    _Userservice_,
    _SiteListService_,
    _FeatureToggleService_,
    _WebExApiGatewayService_,
    _WebExApiGatewayConstsService_,
    _Notification_
  ) {

    scope = $rootScope.$new();
    httpBackend = _$httpBackend_;

    $q = _$q_;
    $controller = _$controller_;

    Userservice = _Userservice_;
    SiteListService = _SiteListService_;
    FeatureToggleService = _FeatureToggleService_;
    Notification = _Notification_;
    WebExApiGatewayService = _WebExApiGatewayService_;
    WebExApiGatewayConstsService = _WebExApiGatewayConstsService_;

    deferredCsvApiRequest = $q.defer();
    deferredCsvStatus = $q.defer();

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

    var fakeCsvStatusHttpsObj = {
      url: 'https://test.site.com/meetingsapi/v1/users/csvStatus',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Authorization': 'Bearer someFakeBearer'
      }
    };

    getUserMe = getJSONFixture('core/json/users/me.json');

    spyOn(Userservice, 'getUser').and.callFake(function (uid, callback) {
      callback(getUserMe, 200);
    });

    spyOn(FeatureToggleService, 'getFeatureForUser').and.callFake(function (uid, callback) {
      callback(getCsvUserFeatureToggle, 200);
    });

    spyOn(WebExApiGatewayService, 'csvExport').and.returnValue(deferredCsvStatus.promise);
    spyOn(SiteListService, 'updateCSVColumnInRow');
    spyOn(Notification, 'success');

    SiteListCtrl = $controller('SiteListCtrl', {
      $scope: scope,
      Authinfo: Authinfo
    });

  }));

  it('should be able to call export function with expected parameters', function () {

    deferredCsvStatus.resolve({
      siteUrl: 'fake.webex.com',
      isTestResult: true,
      status: WebExApiGatewayConstsService.csvStates.exportInProgress,
      completionDetails: null,
    });

    httpBackend.whenGET(userRegex).respond(200, getCsvUserFeatureToggle);

    expect(SiteListCtrl).toBeDefined();
    expect(scope).toBeDefined();
    scope.csvExport(fakeSiteRow);

    scope.$apply();

    expect(WebExApiGatewayService.csvExport).toHaveBeenCalledWith('fake.webex.com', true);
    expect(Notification.success).toHaveBeenCalledWith('siteList.exportStartedToast');
    expect(SiteListService.updateCSVColumnInRow).toHaveBeenCalled();

  });

});
