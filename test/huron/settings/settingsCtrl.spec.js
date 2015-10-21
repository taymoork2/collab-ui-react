'use strict';

describe('Controller: HuronSettingsCtrl', function () {
  var controller, $controller, $scope, $q, CallerId, ExternalNumberService, Notification;
  var companyNumbers;

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _CallerId_, _ExternalNumberService_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    CallerId = _CallerId_;
    ExternalNumberService = _ExternalNumberService_;
    Notification = _Notification_;
    $q = _$q_;

    companyNumbers = [{
      "externalCallerIdType": "Company Caller ID",
      "externalNumber": {
        "pattern": "+12292292299",
        "uuid": "75deb3ef-f92a-4d1e-837e-c6c8f02fd300"
      },
      "name": "Cisco",
      "pattern": "+12292292299",
      "uuid": "46a00f3b-07d3-4180-82a2-22ff7dba40e5",
      "url": "https://cmi.huron-int.com/api/v1/voice/customers/909df552-e36d-4889-b9be-ccac895575aa/companynumbers/46a00f3b-07d3-4180-82a2-22ff7dba40e5",
      "links": [{
        "rel": "voice",
        "href": "/api/v1/voice/customers/909df552-e36d-4889-b9be-ccac895575aa/companynumbers/46a00f3b-07d3-4180-82a2-22ff7dba40e5"
      }]
    }];

    spyOn(CallerId, 'listCompanyNumbers').and.returnValue($q.when(companyNumbers));
    spyOn(CallerId, 'saveCompanyNumber').and.returnValue($q.when());
    spyOn(CallerId, 'updateCompanyNumber').and.returnValue($q.when());
    spyOn(CallerId, 'deleteCompanyNumber').and.returnValue($q.when());

    spyOn(Notification, 'notify');
    spyOn(Notification, 'errorResponse');

    controller = $controller('HuronSettingsCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }));

  it('should initialize the company caller ID', function () {
    controller.init();
    $scope.$apply();
    expect(CallerId.listCompanyNumbers).toHaveBeenCalled();
    expect(controller.model.callerId.callerIdName).toBe('Cisco');
  });

  it('should save the company caller ID', function () {
    controller.model.callerId.callerIdEnabled = true;
    controller.model.callerId.uuid = '';
    controller.model.callerId.callerIdName = 'Cisco';
    controller.model.callerId.callerIdNumber = '+12292292299';
    controller.save();
    $scope.$apply();

    expect(CallerId.saveCompanyNumber).toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should notify error when save failed', function () {
    controller.model.callerId.callerIdEnabled = true;
    controller.model.callerId.uuid = '';
    controller.model.callerId.callerIdName = 'Cisco';
    controller.model.callerId.callerIdNumber = '+12292292299';
    CallerId.saveCompanyNumber.and.returnValue($q.reject());
    controller.save();
    $scope.$apply();

    expect(CallerId.saveCompanyNumber).toHaveBeenCalled();
    expect(Notification.errorResponse).toHaveBeenCalled();
  });

  it('should update the company caller ID', function () {
    controller.model.callerId.callerIdEnabled = true;
    controller.model.callerId.uuid = '123456';
    controller.model.callerId.callerIdName = 'Cisco';
    controller.model.callerId.callerIdNumber = '+12292292299';
    controller.save();
    $scope.$apply();

    expect(CallerId.updateCompanyNumber).toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should delete the company caller ID', function () {
    controller.model.callerId.callerIdEnabled = false;
    controller.model.callerId.uuid = '123456';
    controller.save();
    $scope.$apply();

    expect(CallerId.deleteCompanyNumber).toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });
});
