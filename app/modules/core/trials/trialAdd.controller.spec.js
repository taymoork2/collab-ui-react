'use strict';

describe('Controller: TrialAddCtrl', function () {
  var controller, $scope, $q, $translate, $state, Notification, TrialService, HuronCustomer, EmailService, FeatureToggleService;

  beforeEach(module('core.trial'));
  beforeEach(module('Huron'));
  beforeEach(module('Core'));

  beforeEach(inject(function ($rootScope, $controller, _$q_, _$translate_, _$state_, _Notification_, _TrialService_, _HuronCustomer_, _EmailService_, _FeatureToggleService_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    $translate = _$translate_;
    $state = _$state_;
    Notification = _Notification_;
    TrialService = _TrialService_;
    HuronCustomer = _HuronCustomer_;
    EmailService = _EmailService_;
    FeatureToggleService = _FeatureToggleService_;

    spyOn(Notification, 'notify');
    spyOn(Notification, 'errorResponse');
    $state.modal = jasmine.createSpyObj('modal', ['close']);
    spyOn($state, 'go');
    spyOn(EmailService, 'emailNotifyTrialCustomer').and.returnValue($q.when());
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
    spyOn(FeatureToggleService, 'supportsPstnSetup').and.returnValue($q.when(true));

    controller = $controller('TrialAddCtrl', {
      $scope: $scope,
      $translate: $translate,
      $state: $state,
      TrialService: TrialService,
      HuronCustomer: HuronCustomer,
      Notification: Notification,
      EmailService: EmailService,
      FeatureToggleService: FeatureToggleService,
    });
    $scope.$apply();
  }));

  it('should be created successfully', function () {
    expect(controller).toBeDefined();
  });

  it('should have default offers', function () {
    expect(controller.messageTrial.enabled).toBeTruthy();
    expect(controller.meetingTrial.enabled).toBeTruthy();
    expect(controller.roomSystemTrial.enabled).toBeTruthy();
    expect(controller.callTrial.enabled).toBeFalsy();
  });

  it('should start in trialAdd.info state', function () {
    expect(controller.navStates).toEqual(['trialAdd.info']);
  });

  it('should have correct navigation state order', function () {
    expect(controller.navOrder).toEqual(['trialAdd.info', 'trialAdd.meeting', 'trialAdd.call', 'trialAdd.addNumbers']);
  });

  it('should transition state', function () {
    expect(controller.hasNextStep()).toBeTruthy();
    controller.nextStep();
    expect($state.go).toHaveBeenCalledWith('trialAdd.info');
  });

  it('should default room system quantity to 0', function () {
    expect(controller.roomSystemFields[1].model.quantity).toBe(0);
  });

  it('should close the modal', function () {
    controller.closeDialogBox();
    expect($state.modal.close).toHaveBeenCalled();
  });

  describe('Start a new trial', function () {
    var callback;
    beforeEach(function () {
      callback = jasmine.createSpy('addNumbersCallback').and.returnValue($q.when());
      spyOn(TrialService, 'startTrial').and.returnValue($q.when(getJSONFixture('core/json/trials/trialAddResponse.json')));
    });

    describe('basic behavior', function () {
      beforeEach(function () {
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
        controller.meetingTrial.enabled = true;
        controller.startTrial(callback);
        $scope.$apply();
      });

      it('should not send an email', function () {
        expect(EmailService.emailNotifyTrialCustomer).not.toHaveBeenCalled();
      });
    });

    describe('with atlas-webex-trial feature-toggle disabled', function () {
      beforeEach(function () {
        controller.meetingTrial.enabled = false;
        controller.startTrial(callback);
        $scope.$apply();
      });

      it('should send an email', function () {
        expect(EmailService.emailNotifyTrialCustomer).toHaveBeenCalled();
      });
    });

    describe('with addNumbers callback', function () {
      beforeEach(function () {
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
        controller.callTrial.enabled = true;
      });

      it('should have Squared UC offer', function () {
        expect(controller.callTrial.enabled).toBeTruthy();
      });

      it('should notify success', function () {
        spyOn(HuronCustomer, 'create').and.returnValue($q.when());
        controller.startTrial();
        $scope.$apply();
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
});
