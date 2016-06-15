'use strict';

describe('SiteCSVModalCtrl: initiate export', function () {
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
  var WebExSiteRowService;
  var SiteCSVModalCtrl;
  var Notification;
  var WebExApiGatewayConstsService;

  var fakeSiteRow;
  var fakeCSVImportFileContents;
  var deferredCSVImport;
  var deferredCSVExport;

  beforeEach(inject(function (
    _$q_,
    _$controller_,
    _$rootScope_,
    _Authinfo_,
    _UrlConfig_,
    _WebExApiGatewayService_,
    _WebExSiteRowService_,
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
    WebExSiteRowService = _WebExSiteRowService_;
    Notification = _Notification_;
    WebExApiGatewayConstsService = _WebExApiGatewayConstsService_;

    deferredCSVImport = $q.defer();
    deferredCSVExport = $q.defer();

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

    SiteCSVModalCtrl = $controller('SiteCSVModalCtrl', {
      $scope: $scope,
      $stateParams: {
        siteRow: fakeSiteRow
      }
    });

    $scope.$apply();

    //Create spies
    spyOn(WebExApiGatewayService, 'csvImport').and.returnValue(deferredCSVImport.promise);
    spyOn(WebExApiGatewayService, 'csvExport').and.returnValue(deferredCSVExport.promise);
    spyOn(WebExSiteRowService, 'updateCSVStatusInRow');
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');

    $scope.$close = jasmine.createSpy('$close');
  })); // beforeEach(inject())

  it('should have valid export/import modal', function () {
    $rootScope.$apply();

    expect(SiteCSVModalCtrl.siteRow).not.toBe(null);
    expect(SiteCSVModalCtrl.siteUrl).toEqual(fakeSiteRow.license.siteUrl);
    expect(SiteCSVModalCtrl.requestingImport).toEqual(false);
    expect(SiteCSVModalCtrl.requestingExport).toEqual(false);
    expect(SiteCSVModalCtrl.viewReady).toEqual(true);
  });

  it('should be able to start export (trigger: export button click)', function () {
    $rootScope.$apply();

    expect(fakeSiteRow).not.toBe(null);

    SiteCSVModalCtrl.startExport();

    expect(WebExApiGatewayService.csvExport).toHaveBeenCalled();
  });

  it('should be able to handle successful response from WebExApiGatewayService.csvExport()', function () {
    $rootScope.$apply();

    expect(fakeSiteRow).not.toBe(null);

    SiteCSVModalCtrl.startExport();

    expect(WebExApiGatewayService.csvExport).toHaveBeenCalled();

    deferredCSVExport.resolve({});
    $rootScope.$apply();

    expect(Notification.success).toHaveBeenCalled();
    expect(WebExSiteRowService.updateCSVStatusInRow).toHaveBeenCalled();
    expect($scope.$close).toHaveBeenCalled();
  });

  it('should be able to handle error response from WebExApiGatewayService.csvExport()', function () {
    $rootScope.$apply();

    expect(fakeSiteRow).not.toBe(null);

    SiteCSVModalCtrl.startExport();

    expect(WebExApiGatewayService.csvExport).toHaveBeenCalled();

    deferredCSVExport.reject({
      errorCode: 'errorCode'
    });

    $rootScope.$apply();

    expect(Notification.error).toHaveBeenCalled();
    expect(WebExSiteRowService.updateCSVStatusInRow).toHaveBeenCalled();
    expect($scope.$close).toHaveBeenCalled();
  });

  it('should be able to start import (trigger: import button click)', function () {
    $rootScope.$apply();

    expect(fakeSiteRow).not.toBe(null);

    SiteCSVModalCtrl.modal.file = fakeCSVImportFileContents;
    SiteCSVModalCtrl.startImport();

    expect(WebExApiGatewayService.csvImport).toHaveBeenCalled();

    deferredCSVImport.resolve({});
    $rootScope.$apply();

    expect(Notification.success).toHaveBeenCalled();
    expect(WebExSiteRowService.updateCSVStatusInRow).toHaveBeenCalled();
    expect($scope.$close).toHaveBeenCalled();
  });

  it('should be able to reject import when import file is null', function () {
    $rootScope.$apply();

    expect(fakeSiteRow).not.toBe(null);

    SiteCSVModalCtrl.modal.file = null;
    SiteCSVModalCtrl.startImport();

    expect(Notification.error).toHaveBeenCalled();
    expect(WebExSiteRowService.updateCSVStatusInRow).toHaveBeenCalled();
    expect($scope.$close).not.toHaveBeenCalled();
  });

  it('can process reject from WebExApiGatewayService.csvExport() ', function () {
    $rootScope.$apply();

    expect(fakeSiteRow).not.toBe(null);

    SiteCSVModalCtrl.modal.file = fakeCSVImportFileContents;
    SiteCSVModalCtrl.startImport();

    expect(WebExApiGatewayService.csvImport).toHaveBeenCalled();

    deferredCSVImport.reject({
      "errorCode": "060100",
      "errorMessage": "Your request has been prevented because a task is now running. Try again later."
    });

    $rootScope.$apply();

    expect(Notification.error).toHaveBeenCalledWith('siteList.csvRejectedToast-060100');
    expect(WebExSiteRowService.updateCSVStatusInRow).toHaveBeenCalled();
    expect($scope.$close).toHaveBeenCalled();
  });

}); // describe()
