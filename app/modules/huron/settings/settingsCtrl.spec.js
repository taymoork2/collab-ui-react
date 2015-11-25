'use strict';

describe('Controller: HuronSettingsCtrl', function () {
  var controller, $controller, $scope, $q, CallerId, ExternalNumberService, Notification, DialPlanService;
  var HuronCustomer, ServiceSetup;
  var customer, timezones, timezone, voicemailCustomer, internalNumberRanges, sites, site, companyNumbers;

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _CallerId_, _ExternalNumberService_, _DialPlanService_,
    _Notification_, _HuronCustomer_, _ServiceSetup_) {

    $scope = $rootScope.$new();
    $controller = _$controller_;
    CallerId = _CallerId_;
    ExternalNumberService = _ExternalNumberService_;
    Notification = _Notification_;
    HuronCustomer = _HuronCustomer_;
    DialPlanService = _DialPlanService_;
    ServiceSetup = _ServiceSetup_;
    $q = _$q_;

    customer = getJSONFixture('huron/json/settings/customer.json');
    timezones = getJSONFixture('huron/json/timeZones/timeZones.json');
    timezone = getJSONFixture('huron/json/settings/timezone.json');
    internalNumberRanges = getJSONFixture('huron/json/settings/internalNumberRanges.json');
    sites = getJSONFixture('huron/json/settings/sites.json');
    site = sites[0];
    companyNumbers = getJSONFixture('huron/json/settings/companyNumbers.json');
    voicemailCustomer = getJSONFixture('huron/json/settings/voicemailCustomer.json');

    spyOn(HuronCustomer, 'get').and.returnValue($q.when(customer));
    spyOn(ServiceSetup, 'getTimeZones').and.returnValue($q.when(timezones));
    spyOn(ServiceSetup, 'listVoicemailTimezone').and.returnValue($q.when(timezone));
    spyOn(ServiceSetup, 'listInternalNumberRanges').and.returnValue($q.when(internalNumberRanges));
    spyOn(DialPlanService, 'getCustomerDialPlanDetails').and.returnValue($q.when({
      extensionGenerated: 'true'
    }));
    spyOn(ServiceSetup, 'listSites').and.returnValue($q.when(sites));
    spyOn(ServiceSetup, 'getSite').and.returnValue($q.when(site));
    spyOn(ServiceSetup, 'getVoicemailPilotNumber').and.returnValue($q.when(voicemailCustomer));
    spyOn(ServiceSetup, 'createInternalNumberRange').and.returnValue($q.when());
    spyOn(ServiceSetup, 'updateCustomerVoicemailPilotNumber').and.returnValue($q.when());
    spyOn(CallerId, 'listCompanyNumbers').and.returnValue($q.when(companyNumbers));
    spyOn(CallerId, 'saveCompanyNumber').and.returnValue($q.when());
    spyOn(CallerId, 'updateCompanyNumber').and.returnValue($q.when());
    spyOn(CallerId, 'deleteCompanyNumber').and.returnValue($q.when());

    spyOn(Notification, 'notify');
    spyOn(Notification, 'processErrorResponse');

    controller = $controller('HuronSettingsCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }));

  it('should initialize the Settings page', function () {
    controller.init();
    $scope.$apply();
    expect(HuronCustomer.get).toHaveBeenCalled();
    expect(ServiceSetup.listVoicemailTimezone).toHaveBeenCalled();
    expect(ServiceSetup.listInternalNumberRanges).toHaveBeenCalled();
    expect(ServiceSetup.listSites).toHaveBeenCalled();
    expect(CallerId.listCompanyNumbers).toHaveBeenCalled();
    expect(ServiceSetup.getVoicemailPilotNumber).toHaveBeenCalled();
    expect(controller.model.callerId.callerIdName).toBe('Cisco');
  });

  it('should save new internal number range', function () {
    controller.model.displayNumberRanges.push({
      beginNumber: '1001',
      endNumber: '1004'
    });
    controller.save();
    $scope.$apply();

    expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
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

  it('should notify error when save caller ID failed', function () {
    controller.model.callerId.callerIdEnabled = true;
    controller.model.callerId.uuid = '';
    controller.model.callerId.callerIdName = 'Cisco';
    controller.model.callerId.callerIdNumber = '+12292292299';
    CallerId.saveCompanyNumber.and.returnValue($q.reject());
    controller.save();
    $scope.$apply();

    expect(CallerId.saveCompanyNumber).toHaveBeenCalled();
    expect(Notification.processErrorResponse).toHaveBeenCalled();
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

  it('should update the company pilot number', function () {
    controller.externalNumberPool = [{
      uuid: '1234',
      pattern: '+12292291234'
    }];
    controller.hasVoicemailService = true;
    controller.pilotNumberSelected.uuid = '1234';
    controller.pilotNumberSelected.pattern = '(229) 229-1234';
    controller.save();
    $scope.$apply();

    expect(ServiceSetup.updateCustomerVoicemailPilotNumber).toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

});
