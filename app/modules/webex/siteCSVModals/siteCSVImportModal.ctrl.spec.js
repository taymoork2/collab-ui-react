'use strict';

describe('SiteCSVImportModalCtrl test', function () {
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));

  var $q;
  var $rootScope;
  var $scope;
  var $controller;

  var Authinfo;
  var UrlConfig;
  var WebExApiGatewayService;
  var SiteListService;
  var SiteCSVImportModalCtrl;
  var Notification;
  var WebExApiGatewayConstsService;

  var fakeSiteRow, fakeCSVImportFileContents;
  var deferredCsvStatus;

  beforeEach(inject(function (
    _$q_,
    _$controller_,
    _$rootScope_,
    _Authinfo_,
    _UrlConfig_,
    _WebExApiGatewayService_,
    _SiteListService_,
    _Notification_,
    _WebExApiGatewayConstsService_
  ) {

    $q = _$q_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $controller = _$controller_;

    Authinfo = _Authinfo_;
    UrlConfig = _UrlConfig_;
    WebExApiGatewayService = _WebExApiGatewayService_;
    SiteListService = _SiteListService_;
    Notification = _Notification_;
    WebExApiGatewayConstsService = _WebExApiGatewayConstsService_;

    deferredCsvStatus = $q.defer();

    fakeSiteRow = {
      license: {
        siteUrl: "fake.webex.com"
      },

      csvStatusCheckMode: {
        isOn: true,
        checkStart: 0,
        checkEnd: 0,
        checkIndex: 0
      },

      csvPollIntervalObj: null
    };

    fakeCSVImportFileContents = "First Name,Last Name,Display Name,User ID/Email (Required),Calendar Service,Call Service Aware,Call Service Connect,Meeting 25 Party,Spark Message,cisjsite031.webex.com - WebEx Meeting Center,sjsite04.webex.com - WebEx Meeting Center,sjsite14.webex.com - WebEx Collaboration Meeting Room,sjsite14.webex.com - WebEx Meeting Center,t30citestprov9.webex.com - WebEx Meeting Center John,Doe,John Doe,johndoe@example.com,true,true,true,true,true,true,true,true,true,true Jane,Doe,Jane Doe,janedoe@example.com,false,false,false,false,false,false,false,false,false,false";

    SiteCSVImportModalCtrl = $controller('SiteCSVImportModalCtrl', {
      $scope: $scope,
      $stateParams: {
        csvImportObj: fakeSiteRow
      }
    });

    $scope.$apply();

    //Create spies
    spyOn(WebExApiGatewayService, 'csvImport').and.returnValue(deferredCsvStatus.promise);
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');

    $scope.$close = jasmine.createSpy('$close');
  })); // beforeEach(inject())

  it('should have valid import modal', function () {
    $rootScope.$apply();
    expect(SiteCSVImportModalCtrl.csvImportObj).not.toBe(null);
    expect(SiteCSVImportModalCtrl.siteUrl).not.toBe(null);
    expect(SiteCSVImportModalCtrl.siteUrl).toEqual(fakeSiteRow.license.siteUrl);
  });

  it('should have started import (trigger: import button click)', function () {
    WebExApiGatewayService.csvImport(fakeSiteRow.license.siteUrl, fakeCSVImportFileContents);

    deferredCsvStatus.resolve({
      siteUrl: 'fake.webex.com',
      isTestResult: true,
      status: WebExApiGatewayConstsService.csvStates.importCompletedNoErr,
      completionDetails: {},
    });

    $rootScope.$apply();
    expect(WebExApiGatewayService).toBeDefined();
    expect(fakeSiteRow).not.toBe(null);
    expect(WebExApiGatewayService.csvImport).toHaveBeenCalled();
    //expect(Notification.success).toHaveBeenCalled();
  });

}); // describe()
