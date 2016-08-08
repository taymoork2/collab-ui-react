'use strict';

describe('Controller: ServiceSetup', function () {
  var $controller, $scope, $state, $previousState, $q, $httpBackend, ServiceSetup, Notification, HuronConfig, HuronCustomer, DialPlanService;
  var Authinfo, VoicemailMessageAction;
  var model, customer, voicemail, externalNumberPool, usertemplate, form, timeZone, ExternalNumberService, ModalService, modalDefer, messageAction;
  var $rootScope, FeatureToggleService;
  var dialPlanDetailsNorthAmerica = [{
    countryCode: "+1",
    extensionGenerated: "false",
    steeringDigitRequired: "true",
    supportSiteCode: "true",
    supportSiteSteeringDigit: "true"
  }];

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$rootScope_, _$previousState_, _$controller_, _$q_, _ServiceSetup_, _Notification_, _HuronConfig_, _$httpBackend_,
    _HuronCustomer_, _DialPlanService_, _ExternalNumberService_, _ModalService_, _Authinfo_, _VoicemailMessageAction_, _FeatureToggleService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $controller = _$controller_;
    $q = _$q_;
    ServiceSetup = _ServiceSetup_;
    Notification = _Notification_;
    HuronCustomer = _HuronCustomer_;
    DialPlanService = _DialPlanService_;
    ExternalNumberService = _ExternalNumberService_;
    ModalService = _ModalService_;
    HuronConfig = _HuronConfig_;
    $httpBackend = _$httpBackend_;
    Authinfo = _Authinfo_;
    modalDefer = $q.defer();
    VoicemailMessageAction = _VoicemailMessageAction_;
    $previousState = _$previousState_;
    FeatureToggleService = _FeatureToggleService_;

    customer = {
      "uuid": "84562afa-2f35-474f-ba0f-2def42864e12",
      "name": "Atlas_Test_JP650",
      "servicePackage": "DEMO_STANDARD",
      "links": [{
        "rel": "common",
        "href": "/api/v1/common/customers/84562afa-2f35-474f-ba0f-2def42864e12"
      }, {
        "rel": "voicemail",
        "href": "/api/v1/voicemail/customers/84562afa-2f35-474f-ba0f-2def42864e12"
      }, {
        "rel": "voice",
        "href": "/api/v1/voice/customers/84562afa-2f35-474f-ba0f-2def42864e12"
      }]
    };
    
    timeZone = [{
      id: 'America/Los_Angeles',
      label: 'America/Los_Angeles'
    }];
    voicemail = {
      name: "Simon",
      pilotNumber: "+16506679080",
      label: "(650) 667-9080"
    };
    usertemplate = [{
      timeZone: '3',
      timeZoneName: 'America/Los_Angeles',
      alias: '1',
      objectId: 'fd87d99c-98a4-45db-af59-ebb9a6f18fdd'
    }];
    externalNumberPool = [{
      directoryNumber: null,
      pattern: "+14084744518",
      uuid: 'c0d5c7d8-306a-48db-af93-3cba6d433db0'
    }];

    $state = {
      current: {
        data: {
          firstTimeSetup: false
        }
      }
    };

    form = {
      '$invalid': false
    };

    messageAction = getJSONFixture('huron/json/settings/messageAction.json');

    spyOn($previousState, 'get').and.returnValue({
      state: {
        name: 'test.state'
      }
    });

    spyOn(ServiceSetup, 'createInternalNumberRange').and.returnValue($q.when());
    spyOn(ServiceSetup, 'deleteInternalNumberRange').and.returnValue($q.when());
    spyOn(ServiceSetup, 'listSites').and.callFake(function () {
      ServiceSetup.sites = [model.site];
      return $q.when();
    });
    spyOn(ServiceSetup, 'createSite').and.returnValue($q.when());
    spyOn(ServiceSetup, 'updateSite').and.returnValue($q.when());

    spyOn(HuronCustomer, 'get').and.returnValue($q.when(customer));
    spyOn(ServiceSetup, 'listVoicemailTimezone').and.returnValue($q.when(usertemplate));
    spyOn(ServiceSetup, 'loadExternalNumberPool').and.returnValue($q.when(externalNumberPool));
    spyOn(ServiceSetup, 'updateCustomer').and.returnValue($q.when());
    spyOn(ServiceSetup, 'updateVoicemailTimezone').and.returnValue($q.when());
    spyOn(ExternalNumberService, 'refreshNumbers').and.returnValue($q.when());

    spyOn(ServiceSetup, 'listInternalNumberRanges').and.callFake(function () {
      ServiceSetup.internalNumberRanges = model.numberRanges;
      return $q.when();
    });

    spyOn(ServiceSetup, 'getTimeZones').and.returnValue($q.when(timeZone));
    spyOn(Notification, 'notify');
    spyOn(Notification, 'errorResponse');
    spyOn(DialPlanService, 'getCustomerDialPlanDetails').and.returnValue($q.when(dialPlanDetailsNorthAmerica));
    spyOn(ModalService, 'open').and.returnValue({
      result: modalDefer.promise
    });

    spyOn(Authinfo, 'getOrgName').and.returnValue('Cisco Org Name');
    spyOn(Authinfo, 'getOrgId').and.returnValue(customer.uuid);

    spyOn(VoicemailMessageAction, 'get').and.returnValue($q.when(messageAction));
    spyOn(VoicemailMessageAction, 'update').and.returnValue($q.when());

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
  }));
  describe('Existing Functioanlity with Feature Toggle ON Tests', function () {
    var controller;
    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      model = {
        site: {
          uuid: '777-888-666',
          steeringDigit: '5',
          siteSteeringDigit: '6',
          siteCode: '200',
          voicemailPilotNumber: "+16506679080",
          timeZone: {
            id: 'America/Los_Angeles',
            label: 'America/Los_Angeles'
          },
          voicemailPilotNumberGenerated: false
        },
        numberRanges: [{
          beginNumber: '5000',
          endNumber: '5999',
          uuid: '555-666-777'
        }, {
          beginNumber: '6000',
          endNumber: '6999'
        }, {
          beginNumber: '4000',
          endNumber: '4000'
        }]
      };
      spyOn(ServiceSetup, 'getSite').and.returnValue($q.when(model.site));
      spyOn(ServiceSetup, 'getVoicemailPilotNumber').and.returnValue($q.when(voicemail));
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));

      controller = $controller('ServiceSetupCtrl', {
        $scope: $scope,
        $state: $state,
        ServiceSetup: ServiceSetup
      });

      controller.form = form;
      $scope.$apply();
      $httpBackend.flush();
    }));
    describe('auto attendants returns an array with an element', function () {
      it('should set the disableExtensions property as true', function () {
        expect(controller.model.disableExtensions).toEqual(true);
      });
    });

    describe('initController when is first time setup', function () {
      beforeEach(function () {
        $state.current.data.firstTimeSetup = true;
      });

      //TODO: re-enable option '8' once it is an acceptable steering digit
      xit('should have the default site steering digit in the steeringDigits array', function () {
        var index = _.indexOf(controller.steeringDigits, '8');
        expect(index).toEqual(7);
      });
    });

    describe('initController when is not first time setup', function () {

      it('should have customer service info', function () {
        expect(controller.hasVoicemailService).toEqual(true);
      });

      it('should have internal number ranges', function () {
        expect(controller.model.numberRanges).toEqual(model.numberRanges);
      });

      it('should have site steering digit removed from the steeringDigits array', function () {
        var index = _.indexOf(controller.steeringDigits, model.site.siteSteeringDigit);
        expect(index).toEqual(-1);
      });
    });

    describe('deleteInternalNumberRange', function () {

      it('should remove from list and notify success', function () {
        var index = 0;
        var internalNumberRange = model.numberRanges[index];
        controller.deleteInternalNumberRange(model.numberRanges[0]);
        $scope.$apply();

        expect(ServiceSetup.deleteInternalNumberRange).toHaveBeenCalled();
        expect(controller.model.numberRanges).not.toContain(internalNumberRange);
      });

      it('should remove from list and not notify', function () {
        var index = 1;
        var internalNumberRange = model.numberRanges[index];
        controller.deleteInternalNumberRange(internalNumberRange);
        $scope.$apply();

        expect(ServiceSetup.deleteInternalNumberRange).not.toHaveBeenCalled();
        expect(Notification.notify).not.toHaveBeenCalled();
        expect(controller.model.numberRanges).not.toContain(internalNumberRange);
      });

      it('should remove singleNumberRange and not notify', function () {
        var index = 2;
        var internalNumberRange = model.numberRanges[index];
        controller.deleteInternalNumberRange(internalNumberRange);
        $scope.$apply();

        expect(ServiceSetup.deleteInternalNumberRange).not.toHaveBeenCalled();
        expect(Notification.notify).not.toHaveBeenCalled();
        expect(controller.model.numberRanges).not.toContain(internalNumberRange);
      });

      it('should notify error on error', function () {
        ServiceSetup.deleteInternalNumberRange.and.returnValue($q.reject());

        var index = 0;
        var internalNumberRange = model.numberRanges[index];
        controller.deleteInternalNumberRange(internalNumberRange);
        $scope.$apply();

        expect(ServiceSetup.deleteInternalNumberRange).toHaveBeenCalled();
        expect(Notification.errorResponse).toHaveBeenCalled();
        expect(controller.model.numberRanges).toContain(internalNumberRange);
      });
    });

    describe('initNext', function () {

      it('customer with voicemail service should create site', function () {
        var selectedPilotNumber = {
          pattern: '+19728965000',
          label: '(972) 896-5000'
        };

        controller.hasSites = false;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.hasVoicemailService = true;
        controller.model.site.timeZone = {
          id: 'bogus'
        };
        controller.previousTimeZone = controller.model.site.timeZone;

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.createSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
        expect(VoicemailMessageAction.update).not.toHaveBeenCalled();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();

      });

      it('customer with voicemail should not disable if user cancels voicemail modal warning', function () {
        var selectedPilotNumber = {
          pattern: '+19728965000',
          label: '(972) 896-5000'
        };

        controller.hasSites = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = false;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.hasVoicemailService = true;

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);

        modalDefer.reject();
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.updateSite).not.toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).not.toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
        expect(VoicemailMessageAction.update).not.toHaveBeenCalled();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
        expect(ModalService.open).toHaveBeenCalled();
      });

      it('customer with voicemail service should not create site when update customer fails', function () {
        var selectedPilotNumber = {
          pattern: '+19728965000',
          label: '(972) 896-5000'
        };

        controller.hasSites = false;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.hasVoicemailService = true;

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        ServiceSetup.updateCustomer.and.returnValue($q.reject());
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.createSite).not.toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
        expect(VoicemailMessageAction.update).not.toHaveBeenCalled();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      it('customer with voicemail service should not create site when create site fails', function () {
        var selectedPilotNumber = {
          pattern: '+19728965000',
          label: '(972) 896-5000'
        };

        controller.hasSites = false;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.hasVoicemailService = true;
        controller.model.site.timeZone = {
          id: 'bogus'
        };
        controller.previousTimeZone = controller.model.site.timeZone;

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        ServiceSetup.createSite.and.returnValue($q.reject());
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.createSite).toHaveBeenCalled();
        expect(controller.hasSites).toEqual(false);
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
        expect(VoicemailMessageAction.update).not.toHaveBeenCalled();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      it('customer with voicemail service should not update site when update site fails', function () {
        var selectedPilotNumber = {
          pattern: '+19728965000',
          label: '(972) 896-5000'
        };

        controller.hasSites = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.hasVoicemailService = true;

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        ServiceSetup.updateSite.and.returnValue($q.reject());
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.updateSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
        expect(VoicemailMessageAction.update).not.toHaveBeenCalled();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      it('customer with voicemail service should not update site when update customer fails', function () {
        var selectedPilotNumber = {
          pattern: '+19728965000',
          label: '(972) 896-5000'
        };

        controller.hasSites = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.hasVoicemailService = true;

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        ServiceSetup.updateCustomer.and.returnValue($q.reject());
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.updateSite).not.toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
        expect(VoicemailMessageAction.update).not.toHaveBeenCalled();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      it('customer with voicemail service should not update site when update voicemail timezone fails', function () {
        var selectedPilotNumber = {
          pattern: '+19728965000',
          label: '(972) 896-5000'
        };

        controller.hasSites = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.hasVoicemailService = true;
        controller.model.site.timeZone = {
          id: 'bogus'
        };

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        ServiceSetup.updateVoicemailTimezone.and.returnValue($q.reject());
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.updateSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).toHaveBeenCalled();
        expect(VoicemailMessageAction.update).not.toHaveBeenCalled();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      it('customer with voicemail service should not update timezone when timezone id is missing', function () {
        var selectedPilotNumber = {
          pattern: '+19728965000',
          label: '(972) 896-5000'
        };

        controller.hasSites = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.hasVoicemailService = true;
        controller.model.site.timeZone = {
          label: 'bogus'
        };

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        ServiceSetup.updateVoicemailTimezone.and.returnValue($q.reject());
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.updateSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
        expect(VoicemailMessageAction.update).not.toHaveBeenCalled();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      it('customer with voicemail service should create site and change voicemail timezone', function () {
        var selectedPilotNumber = {
          pattern: '+19728965000',
          label: '(972) 896-5000'
        };

        controller.hasSites = false;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.model.ftswCompanyVoicemail.ftswVoicemailToEmail = true;
        controller.hasVoicemailService = true;
        controller.model.site.timeZone = {
          id: 'bogus'
        };

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.createSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).toHaveBeenCalled();
        expect(VoicemailMessageAction.update).toHaveBeenCalled();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
      });

      it('customer with voicemail service should not update customer or site on no change', function () {
        var selectedPilotNumber = {
          label: voicemail.label,
          pattern: voicemail.pilotNumber
        };

        controller.hasSites = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.model.ftswCompanyVoicemail.ftswVoicemailToEmail = true;
        controller.model.ftswCompanyVoicemail.ftswExternalVoiceMail = true;

        controller.hasVoicemailService = true;
        controller.voicemailMessageAction = {
          objectId: '1',
          voicemailAction: 3
        };

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.updateSite).not.toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).not.toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
        expect(VoicemailMessageAction.update).not.toHaveBeenCalled();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
      });

      it('customer with voicemail service should not update customer but update site with TZ data', function () {
        var selectedPilotNumber = {
          label: voicemail.label,
          pattern: voicemail.pilotNumber
        };

        controller.hasSites = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.model.ftswCompanyVoicemail.ftswExternalVoiceMail = true;
        controller.hasVoicemailService = true;
        controller.model.site.timeZone = {
          id: 'bogus'
        };

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.updateSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).not.toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).toHaveBeenCalled();
        expect(VoicemailMessageAction.update).not.toHaveBeenCalled();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
      });

      it('customer with voicemail service and VM Pilot must update customer and site with TZ data', function () {
        var selectedPilotNumber = {
          pattern: '+19728965000',
          label: '(972) 896-5000'
        };

        controller.hasSites = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.hasVoicemailService = true;
        controller.model.site.timeZone = {
          id: 'bogus'
        };

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.updateSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).toHaveBeenCalled();
        expect(VoicemailMessageAction.update).not.toHaveBeenCalled();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
      });

      it('customer without voicemail service must update site with TZ data', function () {
        var selectedPilotNumber = {
          pattern: '+19728965000',
          label: '(972) 896-5000'
        };

        controller.hasSites = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.hasVoicemailService = false;
        controller.model.site.timeZone = {
          id: 'bogus'
        };

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.updateSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).toHaveBeenCalled();
        expect(VoicemailMessageAction.update).not.toHaveBeenCalled();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
      });

      it('customer with voicemail service should create voice only site', function () {
        controller.hasSites = false;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = false;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = undefined;
        controller.hasVoicemailService = true;
        controller.model.site.timeZone = {
          id: 'bogus'
        };
        controller.previousTimeZone = controller.model.site.timeZone;

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        modalDefer.resolve();
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.createSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
        expect(VoicemailMessageAction.update).not.toHaveBeenCalled();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
        expect(ModalService.open).toHaveBeenCalled();
      });

      it('customer without voicemail should not disable voicemail', function () {
        controller.hasSites = true;
        controller.model.site.voicemailPilotNumber = undefined;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = false;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = undefined;
        controller.hasVoicemailService = false;

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.updateSite).not.toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).not.toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
        expect(VoicemailMessageAction.update).not.toHaveBeenCalled();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
      });

      it('customer without voicemail should update site when customer has pilot number misconfig', function () {
        var selectedPilotNumber = {
          pattern: '+19728965000',
          label: '(972) 896-5000'
        };

        controller.hasSites = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.hasVoicemailService = false;

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.updateSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
        expect(VoicemailMessageAction.update).not.toHaveBeenCalled();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
      });

      it('customer without voicemail should update site', function () {
        var selectedPilotNumber = {
          pattern: '+19728965000',
          label: '(972) 896-5000'
        };

        controller.hasSites = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.hasVoicemailService = false;

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.updateSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
        expect(VoicemailMessageAction.update).not.toHaveBeenCalled();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
      });

      it('customer enabling voicemail should update site and voicemail timezone', function () {
        var selectedPilotNumber = {
          pattern: '+19728965000',
          label: '(972) 896-5000'
        };

        controller.hasSites = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.hasVoicemailService = false;
        controller.model.site.timeZone = {
          id: 'bogus'
        };

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.updateSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).toHaveBeenCalled();
        expect(VoicemailMessageAction.update).not.toHaveBeenCalled();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
      });

      it('customer with new outbound steering digit should update site', function () {
        controller.hasSites = true;
        controller.model.ftswSteeringDigit = '5';
        controller.model.site.steeringDigit = '1';
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.updateSite).toHaveBeenCalled();
      });

      it('should notify error if createInternalNumberRange fails', function () {
        ServiceSetup.createInternalNumberRange.and.returnValue($q.reject());

        var promise = controller.initNext();
        $scope.$apply();

        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
        expect(promise.$$state.value).toEqual('Site/extension create failed.');
      });

      it('should call getCustomerDialPlanDetails()', function () {
        expect(DialPlanService.getCustomerDialPlanDetails).toHaveBeenCalled();
      });

      it('should call createInternalNumberRange() if hideFieldInternalNumberRange is false', function () {
        controller.hideFieldInternalNumberRange = false;
        controller.initNext();
        $scope.$apply();
        expect(ServiceSetup.createInternalNumberRange).toHaveBeenCalled();
      });

      it('should call not createInternalNumberRange() if hideFieldInternalNumberRange is true', function () {
        controller.hideFieldInternalNumberRange = true;
        controller.initNext();
        $scope.$apply();
        expect(ServiceSetup.createInternalNumberRange).not.toHaveBeenCalled();
      });
    });

    describe('setServiceValues', function () {

      it('should call DialPlanService()', function () {
        expect(DialPlanService.getCustomerDialPlanDetails).toHaveBeenCalled();
      });
    });

    describe('initnext.updateTimezone', function () {

      it('should notify error if timeZone Id is not a string', function () {
        var selectedPilotNumber = {
          pattern: '+19728965000',
          label: '(972) 896-5000'
        };

        controller.hasSites = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.hasVoicemailService = true;
        controller.model.site.timeZone = {
          id: 3
        };

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.updateSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).not.toHaveBeenCalled();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      it('should pass timeZone Id to ServiceSetup.updateVoicemailTimezone', function () {
        var selectedPilotNumber = {
          pattern: '+19728965000',
          label: '(972) 896-5000'
        };

        controller.hasSites = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.hasVoicemailService = true;
        controller.model.site.timeZone = {
          id: 'America/Chicago'
        };

        //remove singlenumber range for it to pass
        controller.deleteInternalNumberRange(model.numberRanges[2]);
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.updateSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ServiceSetup.updateVoicemailTimezone).toHaveBeenCalledWith(controller.model.site.timeZone.id, usertemplate[0].objectId);
      });
    });
  });

  describe('VoiceMail with OptionalVmDidFeatureToggle OFF Tests', function () {
    var controller;
    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      model = {
        site: {
          uuid: '777-888-666',
          steeringDigit: '5',
          siteSteeringDigit: '6',
          siteCode: '200',
          voicemailPilotNumber: "+16506679080",
          timeZone: {
            id: 'America/Los_Angeles',
            label: 'America/Los_Angeles'
          },
          voicemailPilotNumberGenerated: 'false'
        },
        numberRanges: [{
          beginNumber: '5000',
          endNumber: '5999',
          uuid: '555-666-777'
        }, {
          beginNumber: '6000',
          endNumber: '6999'
        }, {
          beginNumber: '4000',
          endNumber: '4000'
        }]
      };
      voicemail = {
        name: "Simon",
        pilotNumber: "+16506679080",
        label: "(650) 667-9080"
      };
      spyOn(ServiceSetup, 'getSite').and.returnValue($q.when(model.site));
      spyOn(ServiceSetup, 'getVoicemailPilotNumber').and.returnValue($q.when(voicemail));
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(false));
      controller = $controller('ServiceSetupCtrl', {
        $scope: $scope,
        $state: $state,
        ServiceSetup: ServiceSetup
      });

      controller.form = form;
      $scope.$apply();
      $httpBackend.flush();
    }));
    describe('Site is created and voicemail is set with DID featuretoggle OFF', function () {
      it('voicemailPilotNumberGenerated is false', function () {
        expect(controller.model.site.voicemailPilotNumberGenerated).toEqual('false');
      });

      it('site is created with voicemail with featuretoggle OFF', function () {
        var selectedPilotNumber = {
          pattern: '+19728965000',
          label: '(972) 896-5000'
        };
        controller.model.site.timeZone = {
          id: 'bogus'
        };
        controller.hasSites = false;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.hasVoicemailService = true;
        controller.initNext();
        $scope.$apply();
        expect(ServiceSetup.createSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
      });

    });

    describe('Site and voicemail are updated with new DID pilotnumber featuretoggle OFF', function () {
      it('site is created with voicemail with featuretoggle OFF', function () {
        var selectedPilotNumber = {
          pattern: '+19728965001',
          label: '(972) 896-5001'
        };
        controller.model.site.timeZone = {
          id: 'bogus'
        };
        controller.hasSites = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.model.ftswCompanyVoicemail.ftswExternalVoiceMail = true;
        controller.hasVoicemailService = true;
        controller.initNext();
        $scope.$apply();

        expect(ServiceSetup.updateSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
      });

    });

  });
  describe('VoiceMail with Generated VoiceMail Pilot with OptionalVmDidFeatureToggle ON Tests', function () {
    var controller;
    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      model = {
        site: {
          uuid: '777-888-666',
          steeringDigit: '5',
          siteSteeringDigit: '6',
          siteCode: '200',
          voicemailPilotNumber: "+911234123412341234123412341234123412341234",
          timeZone: {
            id: 'America/Los_Angeles',
            label: 'America/Los_Angeles'
          },
          voicemailPilotNumberGenerated: 'true'
        },
        numberRanges: [{
          beginNumber: '5000',
          endNumber: '5999',
          uuid: '555-666-777'
        }, {
          beginNumber: '6000',
          endNumber: '6999'
        }, {
          beginNumber: '4000',
          endNumber: '4000'
        }]
      };
      voicemail = {
        name: "Simon",
        pilotNumber: "+911234123412341234123412341234123412341234",
        label: "(650) 667-9080"
      };
      spyOn(ServiceSetup, 'getSite').and.returnValue($q.when(model.site));
      spyOn(ServiceSetup, 'getVoicemailPilotNumber').and.returnValue($q.when(voicemail));
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
      spyOn(ServiceSetup, 'generateVoiceMailNumber').and.returnValue('+911234123412341234123412341234123412341234');
      controller = $controller('ServiceSetupCtrl', {
        $scope: $scope,
        $state: $state,
        ServiceSetup: ServiceSetup
      });

      controller.form = form;

      $scope.$apply();
      $httpBackend.flush();
    }));
    describe('Site Create/Update and voicemail update Tests', function () {

      it('voicemail pilot number set to generatedVoiceMailNumber', function () {
        expect(controller.model.ftswCompanyVoicemail.ftswExternalVoiceMail).toEqual(false);
        expect(controller.model.site.voicemailPilotNumber).toEqual('+911234123412341234123412341234123412341234');
      });

      it('site and voicemail is created with a voice pilot set to generated value', function () {
        controller.model.site.timeZone = {
          id: 'bogus'
        };
        controller.hasSites = false;
        controller.model.site.voicemailPilotNumber = undefined;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswExternalVoiceMail = false;
        controller.hasVoicemailService = true;
        controller.initNext();
        $scope.$apply();
        expect(ServiceSetup.createSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
      });

      it('voicemail pilot number  is updated with a DID value', function () {
        var selectedPilotNumber = {
          pattern: '+19728965000',
          label: '(972) 896-5000'
        };
        controller.model.site.timeZone = {
          id: 'bogus'
        };
        controller.hasSites = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = selectedPilotNumber;
        controller.model.ftswCompanyVoicemail.ftswExternalVoiceMail = true;
        controller.hasVoicemailService = true;
        controller.initNext();
        $scope.$apply();
        expect(ServiceSetup.updateSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
        expect(ModalService.open).not.toHaveBeenCalled();
      });
    });
  });
  describe('VoiceMail with OptionalVmDidFeatureToggle ON updating Generated VoiceMail Pilot Tests', function () {
    var controller;
    beforeEach(inject(function ($controller) {
      $scope = $rootScope;
      model = {
        site: {
          uuid: '777-888-666',
          steeringDigit: '5',
          siteSteeringDigit: '6',
          siteCode: '200',
          voicemailPilotNumber: "+6506679080",
          timeZone: {
            id: 'America/Los_Angeles',
            label: 'America/Los_Angeles'
          },
          voicemailPilotNumberGenerated: false
        },
        numberRanges: [{
          beginNumber: '5000',
          endNumber: '5999',
          uuid: '555-666-777'
        }, {
          beginNumber: '6000',
          endNumber: '6999'
        }, {
          beginNumber: '4000',
          endNumber: '4000'
        }]
      };
      voicemail = {
        name: "Simon",
        pilotNumber: "+6506679080",
        label: "(650) 667-9080"
      };
      spyOn(ServiceSetup, 'getSite').and.returnValue($q.when(model.site));
      spyOn(ServiceSetup, 'getVoicemailPilotNumber').and.returnValue($q.when(voicemail));
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
      spyOn(ServiceSetup, 'generateVoiceMailNumber').and.returnValue('+911234123412341234123412341234123412341234');
      controller = $controller('ServiceSetupCtrl', {
        $scope: $scope,
        $state: $state,
        ServiceSetup: ServiceSetup
      });

      controller.form = form;

      $scope.$apply();
      $httpBackend.flush();
    }));
    describe('Site and voicemail update with generated Voice Mail Pilot with Feature Toggle ON Tests', function () {

      it('voicemail pilot number set to generatedVoiceMailNumber', function () {
        expect(controller.model.site.voicemailPilotNumber).toEqual('+6506679080');
      });

      it('site and voicemail is updated with generated voice pilot', function () {
        controller.model.site.timeZone = {
          id: 'bogus'
        };
        controller.hasSites = true;
        controller.model.site.voicemailPilotNumber = undefined;
        controller.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
        controller.model.ftswCompanyVoicemail.ftswExternalVoiceMail = false;
        controller.hasVoicemailService = true;
        controller.initNext();
        $scope.$apply();
        expect(ServiceSetup.updateSite).toHaveBeenCalled();
        expect(ServiceSetup.updateCustomer).toHaveBeenCalled();
      });
    });
  });
});
