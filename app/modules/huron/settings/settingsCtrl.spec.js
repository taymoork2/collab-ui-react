'use strict';

describe('Controller: HuronSettingsCtrl', function () {
  var controller, $controller, $scope, $q, CallerId, ExternalNumberService, Notification, DialPlanService, $httpBackend, HuronConfig, FeatureToggleService, InternationalDialing;
  var Authinfo;
  var HuronCustomer, ServiceSetup, PstnSetupService, ModalService, modalDefer;
  var customer, timezones, timezone, voicemailCustomer, internalNumberRanges, sites, site, companyNumbers, cosRestrictions, customerCarriers;
  var getDeferred;

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _CallerId_, _ExternalNumberService_, _DialPlanService_,
    _Notification_, _HuronCustomer_, _ServiceSetup_, _FeatureToggleService_, _PstnSetupService_, _ModalService_,
    _InternationalDialing_, _Authinfo_, _$httpBackend_, _HuronConfig_) {

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
    InternationalDialing = _InternationalDialing_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    $q = _$q_;
    modalDefer = $q.defer();
    Authinfo = _Authinfo_;

    customer = getJSONFixture('huron/json/settings/customer.json');
    timezones = getJSONFixture('huron/json/settings/timeZones.json');
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

    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
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
    spyOn(InternationalDialing, 'isDisableInternationalDialing').and.returnValue($q.when(true));
    spyOn(PstnSetupService, 'listCustomerCarriers').and.returnValue($q.when(customerCarriers));
    spyOn(ModalService, 'open').and.returnValue({
      result: modalDefer.promise
    });
    spyOn(Notification, 'notify');
    spyOn(Notification, 'processErrorResponse').and.returnValue('');
    spyOn(Authinfo, 'getOrgName').and.returnValue('Cisco Org Name');
    spyOn(Authinfo, 'getOrgId').and.returnValue(customer.uuid);

    $httpBackend
      .expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + customer.uuid + '/directorynumbers')
      .respond([]);
    $httpBackend
      .expectGET(HuronConfig.getCesUrl() + '/customers/' + customer.uuid + '/callExperiences')
      .respond([{
        itemID: 0
      }]);
    $httpBackend
      .expectGET(HuronConfig.getCmiV2Url() + '/customers/' + customer.uuid + '/features/huntgroups')
      .respond([]);

    controller = $controller('HuronSettingsCtrl', {
      $scope: $scope
    });
    $scope.$apply();
    $httpBackend.flush();
  }));

  it('should set the disableExtensions property as true', function () {
    expect(controller.model.disableExtensions).toEqual(true);
  });

  it('should initialize the Settings page', function () {
    expect(HuronCustomer.get).toHaveBeenCalled();
    expect(ServiceSetup.listVoicemailTimezone).toHaveBeenCalled();
    expect(ServiceSetup.listInternalNumberRanges).toHaveBeenCalled();
    expect(ServiceSetup.listSites).toHaveBeenCalled();
    expect(CallerId.listCompanyNumbers).toHaveBeenCalled();
    expect(ServiceSetup.getVoicemailPilotNumber).toHaveBeenCalled();
    expect(ServiceSetup.listCosRestrictions).toHaveBeenCalled();
    expect(controller.model.callerId.callerIdName).toEqual('Cisco');
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
    controller.model.callerId.callerIdNumber = '(229) 229-2299';
    controller.save();
    $scope.$apply();

    expect(CallerId.saveCompanyNumber).toHaveBeenCalled();
    expect(CallerId.updateCompanyNumber).not.toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should update the company caller ID', function () {
    controller.allExternalNumbers = [{
      pattern: '+19725551001',
      label: '(972) 555-1001',
      uuid: '123456'
    }];
    controller.model.callerId.callerIdEnabled = true;
    controller.model.callerId.externalNumber.uuid = '123456';
    controller.model.callerId.callerIdName = 'Cisco';
    controller.existingCallerIdName = 'Cisco Updated';
    controller.model.callerId.callerIdNumber = '(972) 555-1001';
    controller.save();
    $scope.$apply();

    expect(CallerId.saveCompanyNumber).not.toHaveBeenCalled();
    expect(CallerId.updateCompanyNumber).toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should not save the company caller ID if off and no callerId exists', function () {
    controller.model.callerId.callerIdEnabled = false;
    controller.save();
    $scope.$apply();

    expect(CallerId.saveCompanyNumber).not.toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should not save the company caller ID if off and no callerId exists', function () {
    controller.model.callerId.callerIdEnabled = false;
    controller.save();
    $scope.$apply();

    expect(CallerId.saveCompanyNumber).not.toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should notify error when save caller ID failed', function () {
    controller.model.callerId.callerIdEnabled = true;
    controller.model.callerId.uuid = '';
    controller.model.callerId.callerIdName = 'Cisco';
    controller.model.callerId.callerIdNumber = '(229) 229-2299';
    CallerId.saveCompanyNumber.and.returnValue($q.reject());
    controller.save();
    $scope.$apply();

    expect(CallerId.saveCompanyNumber).toHaveBeenCalled();
    expect(CallerId.updateCompanyNumber).not.toHaveBeenCalled();
    expect(Notification.processErrorResponse).toHaveBeenCalled();
  });

  it('should delete the company caller ID', function () {
    controller.model.callerId.callerIdEnabled = false;
    controller.model.callerId.uuid = '123456';
    controller.save();
    $scope.$apply();

    expect(CallerId.saveCompanyNumber).not.toHaveBeenCalled();
    expect(CallerId.updateCompanyNumber).not.toHaveBeenCalled();
    expect(CallerId.deleteCompanyNumber).toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should save the emergency callback number', function () {
    controller.model.serviceNumber = {
      label: "(972) 555-1000",
      pattern: "+19725551000"
    };

    controller.save();
    $scope.$apply();

    expect(ServiceSetup.updateSite).toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should save the emergency callback number if its changing', function () {
    controller.model.serviceNumber = {
      label: "(972) 555-1000",
      pattern: "+19725551000"
    };

    controller.model.site.emergencyCallBackNumber = {
      pattern: "+19725552000"
    };

    controller.save();
    $scope.$apply();

    expect(ServiceSetup.updateSite).toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should not save the emergency callback number if it is NOT set', function () {
    controller.save();
    $scope.$apply();

    expect(ServiceSetup.updateSite).not.toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should not save the emergency callback number if it is NOT changing', function () {
    controller.model.serviceNumber = {
      label: "(972) 555-1000",
      pattern: "+19725551000"
    };

    controller.model.site.emergencyCallBackNumber = {
      pattern: "+19725551000"
    };

    controller.save();
    $scope.$apply();

    expect(ServiceSetup.updateSite).not.toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should update the company pilot number if not already set', function () {
    controller.unassignedExternalNumbers = [{
      uuid: '1234',
      pattern: '+12292291234',
      label: '(229) 229-1234'
    }];

    var pilotNumber = {
      pattern: '+12292291234',
      label: '(229) 229-1234'
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
    controller.unassignedExternalNumbers = [{
      uuid: '1234',
      pattern: '+12292291234',
      label: '(229) 229-1234'
    }];

    var pilotNumber = {
      pattern: '+12292291234',
      label: '(229) 229-1234'
    };

    var userTemplate = [{
      "timeZone": 3,
      "objectId": "d297d451-35f0-420a-a4d5-7db6cd941a72"
    }];

    controller.model.site.timeZone = {
      "value": "Pacific/Honolulu",
      "label": "(GMT-10:00) Hawaii",
      "timezoneid": "2"

    };

    ServiceSetup.listVoicemailTimezone.and.returnValue($q.when(userTemplate));

    controller.hasVoicemailService = false;
    controller.model.companyVoicemail.companyVoicemailEnabled = true;
    controller.model.companyVoicemail.companyVoicemailNumber = pilotNumber;

    controller.save();
    $scope.$apply();

    expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
    expect(ServiceSetup.updateSite).toHaveBeenCalled();
    expect(ServiceSetup.updateVoicemailTimezone).toHaveBeenCalled();
    expect(ModalService.open).not.toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should add voicemail service and update the company pilot number if voice only', function () {
    controller.unassignedExternalNumbers = [{
      uuid: '1234',
      pattern: '+12292291234',
      label: '(229) 229-1234'
    }];

    var pilotNumber = {
      pattern: '+12292291234',
      label: '(229) 229-1234'
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
    controller.unassignedExternalNumbers = [{
      uuid: '1234',
      pattern: '+12292291234',
      label: '(229) 229-1234'
    }];

    var pilotNumber = {
      pattern: '+12292291234',
      label: '(229) 229-1234'
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
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should not update the company pilot number if nothing changed', function () {
    controller.unassignedExternalNumbers = [{
      uuid: '1234',
      pattern: '+12292291234',
      label: '(229) 229-1234'
    }];
    var pilotNumber = {
      label: '(229) 229-1234',
      pattern: '+12292291234'
    };
    controller.model.serviceNumber = undefined;
    controller.hasVoicemailService = true;
    controller.model.site.voicemailPilotNumber = controller.unassignedExternalNumbers[0].pattern;
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

  it('should update site if there is a new outbound steering digit', function () {
    controller.model.site.steeringDigit = '7';
    controller.save();
    $scope.$apply();

    expect(ServiceSetup.updateSite).toHaveBeenCalled();
  });

  it('should show international dialing when feature toggle is ON', function () {
    InternationalDialing.isDisableInternationalDialing.and.returnValue($q.when(false));

    controller.save();
    $scope.$apply();

    expect(ServiceSetup.updateCosRestriction).toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should update the timezone options when collection changes', function () {
    $scope.to = {};

    controller.timeZoneOptions = [{
      "value": "America/Anchorage",
      "label": "(GMT-09:00) Alaska",
      "timezoneid": "3"
    }];

    controller._buildTimeZoneOptions($scope);
    $scope.$apply();

    expect($scope.to.options).toEqual(controller.timeZoneOptions);
  });

  it('outbound dial digit should not be equal to site steering digit', function () {
    expect(site.siteSteeringDigit).not.toEqual(controller.model.steeringDigit);
  });

  it('should have site steering digit removed from the steeringDigits array', function () {
    var index = _.indexOf(controller.steeringDigits, site.siteSteeringDigit);
    expect(index).toEqual(-1);
  });

  describe('formly watcher functions: ', function () {
    var assignedExternalNumbers = [{
      pattern: '+19725551001',
      label: '(972) 555-1001'
    }, {
      pattern: '+19725551002',
      label: '(972) 555-1002'
    }];

    beforeEach(function () {
      $scope.to = {};
      $scope.options = {};
      $scope.options.templateOptions = {};

      controller.allExternalNumbers = [{
        pattern: '+19725551001',
        label: '(972) 555-1001'
      }, {
        pattern: '+19725551002',
        label: '(972) 555-1002'
      }, {
        pattern: '+19725551003',
        label: '(972) 555-1003'
      }, {
        pattern: '+19725551004',
        label: '(972) 555-1004'
      }];

      controller.unassignedExternalNumbers = [{
        pattern: '+19725551003',
        label: '(972) 555-1003'
      }, {
        pattern: '+19725551004',
        label: '(972) 555-1004'
      }];

      // assignedExternalNumbers array is constructed by the difference of all minus
      // unassigned numbers
      controller.assignedExternalNumbers = [{
        pattern: '+19725551001',
        label: '(972) 555-1001'
      }, {
        pattern: '+19725551002',
        label: '(972) 555-1002'
      }];
    });

    it('_buildServiceNumberOptions - should update the service number options when collection changes', function () {
      controller._buildServiceNumberOptions($scope);
      $scope.$apply();

      expect($scope.to.options).toEqual(assignedExternalNumbers);
    });

    it('_buildServiceNumberOptions - add the service number back in the list if it is already set but not assigned to a user or spark call feature', function () {
      controller.model.site.emergencyCallBackNumber = {
        pattern: '+19725551003'
      };
      controller.model.serviceNumber = {
        pattern: '+19725551003',
        label: '(972) 555-1003'
      };

      var expectedOptions = [{
        pattern: '+19725551001',
        label: '(972) 555-1001'
      }, {
        pattern: '+19725551002',
        label: '(972) 555-1002'
      }, {
        pattern: '+19725551003',
        label: '(972) 555-1003'
      }];

      controller._buildServiceNumberOptions($scope);
      $scope.$apply();

      expect($scope.to.options).toEqual(expectedOptions);
    });

    it('_buildServiceNumberOptions - should also remove the voicemail number if found', function () {
      controller.model.site.voicemailPilotNumber = '+19725551001';
      var expectedOptions = [{
        pattern: '+19725551002',
        label: '(972) 555-1002'
      }];
      controller._buildServiceNumberOptions($scope);
      $scope.$apply();

      expect($scope.to.options).toEqual(expectedOptions);
    });

    it('_buildVoicemailNumberOptions - should update the voicemail number options when collection changes', function () {
      controller.model.site.voicemailPilotNumber = undefined;
      controller.model.serviceNumber = undefined;

      controller._buildVoicemailNumberOptions($scope);
      $scope.$apply();

      expect($scope.to.options).toEqual(controller.unassignedExternalNumbers);
    });

    it('_buildVoicemailNumberOptions - should add the voicemail number back in the list if it is already assigned', function () {
      controller.model.serviceNumber = undefined;
      controller.model.site.voicemailPilotNumber = '+19725551001';
      var expectedOptions = [{
        pattern: '+19725551003',
        label: '(972) 555-1003'
      }, {
        pattern: '+19725551004',
        label: '(972) 555-1004'
      }, {
        pattern: '+19725551001',
        label: '(972) 555-1001'
      }];

      controller._buildVoicemailNumberOptions($scope);
      $scope.$apply();

      expect($scope.to.options).toEqual(expectedOptions);
    });

    it('_buildVoicemailNumberOptions - should remove the emergency callback number if found', function () {
      controller.model.serviceNumber = {
        pattern: '+19725551003',
        label: '(972) 555-1003'
      };
      controller.model.site.voicemailPilotNumber = '+19725551001';
      var expectedOptions = [{
        pattern: '+19725551004',
        label: '(972) 555-1004'
      }, {
        pattern: '+19725551001',
        label: '(972) 555-1001'
      }];

      controller._buildVoicemailNumberOptions($scope);
      $scope.$apply();

      expect($scope.to.options).toEqual(expectedOptions);
    });

    it('_buildVoicemailNumberOptions - should remove the caller id number if found', function () {
      controller.model.callerId.callerIdNumber = '(972) 555-1003';
      controller.model.site.voicemailPilotNumber = '+19725551001';
      var expectedOptions = [{
        pattern: '+19725551004',
        label: '(972) 555-1004'
      }, {
        pattern: '+19725551001',
        label: '(972) 555-1001'
      }];

      controller._buildVoicemailNumberOptions($scope);
      $scope.$apply();

      expect($scope.to.options).toEqual(expectedOptions);
    });

    it('_buildCallerIdOptions - should update the callerId number options when collection changes', function () {
      controller.model.site.voicemailPilotNumber = undefined;
      controller.model.serviceNumber = undefined;
      var expectedOptions = ['(972) 555-1001', '(972) 555-1002', '(972) 555-1003', '(972) 555-1004'];

      controller._buildCallerIdOptions($scope);
      $scope.$apply();

      expect($scope.to.options).toEqual(expectedOptions);
    });

    it('_buildCallerIdOptions - should remove the voicemail number if found', function () {
      controller.model.site.voicemailPilotNumber = '+19725551001';
      controller.model.serviceNumber = {
        pattern: '+19725551002',
        label: '(972) 555-1002'
      };
      var expectedOptions = ['(972) 555-1002', '(972) 555-1003', '(972) 555-1004'];

      controller._buildCallerIdOptions($scope);
      $scope.$apply();

      expect($scope.to.options).toEqual(expectedOptions);
    });

    it('_voicemailNumberWatcher - should update options', function () {
      controller.model.companyVoicemail.companyVoicemailNumber = undefined;
      var initialOptions = ['(972) 555-1001', '(972) 555-1002', '(972) 555-1003', '(972) 555-1004'];
      var expectedOptions = ['(972) 555-1002', '(972) 555-1003', '(972) 555-1004'];
      var reorderedOptions = ['(972) 555-1002', '(972) 555-1003', '(972) 555-1004', '(972) 555-1001'];

      controller._buildCallerIdOptions($scope);
      controller._voicemailNumberWatcher($scope);
      $scope.$apply();

      expect($scope.to.options).toEqual(initialOptions);

      // call once to validate voicemail number is removed
      controller.model.companyVoicemail.companyVoicemailNumber = {
        pattern: '+19725551001',
        label: '(972) 555-1001'
      };
      $scope.$apply();
      expect($scope.to.options).toEqual(expectedOptions);

      // call again to make sure nothing changes
      $scope.$apply();
      expect($scope.to.options).toEqual(expectedOptions);

      // unset the number and expect the option to be added back
      controller.model.companyVoicemail.companyVoicemailNumber = undefined;
      $scope.$apply();
      expect($scope.to.options).toEqual(reorderedOptions);

      // call again to make sure nothing changes
      $scope.$apply();
      expect($scope.to.options).toEqual(reorderedOptions);
    });

    it('_callerIdNumberWatcher - should update options', function () {
      controller.model.callerId.callerIdNumber = '';
      controller.model.companyVoicemail.companyVoicemailNumber = undefined;

      // simulate no existing voicemail number or service number
      controller.model.site.voicemailPilotNumber = undefined;
      controller.model.site.emergencyCallBackNumber = undefined;
      controller.model.serviceNumber = undefined;

      var expectedOptions = [{
        pattern: '+19725551004',
        label: '(972) 555-1004'
      }];
      var reorderedOptions = [{
        pattern: '+19725551004',
        label: '(972) 555-1004'
      }, {
        pattern: '+19725551003',
        label: '(972) 555-1003'
      }];

      controller._buildVoicemailNumberOptions($scope);
      controller._callerIdNumberWatcher($scope);
      $scope.$apply();
      expect($scope.to.options).toEqual(controller.unassignedExternalNumbers);

      // call once to validate callerId number is removed
      controller.model.callerId.callerIdNumber = '(972) 555-1003';
      $scope.$apply();
      expect($scope.to.options).toEqual(expectedOptions);

      // call again to make sure nothing changes
      $scope.$apply();
      expect($scope.to.options).toEqual(expectedOptions);

      // call once to validate partial callerId number is not added
      // instead the old selected number is added back
      controller.model.callerId.callerIdNumber = '(972) 555-10';
      $scope.$apply();
      expect($scope.to.options).toEqual(reorderedOptions);

      // unset the number and expect the option to be added back
      controller.model.callerId.callerIdNumber = '';
      $scope.$apply();
      expect($scope.to.options).toEqual(reorderedOptions);

      // call again to make sure nothing changes
      $scope.$apply();
      expect($scope.to.options).toEqual(reorderedOptions);
    });

    it('_voicemailEnabledWatcher - should update number when changing enabled to disabled', function () {
      controller.model.site.voicemailPilotNumber = undefined;
      controller.model.companyVoicemail.companyVoicemailNumber = {
        pattern: '+19725551001',
        label: '(972) 555-1001'
      };
      controller.model.companyVoicemail.companyVoicemailEnabled = false;

      controller._buildVoicemailNumberOptions($scope);
      controller._voicemailEnabledWatcher($scope);
      $scope.$apply();

      expect(controller.model.companyVoicemail.companyVoicemailNumber).not.toBeDefined();
    });

    it('_voicemailEnabledWatcher - should update number when changing disabled to enabled', function () {
      controller.model.site.voicemailPilotNumber = undefined;
      controller.model.companyVoicemail.companyVoicemailNumber = undefined;
      controller.model.companyVoicemail.companyVoicemailEnabled = true;

      var expectedValue = {
        pattern: '+19725551003',
        label: '(972) 555-1003'
      };

      controller._buildVoicemailNumberOptions($scope);
      controller._voicemailEnabledWatcher($scope);
      $scope.$apply();

      expect(controller.model.companyVoicemail.companyVoicemailNumber).toEqual(expectedValue);
    });

    it('_voicemailEnabledWatcher - should show warning if no available options exist', function () {
      controller.model.site.voicemailPilotNumber = undefined;
      controller.model.companyVoicemail.companyVoicemailNumber = undefined;
      controller.model.companyVoicemail.companyVoicemailEnabled = true;
      controller.model.serviceNumber = {
        pattern: undefined
      };
      controller.unassignedExternalNumbers = [];
      $scope.to.options = [];

      controller._buildVoicemailNumberOptions($scope);
      controller._voicemailEnabledWatcher($scope);
      $scope.$apply();

      expect(controller.model.companyVoicemail.companyVoicemailNumber).not.toBeDefined();
      expect($scope.options.templateOptions.isWarn).toBe(true);
    });

    it('_callerIdEnabledWatcher - should update number when changing enabled to disabled', function () {
      controller.model.callerId.uuid = '';
      controller.model.callerId.callerIdNumber = '(972) 555-1001';
      controller.model.callerId.callerIdEnabled = false;

      controller._buildCallerIdOptions($scope);
      controller._callerIdEnabledWatcher($scope);
      $scope.$apply();

      expect(controller.model.callerId.callerIdNumber).toEqual('');
    });

    it('_callerIdEnabledWatcher - should update number when changing disabled to enabled', function () {
      controller.model.callerId.uuid = '';
      controller.model.callerId.callerIdName = '';
      controller.model.callerId.callerIdNumber = '';
      controller.model.callerId.callerIdEnabled = true;

      var expectedValue = '(972) 555-1001';

      controller._buildCallerIdOptions($scope);
      controller._callerIdEnabledWatcher($scope);
      $scope.$apply();

      expect(controller.model.callerId.callerIdNumber).toEqual(expectedValue);
      expect(controller.model.callerId.callerIdName).toEqual('Cisco Org Name');
    });

    it('should update timezone when timezone selection changes and feature toggle is ON', function () {
      controller.model.site.timeZone = {
        "value": "America/Anchorage",
        "label": "(GMT-09:00) Alaska",
        "timezoneid": "3"
      };
      controller.save();
      $scope.$apply();

      expect(ServiceSetup.updateSite).toHaveBeenCalled();
      expect(ServiceSetup.updateVoicemailTimezone).toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should not update timezone when timezone selection did not change and Feature toggle is ON', function () {
      /* the default "timezoneid = 4" is loaded in the beginnig
        so updating the timezone with same id will not result in any updates
        being sent to unity and updm */
      controller.model.site.timeZone = {
        "value": "America/Los_Angeles",
        "label": "(GMT-08:00) Pacific Time (US & Canada)",
        "timezoneid": "4"
      };
      controller.save();
      $scope.$apply();

      expect(ServiceSetup.updateSite).not.toHaveBeenCalled();
      expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

  });

});
