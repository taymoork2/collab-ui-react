'use strict';

describe('Controller: CallRouterCtrl', function () {
  var controller, $controller, $scope, $stateParams, $q, Config, Authinfo, RouterCompanyNumber, CallRouterService, ServiceSetup, Notification, $modal;
  var companyNumbers, modalDefer;

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$stateParams_, _$q_, _RouterCompanyNumber_, _CallRouterService_, _ServiceSetup_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $stateParams = _$stateParams_;
    CallRouterService = _CallRouterService_;
    ServiceSetup = _ServiceSetup_;
    RouterCompanyNumber = _RouterCompanyNumber_;
    Notification = _Notification_;
    $q = _$q_;

    companyNumbers = [{
      "externalCallerIdType": "Company Caller ID",
      "externalNumber": {
        "pattern": "+12292292299",
        "uuid": "75deb3ef-f92a-4d1e-837e-c6c8f02fd300"
      },
      "name": "Atlas_Test_JP003",
      "pattern": "+12292292299",
      "uuid": "46a00f3b-07d3-4180-82a2-22ff7dba40e5",
      "url": "https://cmi.hptx1.huron-dev.com/api/v1/voice/customers/909df552-e36d-4889-b9be-ccac895575aa/companynumbers/46a00f3b-07d3-4180-82a2-22ff7dba40e5",
      "links": [{
        "rel": "voice",
        "href": "/api/v1/voice/customers/909df552-e36d-4889-b9be-ccac895575aa/companynumbers/46a00f3b-07d3-4180-82a2-22ff7dba40e5"
      }]
    }];

    spyOn(RouterCompanyNumber, 'listCompanyNumbers').and.returnValue($q.when(companyNumbers));
    spyOn(RouterCompanyNumber, 'updateCompanyNumber').and.returnValue($q.when());
    spyOn(RouterCompanyNumber, 'deleteCompanyNumber').and.returnValue($q.when());

    spyOn(Notification, 'notify');
    spyOn(Notification, 'errorResponse');

    controller = $controller('CallRouterCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }));

  it('should enable the Save button ', function () {
    controller.model.orgname = "";
    controller.model.extnum = "";
    expect(controller.disableFn()).toBeFalsy();

  });

  it('should disable the Save button ', function () {
    controller.callrouterform = {
      $dirty: false
    };

    expect(controller.disableFn()).toBeTruthy();

  });

  it('should delete Company number', function () {
    controller.model.orgname = "";
    controller.model.extnum = "";

    controller.save();
    $scope.$apply();

    expect(RouterCompanyNumber.deleteCompanyNumber).toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should notify error when delete fails', function () {
    controller.model.orgname = "";
    controller.model.extnum = "";
    RouterCompanyNumber.deleteCompanyNumber.and.returnValue($q.reject());
    controller.save();
    $scope.$apply();

    expect(Notification.errorResponse).toHaveBeenCalled();
    expect(RouterCompanyNumber.deleteCompanyNumber).toHaveBeenCalled();
  });

  it('should update Company number', function () {
    controller.model.orgname = "Org_002";
    controller.model.extnum = "+19233344456";
    controller.save();
    $scope.$apply();

    expect(RouterCompanyNumber.updateCompanyNumber).toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should notify error when update fails', function () {
    controller.model.orgname = "JP_002";
    controller.model.extnum = "+19233344456";
    RouterCompanyNumber.updateCompanyNumber.and.returnValue($q.reject());
    controller.save();
    $scope.$apply();

    expect(Notification.errorResponse).toHaveBeenCalled();
    expect(RouterCompanyNumber.updateCompanyNumber).toHaveBeenCalled();
  });
});
