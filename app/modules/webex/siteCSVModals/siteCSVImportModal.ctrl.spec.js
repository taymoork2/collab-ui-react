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
  var deferredCSVImport;

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

    deferredCSVImport = $q.defer();

    fakeCSVImportFileContents = "First Name,Last Name,Display Name,User ID/Email (Required),Calendar Service,Call Service Aware,Call Service Connect,Meeting 25 Party,Spark Message,cisjsite031.webex.com - WebEx Meeting Center,sjsite04.webex.com - WebEx Meeting Center,sjsite14.webex.com - WebEx Collaboration Meeting Room,sjsite14.webex.com - WebEx Meeting Center,t30citestprov9.webex.com - WebEx Meeting Center John,Doe,John Doe,johndoe@example.com,true,true,true,true,true,true,true,true,true,true Jane,Doe,Jane Doe,janedoe@example.com,false,false,false,false,false,false,false,false,false,false";

    fakeSiteRow = {
      license: {
        siteUrl: "fake.webex.com"
      },

      csvMock: {
        mockStatus: true,
        mockExport: true,
        mockImport: true,
        mockFileDownload: true,

        mockStatusStartIndex: 0,
        mockStatusEndIndex: 0,
        mockStatusCurrentIndex: null,
      },
    };

    SiteCSVImportModalCtrl = $controller('SiteCSVImportModalCtrl', {
      $scope: $scope,
      $stateParams: {
        csvImportObj: fakeSiteRow
      }
    });

    $scope.$apply();

    //Create spies
    spyOn(WebExApiGatewayService, 'csvImport').and.returnValue(deferredCSVImport.promise);
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

  it('should be able to start import (trigger: import button click)', function () {
    $rootScope.$apply();

    expect(fakeSiteRow).not.toBe(null);

    SiteCSVImportModalCtrl.modal.file = fakeCSVImportFileContents;
    SiteCSVImportModalCtrl.startImport();

    expect(WebExApiGatewayService.csvImport).toHaveBeenCalled();

    deferredCSVImport.resolve({});
    $rootScope.$apply();

    expect(Notification.success).toHaveBeenCalled();
    expect($scope.$close).toHaveBeenCalled();
  });

  it('should be able to reject import when import file is null', function () {
    $rootScope.$apply();

    expect(fakeSiteRow).not.toBe(null);

    SiteCSVImportModalCtrl.modal.file = null;
    SiteCSVImportModalCtrl.startImport();

    expect(Notification.error).toHaveBeenCalled();
    expect($scope.$close).not.toHaveBeenCalled();
  });

  it('can process reject from WebExApiGatewayService.csvExport() ', function () {
    $rootScope.$apply();

    expect(fakeSiteRow).not.toBe(null);

    SiteCSVImportModalCtrl.modal.file = fakeCSVImportFileContents;
    SiteCSVImportModalCtrl.startImport();

    expect(WebExApiGatewayService.csvImport).toHaveBeenCalled();

    deferredCSVImport.reject({
      "errorCode": "060100",
      "errorMessage": "Your request has been prevented because a task is now running. Try again later."
    });

    $rootScope.$apply();

    expect(Notification.error).toHaveBeenCalledWith('siteList.csvRejectedToast-060100');
    expect($scope.$close).toHaveBeenCalled();
  });

}); // describe()
