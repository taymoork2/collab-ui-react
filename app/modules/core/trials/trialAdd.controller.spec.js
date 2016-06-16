'use strict';

describe('Controller: TrialAddCtrl', function () {
  var controller, $scope, $q, $translate, $state, $httpBackend, Notification, TrialService, TrialContextService, HuronCustomer, EmailService, FeatureToggleService, TrialPstnService, Orgservice;
  var addContextSpy;
  beforeEach(module('core.trial'));
  beforeEach(module('Huron'));
  beforeEach(module('Core'));

  beforeEach(inject(function ($rootScope, $controller, _$q_, _$translate_, _$state_, _$httpBackend_, _Notification_, _TrialService_, _TrialContextService_, _HuronCustomer_, _EmailService_, _FeatureToggleService_, _TrialPstnService_, _Orgservice_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    $translate = _$translate_;
    $state = _$state_;
    $httpBackend = _$httpBackend_;
    Notification = _Notification_;
    TrialService = _TrialService_;
    TrialContextService = _TrialContextService_;
    HuronCustomer = _HuronCustomer_;
    EmailService = _EmailService_;
    FeatureToggleService = _FeatureToggleService_;
    TrialPstnService = _TrialPstnService_;
    Orgservice = _Orgservice_;

    spyOn(Notification, 'notify');
    spyOn(Notification, 'errorResponse');
    $state.modal = jasmine.createSpyObj('modal', ['close']);
    spyOn($state, 'go');
    spyOn(EmailService, 'emailNotifyTrialCustomer').and.returnValue($q.when());
    spyOn(TrialService, 'getDeviceTrialsLimit');
    addContextSpy = spyOn(TrialContextService, 'addService').and.returnValue($q.when());
    spyOn(FeatureToggleService, 'supports').and.callFake(function (input) {
      if (input === 'atlasTrialsShipDevices') {
        return ($q.when(false));
      } else {
        return ($q.when(true));
      }
    });

    $httpBackend
      .when('GET', 'https://atlas-integration.wbx2.com/admin/api/v1/organizations/null?disableCache=false')
      .respond({});

    controller = $controller('TrialAddCtrl', {
      $scope: $scope,
      $translate: $translate,
      $state: $state,
      TrialService: TrialService,
      TrialContextService: TrialContextService,
      HuronCustomer: HuronCustomer,
      Notification: Notification,
      EmailService: EmailService,
      FeatureToggleService: FeatureToggleService,
      Orgservice: Orgservice
    });
    $scope.$apply();
  }));

  it('should be created successfully', function () {
    expect(controller).toBeDefined();
  });

  it('should have default offers', function () {
    expect(controller.messageTrial.enabled).toBeTruthy();
    expect(controller.meetingTrial.enabled).toBeTruthy();
    expect(controller.webexTrial.enabled).toBeTruthy();
    expect(controller.roomSystemTrial.enabled).toBeTruthy();
    expect(controller.callTrial.enabled).toBeTruthy();
    expect(controller.pstnTrial.enabled).toBeTruthy();
    expect(controller.contextTrial.enabled).toBeFalsy();
  });

  it('should start in trialAdd.info state', function () {
    expect(controller.navStates).toEqual(['trialAdd.info']);
  });

  it('should have correct navigation state order', function () {
    expect(controller.navOrder).toEqual(['trialAdd.info', 'trialAdd.webex', 'trialAdd.pstn', 'trialAdd.emergAddress', 'trialAdd.call']);
  });

  it('should transition state', function () {
    expect(controller.hasNextStep()).toBeTruthy();
    controller.nextStep();
    expect($state.go).toHaveBeenCalledWith('trialAdd.info');
  });

  it('should close the modal', function () {
    controller.closeDialogBox();
    expect($state.modal.close).toHaveBeenCalled();
  });

  it('should test that if the current and next state are removed, then it can still find the next value', function () {
    controller.navOrder = [1, 2, 3, 4, 5, 6];
    controller.navStates = [1, 4];
    $state.current.name = 2;
    expect(controller.getNextState()).toEqual(4);
  });

  it('should set call trial to false and disable pstn trial', function () {
    controller.pstnTrial.enabled = true;
    controller.callTrial.enabled = false;
    $scope.$apply();
    expect(controller.pstnTrial.enabled).toBeFalsy();
  });

  it('should have call trial and not skip pstn after watch', function () {
    controller.hasCallEntitlement = true;
    controller.pstnTrial.enabled = false;
    controller.callTrial.enabled = true;
    controller.pstnTrial.skipped = false;
    $scope.$apply();
    expect(controller.pstnTrial.enabled).toBeTruthy();
  });

  it('should have call trial and skip pstn after watch', function () {
    controller.hasCallEntitlement = true;
    controller.pstnTrial.enabled = false;
    controller.callTrial.enabled = true;
    controller.pstnTrial.skipped = true;
    $scope.$apply();
    expect(controller.pstnTrial.enabled).toBeFalsy();
  });

  describe('Start a new trial', function () {
    var callback;
    beforeEach(function () {
      callback = jasmine.createSpy('addNumbersCallback').and.returnValue($q.when());
      spyOn(TrialService, 'startTrial').and.returnValue($q.when(getJSONFixture('core/json/trials/trialAddResponse.json')));
    });

    describe('basic behavior', function () {
      beforeEach(function () {
        controller.callTrial.enabled = false;
        controller.pstnTrial.enabled = false;
        controller.startTrial();
        $scope.$apply();
      });

      it('should notify success', function () {
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      });

      it('should have a customer org id set', function () {
        expect(controller.customerOrgId).toBeDefined();
      });
    });

    describe('with atlas-webex-trial feature-toggle enabled', function () {
      beforeEach(function () {
        controller.callTrial.enabled = false;
        controller.pstnTrial.enabled = false;
        controller.webexTrial.enabled = true;
        controller.startTrial(callback);
        $scope.$apply();
      });

      it('should not send an email', function () {
        expect(EmailService.emailNotifyTrialCustomer).not.toHaveBeenCalled();
      });
    });

    describe('with atlas-webex-trial feature-toggle disabled', function () {
      beforeEach(function () {
        controller.callTrial.enabled = false;
        controller.pstnTrial.enabled = false;
        controller.webexTrial.enabled = false;
        controller.startTrial(callback);
        $scope.$apply();
      });

      it('should send an email', function () {
        expect(EmailService.emailNotifyTrialCustomer).toHaveBeenCalled();
      });
    });

    describe('with addNumbers callback', function () {
      beforeEach(function () {
        controller.callTrial.enabled = false;
        controller.pstnTrial.enabled = false;
        controller.startTrial(callback);
        $scope.$apply();
      });

      it('should call with customerOrgId', function () {
        expect(callback).toHaveBeenCalledWith('123');
      });

      it('should go to finish page', function () {
        expect($state.go).toHaveBeenCalledWith('trialAdd.finishSetup');
      });
    });

    describe('without addNumbers callback', function () {
      beforeEach(function () {
        controller.callTrial.enabled = false;
        controller.pstnTrial.enabled = false;
        controller.startTrial();
        $scope.$apply();
      });

      it('should not call callback', function () {
        expect(callback).not.toHaveBeenCalled();
      });

      it('should go to finish page', function () {
        expect($state.go).toHaveBeenCalledWith('trialAdd.finishSetup');
      });
    });

    describe('With Squared UC', function () {
      beforeEach(function () {
        controller.pstnTrial.enabled = false;
      });

      it('should have Squared UC offer', function () {
        expect(controller.callTrial.enabled).toBeTruthy();
        expect(controller.pstnTrial.enabled).toBeFalsy();
      });

      it('should notify success', function () {
        spyOn(HuronCustomer, 'create').and.returnValue($q.when());
        controller.startTrial();
        $scope.$apply();
        expect(HuronCustomer.create).toHaveBeenCalled();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
        expect(Notification.notify.calls.count()).toEqual(1);
      });

      it('error should notify error', function () {
        spyOn(HuronCustomer, 'create').and.returnValue($q.reject());
        controller.startTrial();
        $scope.$apply();
        expect(Notification.errorResponse).toHaveBeenCalled();
        expect(Notification.errorResponse.calls.count()).toEqual(1);
      });
    });

    describe('With Squared UC and PSTN', function () {
      it('should have Squared UC offer', function () {
        expect(controller.callTrial.enabled).toBeTruthy();
        expect(controller.pstnTrial.enabled).toBeTruthy();
      });

      it('should notify success', function () {
        spyOn(HuronCustomer, 'create').and.returnValue($q.when());
        spyOn(TrialPstnService, 'createPstnEntity').and.returnValue($q.when());
        controller.startTrial();
        $scope.$apply();
        expect(HuronCustomer.create).toHaveBeenCalled();
        expect(TrialPstnService.createPstnEntity).toHaveBeenCalled();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
        expect(Notification.notify.calls.count()).toEqual(1);
      });

      it('error should notify error', function () {
        spyOn(HuronCustomer, 'create').and.returnValue($q.reject());
        controller.startTrial();
        $scope.$apply();
        expect(Notification.errorResponse).toHaveBeenCalled();
        expect(Notification.errorResponse.calls.count()).toEqual(1);
      });
    });

    describe('with context service checked', function () {

      it('should enable context service', function () {
        controller.contextTrial.enabled = true;
        controller.callTrial.enabled = false;
        controller.startTrial();
        $scope.$apply();
        expect(TrialContextService.addService).toHaveBeenCalled();
        expect(Notification.errorResponse).not.toHaveBeenCalled();
      });

      it('should display error notification if call to enable context service fails', function () {
        addContextSpy.and.returnValue($q.reject('rejected'));
        controller.contextTrial.enabled = true;
        controller.callTrial.enabled = false;
        controller.startTrial();
        $scope.$apply();
        expect(TrialContextService.addService).toHaveBeenCalled();
        expect(Notification.errorResponse).toHaveBeenCalledWith('rejected', 'trialModal.startTrialContextServiceError');
      });

      it('should not be able to proceed if no other trial services are checked', function () {
        // uncheck all services except for Context Service
        Object.keys(controller.trialData.trials).forEach(function (service) {
          controller.trialData.trials[service].enabled = service === 'contextTrial';
        });
        expect(controller.hasTrial()).toBeFalsy();
      });
    });

    describe('without context service checked', function () {
      beforeEach(function () {
        controller.contextTrial.enabled = false;
        controller.callTrial.enabled = false;
        controller.startTrial();
        $scope.$apply();
      });

      it('should not enable context service', function () {
        expect(TrialContextService.addService).not.toHaveBeenCalled();
      });

      it('should be able to proceed with trial services enabled', function () {
        // uncheck Context Service and all other services except for Message
        Object.keys(controller.trialData.trials).forEach(function (service) {
          controller.trialData.trials[service].enabled = service === 'messageTrial';
        });
        expect(controller.hasTrial()).toBeTruthy();
      });
    });
  });

  describe('Start a new trial with error', function () {
    var startTrialSpy;
    beforeEach(function () {
      startTrialSpy = spyOn(TrialService, "startTrial").and.returnValue($q.reject({
        data: {
          message: 'An error occurred'
        }
      }));
      controller.startTrial();
      $scope.$apply();
    });

    it('should notify error', function () {
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('should not have closed the modal', function () {
      expect($state.modal.close).not.toHaveBeenCalled();
    });

    it('should show a name error', function () {
      startTrialSpy.and.returnValue($q.reject({
        data: {
          message: 'Org'
        }
      }));
      controller.startTrial();
      $scope.$apply();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('should show an email error', function () {
      startTrialSpy.and.returnValue($q.reject({
        data: {
          message: 'Admin User'
        }
      }));
      controller.startTrial();
      $scope.$apply();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });
  });

  describe('Set ship devices modal display with Orgservice call', function () {
    it('should disable ship devices modal for test org', function () {
      spyOn(Orgservice, 'getAdminOrg').and.returnValue($q.when({
        data: {
          success: true,
          isTestOrg: true
        }
      }));
      controller.setDeviceModal();
      $scope.$apply();
      expect(controller.devicesModal.enabled).toBeFalsy();
    });
  });

  describe('Care offer trial', function () {
    var CARE_LICENSE_COUNT_DEFAULT = 15;
    var CARE_LICENSE_COUNT = CARE_LICENSE_COUNT_DEFAULT * 2;

    it('should be disabled if message is disabled.', function () {
      expect(controller.messageTrial.enabled).toBeTruthy();
      expect(controller.careTrial.enabled).toBeTruthy();

      controller.messageTrial.enabled = false;
      expect(controller.messageOfferDisabledExpression()).toBeTruthy();
      expect(controller.careTrial.enabled).toBeFalsy();

      controller.messageTrial.enabled = true;
      expect(controller.messageOfferDisabledExpression()).toBeFalsy();
      //Care is a choice to enable/disable when Message is enabled.
      expect(controller.careTrial.enabled).toBeFalsy();
    });

    it('care license count disabled expression works correctly.', function () {
      controller.careTrial.enabled = true;
      controller.careTrial.details.quantity = CARE_LICENSE_COUNT;
      expect(controller.careLicenseInputDisabledExpression()).toBeFalsy();
      expect(controller.careTrial.details.quantity).toEqual(CARE_LICENSE_COUNT);
    });

    it('care license count resets to 0 when disabled.', function () {
      controller.careTrial.details.quantity = CARE_LICENSE_COUNT;
      controller.careTrial.enabled = false;
      expect(controller.careLicenseInputDisabledExpression()).toBeTruthy();
      expect(controller.careTrial.details.quantity).toEqual(0);
    });

    it('care license count shows default value when enabled.', function () {
      controller.careTrial.details.quantity = 0;
      controller.careTrial.enabled = true;
      expect(controller.careLicenseInputDisabledExpression()).toBeFalsy();
      expect(controller.careTrial.details.quantity).toEqual(CARE_LICENSE_COUNT_DEFAULT);
    });

    it('care license validation is not used when care is not selected.', function () {
      controller.careTrial.enabled = false;
      expect(controller.validateCareLicense()).toBeTruthy();
    });

    it('care license validation allows value between 1 and 50.', function () {
      controller.details.licenseCount = 100;
      controller.careTrial.enabled = true;
      expect(controller.validateCareLicense(CARE_LICENSE_COUNT, CARE_LICENSE_COUNT)).toBeTruthy();
    });

    it('care license validation disallows value greater than total users.', function () {
      controller.details.licenseCount = 10;
      controller.careTrial.enabled = true;
      expect(controller.validateCareLicense(CARE_LICENSE_COUNT + 1, CARE_LICENSE_COUNT + 1)).toBeFalsy();
    });
  });
});
