'use strict';

describe('Controller: HuronSettingsCtrl', function () {
  var controller, $controller, $scope, $q, CallerId, ExternalNumberService, Notification, DialPlanService, FeatureToggleService;
  var HuronCustomer, ServiceSetup, PstnSetupService, ModalService, modalDefer, Authinfo;
  var customer, timezones, timezone, voicemailCustomer, internalNumberRanges, sites, site, companyNumbers, cosRestrictions, customerCarriers;
  var getDeferred;

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _CallerId_, _ExternalNumberService_, _DialPlanService_,
    _Notification_, _HuronCustomer_, _ServiceSetup_, _FeatureToggleService_, _PstnSetupService_, _ModalService_, _Authinfo_) {

    $scope = $rootScope.$new();
    $controller = _$controller_;
    CallerId = _CallerId_;
    ExternalNumberService = _ExternalNumberService_;
    Notification = _Notification_;
    HuronCustomer = _HuronCustomer_;
    DialPlanService = _DialPlanService_;
    ServiceSetup = _ServiceSetup_;
    FeatureToggleService = _FeatureToggleService_;
    PstnSetupService = _PstnSetupService_;
    ModalService = _ModalService_;
    Authinfo = _Authinfo_;
    $q = _$q_;
    modalDefer = $q.defer();

    customer = getJSONFixture('huron/json/settings/customer.json');
    timezones = getJSONFixture('huron/json/timeZones/timeZones.json');
    timezone = getJSONFixture('huron/json/settings/timezone.json');
    internalNumberRanges = getJSONFixture('huron/json/settings/internalNumberRanges.json');
    sites = getJSONFixture('huron/json/settings/sites.json');
    site = sites[0];
    companyNumbers = getJSONFixture('huron/json/settings/companyNumbers.json');
    voicemailCustomer = getJSONFixture('huron/json/settings/voicemailCustomer.json');
    cosRestrictions = getJSONFixture('huron/json/settings/cosRestrictions.json');
    customerCarriers = getJSONFixture('huron/json/pstnSetup/customerCarrierList.json');

    //create mock deferred object which will be used to return promises
    getDeferred = $q.defer();

    spyOn(HuronCustomer, 'get').and.returnValue($q.when(customer));
    spyOn(ServiceSetup, 'updateVoicemailTimezone').and.returnValue($q.when());
    spyOn(ServiceSetup, 'getTimeZones').and.returnValue($q.when(timezones));
    spyOn(ServiceSetup, 'listVoicemailTimezone').and.returnValue($q.when(timezone));
    spyOn(ServiceSetup, 'listInternalNumberRanges').and.returnValue($q.when(internalNumberRanges));
    spyOn(ExternalNumberService, 'refreshNumbers').and.returnValue($q.when());
    spyOn(DialPlanService, 'getCustomerDialPlanDetails').and.returnValue($q.when({
      extensionGenerated: 'false'
    }));
    spyOn(ServiceSetup, 'listSites').and.callFake(function () {
      ServiceSetup.sites = sites;
      return $q.when();
    });
    spyOn(FeatureToggleService, 'supports').and.returnValue(getDeferred.promise);
    spyOn(ServiceSetup, 'getSite').and.returnValue($q.when(site));
    spyOn(ServiceSetup, 'getVoicemailPilotNumber').and.returnValue($q.when(voicemailCustomer));
    spyOn(ServiceSetup, 'updateSite').and.returnValue($q.when());
    spyOn(ServiceSetup, 'createInternalNumberRange').and.returnValue($q.when());
    spyOn(ServiceSetup, 'updateCustomer').and.returnValue($q.when());
    spyOn(CallerId, 'listCompanyNumbers').and.returnValue($q.when(companyNumbers));
    spyOn(CallerId, 'saveCompanyNumber').and.returnValue($q.when());
    spyOn(CallerId, 'updateCompanyNumber').and.returnValue($q.when());
    spyOn(CallerId, 'deleteCompanyNumber').and.returnValue($q.when());
    spyOn(ServiceSetup, 'listCosRestrictions').and.returnValue($q.when(cosRestrictions));
    spyOn(ServiceSetup, 'updateCosRestriction').and.returnValue($q.when());

    spyOn(PstnSetupService, 'listCustomerCarriers').and.returnValue($q.when(customerCarriers));
    spyOn(ModalService, 'open').and.returnValue({
      result: modalDefer.promise
    });
    spyOn(Notification, 'notify');
    spyOn(Notification, 'processErrorResponse');
    spyOn(Authinfo, 'getLicenseIsTrial').and.returnValue(true);

    controller = $controller('HuronSettingsCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }));

  describe('isDisableInternationalDialing():', function () {
    it('should disable international dialing toggle if customer is in trial', function () {
      FeatureToggleService.supports.and.returnValue($q.when(false));
      Authinfo.getLicenseIsTrial.and.returnValue(true);

      var isTrial = controller.isDisableInternationalDialing();
      $scope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).toHaveBeenCalled();
      expect(isTrial.$$state.value).toBe(true);
    });

    it('should enable international dialing toggle if customer is NOT in trial', function () {
      FeatureToggleService.supports.and.returnValue($q.when(false));
      Authinfo.getLicenseIsTrial.and.returnValue(false);

      var isTrial = controller.isDisableInternationalDialing();
      $scope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).toHaveBeenCalled();
      expect(isTrial.$$state.value).toBe(false);
    });

    it('should enable international dialing toggle if customer is in trial but has override', function () {
      FeatureToggleService.supports.and.returnValue($q.when(true));

      var isTrial = controller.isDisableInternationalDialing();
      $scope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).not.toHaveBeenCalled();
      expect(isTrial.$$state.value).toBe(false);
    });

    it('should enable international dialing toggle if get override fails but customer is NOT in trial', function () {
      FeatureToggleService.supports.and.returnValue($q.reject());
      Authinfo.getLicenseIsTrial.and.returnValue(false);

      var isTrial = controller.isDisableInternationalDialing();
      $scope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).toHaveBeenCalled();
      expect(isTrial.$$state.value).toBe(false);
    });

    it('should disable international dialing toggle if get override fails and customer is in trial', function () {
      FeatureToggleService.supports.and.returnValue($q.reject());
      Authinfo.getLicenseIsTrial.and.returnValue(true);

      var isTrial = controller.isDisableInternationalDialing();
      $scope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).toHaveBeenCalled();
      expect(isTrial.$$state.value).toBe(true);
    });

    it('should disable international dialing toggle if get override fails and unable to determine if customer is in trial', function () {
      FeatureToggleService.supports.and.returnValue($q.reject());
      Authinfo.getLicenseIsTrial.and.returnValue(undefined);

      var isTrial = controller.isDisableInternationalDialing();
      $scope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).toHaveBeenCalled();
      expect(isTrial.$$state.value).toBe(true);
    });

    it('should not call services if value is already set', function () {
      controller.disableInternationalDialing = true;

      var isTrial = controller.isDisableInternationalDialing();
      $scope.$apply();

      expect(FeatureToggleService.supports).not.toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).not.toHaveBeenCalled();
      expect(isTrial).toBe(true);
    });
  });

  it('should initialize the Settings page', function () {
    controller.init();
    $scope.$apply();
    expect(HuronCustomer.get).toHaveBeenCalled();
    expect(ServiceSetup.listVoicemailTimezone).toHaveBeenCalled();
    expect(ServiceSetup.listInternalNumberRanges).toHaveBeenCalled();
    expect(ServiceSetup.listSites).toHaveBeenCalled();
    expect(CallerId.listCompanyNumbers).toHaveBeenCalled();
    expect(ServiceSetup.getVoicemailPilotNumber).toHaveBeenCalled();
    expect(ServiceSetup.listCosRestrictions).toHaveBeenCalled();
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

  it('should update the company pilot number if not already set', function () {
    controller.externalNumberPool = [{
      uuid: '1234',
      pattern: '+12292291234',
      label: '(229) 229-1234'
    }];

    var pilotNumber = {
      pattern: '(229) 229-1234'
    };

    controller.hasVoicemailService = true;
    controller.model.companyVoicemail.companyVoicemailEnabled = true;
    controller.model.companyVoicemail.companyVoicemailNumber = pilotNumber;

    controller.save();
    $scope.$apply();

    expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
    expect(ServiceSetup.updateSite).toHaveBeenCalled();
    expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
    expect(ModalService.open).not.toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should update the company pilot number and voicemail site timezone', function () {
    controller.externalNumberPool = [{
      uuid: '1234',
      pattern: '+12292291234',
      label: '(229) 229-1234'
    }];

    var pilotNumber = {
      pattern: '(229) 229-1234'
    };

    controller.hasVoicemailService = true;
    controller.model.companyVoicemail.companyVoicemailEnabled = true;
    controller.model.companyVoicemail.companyVoicemailNumber = pilotNumber;

    controller.model.site.timeZone = {
      value: 'bogus',
      timezoneid: '10'
    };

    controller.save();
    $scope.$apply();

    expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
    expect(ServiceSetup.updateSite).toHaveBeenCalled();
    expect(ServiceSetup.updateVoicemailTimezone).toHaveBeenCalled();
    expect(ModalService.open).not.toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should update the company pilot number and voicemail site timezone if voice only', function () {
    controller.externalNumberPool = [{
      uuid: '1234',
      pattern: '+12292291234',
      label: '(229) 229-1234'
    }];

    var pilotNumber = {
      pattern: '(229) 229-1234'
    };

    controller.hasVoicemailService = false;
    controller.model.companyVoicemail.companyVoicemailEnabled = true;
    controller.model.companyVoicemail.companyVoicemailNumber = pilotNumber;

    controller.model.site.timeZone = {
      value: 'bogus',
      timezoneid: '10'
    };

    controller.save();
    $scope.$apply();

    expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
    expect(ServiceSetup.updateSite).toHaveBeenCalled();
    expect(ServiceSetup.updateVoicemailTimezone).toHaveBeenCalled();
    expect(ServiceSetup.listVoicemailTimezone).toHaveBeenCalled();
    expect(ModalService.open).not.toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should add voicemail service and update the company pilot number if voice only', function () {
    controller.externalNumberPool = [{
      uuid: '1234',
      pattern: '+12292291234',
      label: '(229) 229-1234'
    }];

    var pilotNumber = {
      pattern: '(229) 229-1234'
    };

    controller.hasVoicemailService = false;
    controller.model.companyVoicemail.companyVoicemailEnabled = true;
    controller.model.companyVoicemail.companyVoicemailNumber = pilotNumber;

    controller.save();
    $scope.$apply();

    expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
    expect(ServiceSetup.updateSite).toHaveBeenCalled();
    expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
    expect(ModalService.open).not.toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should disable company pilot number when toggle is OFF', function () {
    controller.externalNumberPool = [{
      uuid: '1234',
      pattern: '+12292291234',
      label: '(229) 229-1234'
    }];

    var pilotNumber = {
      pattern: '(229) 229-1234'
    };

    controller.hasVoicemailService = true;
    controller.model.companyVoicemail.companyVoicemailEnabled = false;
    controller.model.companyVoicemail.companyVoicemailNumber = pilotNumber;

    modalDefer.resolve();
    controller.save();
    $scope.$apply();

    expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
    expect(ServiceSetup.updateSite).toHaveBeenCalled();
    expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
    expect(ModalService.open).toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should not disable company pilot number when toggle is OFF', function () {
    controller.externalNumberPool = [{
      uuid: '1234',
      pattern: '+12292291234',
      label: '(229) 229-1234'
    }];

    var pilotNumber = {
      pattern: '(229) 229-1234'
    };

    controller.hasVoicemailService = true;
    controller.model.companyVoicemail.companyVoicemailEnabled = false;
    controller.model.companyVoicemail.companyVoicemailNumber = pilotNumber;

    modalDefer.reject();
    controller.save();
    $scope.$apply();

    //expect(ModalService.open).toHaveBeenCalled();
    expect(ServiceSetup.updateCustomer).not.toHaveBeenCalled();
    expect(ServiceSetup.updateSite).not.toHaveBeenCalled();
    expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();

    expect(controller.model.companyVoicemail.companyVoicemailEnabled).toBe(true);
    expect(controller.model.companyVoicemail.companyVoicemailNumber.pattern).toEqual('(209) 209-0003');
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should not update the company pilot number if nothing changed', function () {
    controller.externalNumberPool = [{
      uuid: '1234',
      pattern: '+12292291234',
      label: '(229) 229-1234'
    }];

    var pilotNumber = {
      pattern: '(229) 229-1234'
    };

    controller.hasVoicemailService = true;
    controller.model.site.voicemailPilotNumber = controller.externalNumberPool[0].pattern;

    controller.model.companyVoicemail.companyVoicemailEnabled = true;
    controller.model.companyVoicemail.companyVoicemailNumber = pilotNumber;

    controller.save();
    $scope.$apply();

    expect(ServiceSetup.updateCustomer).not.toHaveBeenCalled();
    expect(ServiceSetup.updateSite).not.toHaveBeenCalled();
    expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
    expect(ModalService.open).not.toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should show international dialing when feature toggle is ON', function () {
    controller.save();
    $scope.$apply();

    expect(ServiceSetup.updateCosRestriction).toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

});
