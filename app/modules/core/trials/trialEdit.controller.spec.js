'use strict';

describe('Controller: TrialEditCtrl:', function () {
  var controller, helpers, $scope, $state, $q, $translate, $window, $httpBackend, Notification, TrialService, TrialContextService, HuronCustomer, FeatureToggleService, Orgservice;

  beforeEach(module('core.trial'));
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));
  var stateParams = {
    currentTrial: {
      offers: [{
        id: 'COLLAB'
      }, {
        id: 'SQUAREDUC'
      }]
    }
  };
  var addContextSpy, removeContextSpy;

  beforeEach(inject(function ($rootScope, $controller, _$state_, _$q_, _$translate_, _$window_, _$httpBackend_, _Notification_, _TrialService_, _TrialContextService_, _HuronCustomer_, _FeatureToggleService_, _Orgservice_) {
    $scope = $rootScope.$new();
    $state = _$state_;
    $q = _$q_;
    $translate = _$translate_;
    $window = _$window_;
    $httpBackend = _$httpBackend_;
    Notification = _Notification_;
    TrialService = _TrialService_;
    TrialContextService = _TrialContextService_;
    HuronCustomer = _HuronCustomer_;
    FeatureToggleService = _FeatureToggleService_;
    Orgservice = _Orgservice_;

    spyOn(Notification, 'notify');
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');
    spyOn(Notification, 'errorResponse');
    $state.modal = jasmine.createSpyObj('modal', ['close']);
    spyOn($state, 'go');
    spyOn($state, 'href');
    spyOn($window, 'open');
    spyOn($scope, '$watch');
    spyOn(TrialService, 'getDeviceTrialsLimit');
    addContextSpy = spyOn(TrialContextService, 'addService').and.returnValue($q.when());
    removeContextSpy = spyOn(TrialContextService, 'removeService').and.returnValue($q.when());
    spyOn(TrialContextService, 'trialHasService').and.returnValue(false);
    spyOn(FeatureToggleService, 'supports').and.callFake(function (input) {
      if (input === 'atlasTrialsShipDevices') {
        return $q.when(false);
      } else {
        return $q.when(true);
      }
    });
    spyOn(Orgservice, 'getAdminOrg').and.returnValue($q.when({
      data: {
        success: true,
        isTestOrg: true
      }
    }));

    $httpBackend
      .when('GET', 'https://atlas-integration.wbx2.com/admin/api/v1/organizations/null?disableCache=false')
      .respond({});

    controller = $controller('TrialEditCtrl', {
      $scope: $scope,
      $translate: $translate,
      $stateParams: stateParams,
      TrialService: TrialService,
      TrialContextService: TrialContextService,
      Notification: Notification,
      HuronCustomer: HuronCustomer,
      FeatureToggleService: FeatureToggleService,
    });
    helpers = controller._helpers;
    $scope.$apply();
  }));

  describe('primary behaviors:', function () {
    describe('getDaysLeft', function () {
      it('should return expired', function () {
        expect(controller.getDaysLeft(-1)).toEqual('customerPage.expired');
      });

      it('should return expires today', function () {
        expect(controller.getDaysLeft(0)).toEqual('customerPage.expiresToday');
      });

      it('should return days left', function () {
        expect(controller.getDaysLeft(1)).toEqual(1);
      });
    });

    describe('display device page check', function () {
      it('should return cannot see devices', function () {
        expect(controller.canSeeDevicePage).toBe(false);
      });
    });

    describe('Interacting with TrialService.editTrial', function () {
      beforeEach(function () {
        spyOn(TrialService, 'editTrial').and.returnValue($q.when(getJSONFixture('core/json/trials/trialEditResponse.json')));
        controller.editTrial();
        $scope.$apply();
      });

      it('should notify success', function () {
        expect(Notification.success).toHaveBeenCalled();
      });

      it('should close the modal', function () {
        expect($state.modal.close).toHaveBeenCalled();
      });
    });

    describe('Edit a trial with error', function () {
      beforeEach(function () {
        spyOn(TrialService, 'editTrial').and.returnValue($q.reject({
          data: {
            message: 'An error occurred'
          }
        }));
        controller.editTrial();
        $scope.$apply();
      });

      it('should notify error', function () {
        expect(Notification.error).toHaveBeenCalled();
      });

      it('should not close the modal', function () {
        expect($state.modal.close).not.toHaveBeenCalled();
      });
    });

    describe('launchCustomerPortal()', function () {
      var origCurrentTrial;

      beforeEach(function () {
        origCurrentTrial = controller.currentTrial;
        controller.currentTrial = {
          customerOrgId: 'fake-customer-org-id',
          customerName: 'fake-customer-name'
        };
        controller.launchCustomerPortal();
      });

      afterEach(function () {
        controller.currentTrial = origCurrentTrial;
      });

      describe('if $scope.trial is defined...', function () {
        it('should call $window.open()', function () {
          expect($window.open).toHaveBeenCalled();
        });

        it('should call $state.href() with vm.currentTrial.customer* properties', function () {
          expect($state.href).toHaveBeenCalledWith('login_swap', {
            customerOrgId: 'fake-customer-org-id',
            customerOrgName: 'fake-customer-name'
          });
        });
      });
    });
  });

  describe('helper functions:', function () {
    describe('hasEnabled', function () {
      it('should only return true if first arg is true and second arg is false', function () {
        var hasEnabled = helpers.hasEnabled;
        expect(hasEnabled(true, false)).toBe(true);
        expect(hasEnabled(true, true)).toBe(false);
        expect(hasEnabled(false, true)).toBe(false);
        expect(hasEnabled(false, false)).toBe(false);
      });
    });

    describe('hasEnabledMessageTrial', function () {
      it('should expect an object with a boolean property named "enabled" as its first arg, and an object with a boolean property named "message" as its second arg', function () {
        var hasEnabledMessageTrial = helpers.hasEnabledMessageTrial;
        expect(hasEnabledMessageTrial({
          enabled: true
        }, {
          message: false
        })).toBe(true);

        expect(hasEnabledMessageTrial({
          enabled: true
        }, {
          message: true
        })).toBe(false);

        expect(hasEnabledMessageTrial({
          enabled: false
        }, {
          message: false
        })).toBe(false);

        expect(hasEnabledMessageTrial({
          enabled: false
        }, {
          message: true
        })).toBe(false);
      });
    });

    describe('hasEnabledMeetingTrial', function () {
      it('should expect an object with a boolean property named "enabled" as its first arg, and an object with a boolean property named "meeting" as its second arg', function () {
        var hasEnabledMeetingTrial = helpers.hasEnabledMeetingTrial;
        expect(hasEnabledMeetingTrial({
          enabled: true
        }, {
          meeting: false
        })).toBe(true);

        expect(hasEnabledMeetingTrial({
          enabled: true
        }, {
          meeting: true
        })).toBe(false);

        expect(hasEnabledMeetingTrial({
          enabled: false
        }, {
          meeting: false
        })).toBe(false);

        expect(hasEnabledMeetingTrial({
          enabled: false
        }, {
          meeting: true
        })).toBe(false);
      });
    });

    describe('hasEnabledCallTrial', function () {
      it('should expect an object with a boolean property named "enabled" as its first arg, and an object with a boolean property named "call" as its second arg', function () {
        var hasEnabledCallTrial = helpers.hasEnabledCallTrial;
        expect(hasEnabledCallTrial({
          enabled: true
        }, {
          call: false
        })).toBe(true);

        expect(hasEnabledCallTrial({
          enabled: true
        }, {
          call: true
        })).toBe(false);

        expect(hasEnabledCallTrial({
          enabled: false
        }, {
          call: false
        })).toBe(false);

        expect(hasEnabledCallTrial({
          enabled: false
        }, {
          call: true
        })).toBe(false);
      });
    });

    describe('hasEnabledRoomSystemTrial', function () {
      it('should expect an object with a boolean property named "enabled" as its first arg, and an object with a boolean property named "roomSystems" as its second arg', function () {
        var hasEnabledRoomSystemTrial = helpers.hasEnabledRoomSystemTrial;
        expect(hasEnabledRoomSystemTrial({
          enabled: true
        }, {
          roomSystems: false
        })).toBe(true);

        expect(hasEnabledRoomSystemTrial({
          enabled: true
        }, {
          roomSystems: true
        })).toBe(false);

        expect(hasEnabledRoomSystemTrial({
          enabled: false
        }, {
          roomSystems: false
        })).toBe(false);

        expect(hasEnabledRoomSystemTrial({
          enabled: false
        }, {
          roomSystems: true
        })).toBe(false);
      });
    });

    describe('hasEnabledCareTrial', function () {
      it('should expect an object with a boolean property named "enabled" as its first arg,' +
        'and an object with a boolean property named "care" as its second arg',
        function () {
          var hasEnabledCareTrial = helpers.hasEnabledCareTrial;
          expect(hasEnabledCareTrial({
            enabled: true
          }, {
            care: false
          })).toBe(true);

          expect(hasEnabledCareTrial({
            enabled: true
          }, {
            care: true
          })).toBe(false);

          expect(hasEnabledCareTrial({
            enabled: false
          }, {
            care: false
          })).toBe(false);

          expect(hasEnabledCareTrial({
            enabled: false
          }, {
            care: true
          })).toBe(false);
        });
    });

    describe('hasEnabledAnyTrial', function () {
      describe('expects two args: an object with properties of "messageTrial", "meetingTrial", ' +
        '"callTrial", "roomSystemTrial", "careTrial" as its first, and an object with properties' +
        'of "message", "meeting", "call", "roomSystems" and "care" as its second',
        function () {
          var _vm, _preset;

          beforeEach(function () {
            _vm = {
              messageTrial: {
                enabled: false
              },
              meetingTrial: {
                enabled: false
              },
              callTrial: {
                enabled: false
              },
              roomSystemTrial: {
                enabled: false
              },
              careTrial: {
                enabled: false
              }
            };
            _preset = {
              message: false,
              meeting: false,
              call: false,
              roomSystems: false,
              care: false
            };
          });

          it('should return true if the "messageTrial.enabled" sub-property on the first arg is true, ' +
            'and the "message" property on the second arg is false',
            function () {
              var hasEnabledAnyTrial = helpers.hasEnabledAnyTrial;
              _vm.messageTrial.enabled = true;
              _preset.message = false;
              expect(hasEnabledAnyTrial(_vm, _preset)).toBe(true);
            });

          it('should return true if the "meetingTrial.enabled" sub-property on the first arg is true, ' +
            'and the "meeting" property on the second arg is false',
            function () {
              var hasEnabledAnyTrial = helpers.hasEnabledAnyTrial;
              _vm.meetingTrial.enabled = true;
              _preset.meeting = false;
              expect(hasEnabledAnyTrial(_vm, _preset)).toBe(true);
            });

          it('should return true if the "callTrial.enabled" sub-property on the first arg is true, ' +
            'and the "call" property on the second arg is false',
            function () {
              var hasEnabledAnyTrial = helpers.hasEnabledAnyTrial;
              _vm.callTrial.enabled = true;
              _preset.call = false;
              expect(hasEnabledAnyTrial(_vm, _preset)).toBe(true);
            });

          it('should return true if the "roomSystemTrial.enabled" sub-property on the first arg is true, ' +
            'and the "roomSystems" property on the second arg is false',
            function () {
              var hasEnabledAnyTrial = helpers.hasEnabledAnyTrial;
              _vm.roomSystemTrial.enabled = true;
              _preset.roomSystems = false;
              expect(hasEnabledAnyTrial(_vm, _preset)).toBe(true);
            });

          it('should return true if the "careTrial.enabled" sub-property on the first arg is true, ' +
            'and the "care" property on the second arg is false',
            function () {
              var hasEnabledAnyTrial = helpers.hasEnabledAnyTrial;
              _vm.careTrial.enabled = true;
              _preset.care = false;
              expect(hasEnabledAnyTrial(_vm, _preset)).toBe(true);
            });
        });
    });

    describe('helper functions for Care:', function () {
      var CARE_LICENSE_COUNT_DEFAULT = 15;
      var CARE_LICENSE_COUNT = CARE_LICENSE_COUNT_DEFAULT * 2;

      describe('messageOfferDisabledExpression:', function () {
        it('should be disabled if message is disabled.', function () {
          controller.careTrial.enabled = true;
          controller.messageTrial.enabled = false;
          expect(helpers.messageOfferDisabledExpression()).toBeTruthy();
          expect(controller.careTrial.enabled).toBeFalsy();

          controller.messageTrial.enabled = true;
          expect(helpers.messageOfferDisabledExpression()).toBeFalsy();
          //Care is a choice to enable/disable when Message is enabled.
          expect(controller.careTrial.enabled).toBeFalsy();
        });
      });

      describe('careLicenseInputDisabledExpression:', function () {
        it('care license count disabled expression returns false in happy scenario.', function () {
          controller.careTrial.enabled = true;
          controller.careTrial.details.quantity = CARE_LICENSE_COUNT;
          expect(helpers.careLicenseInputDisabledExpression()).toBeFalsy();
          expect(controller.careTrial.details.quantity).toEqual(CARE_LICENSE_COUNT);
        });

        it('care license count resets to 0 when disabled.', function () {
          controller.careTrial.details.quantity = CARE_LICENSE_COUNT;
          controller.careTrial.enabled = false;
          expect(helpers.careLicenseInputDisabledExpression()).toBeTruthy();
          expect(controller.careTrial.details.quantity).toEqual(0);
        });

        it('care license count shows default value when enabled.', function () {
          controller.careTrial.details.quantity = 0;
          controller.careTrial.enabled = true;
          expect(helpers.careLicenseInputDisabledExpression()).toBeFalsy();
          expect(controller.careTrial.details.quantity).toEqual(CARE_LICENSE_COUNT_DEFAULT);
        });
      });

      describe('validateCareLicense:', function () {
        it('care license validation succeeds when care is not selected.', function () {
          controller.careTrial.enabled = false;
          expect(helpers.validateCareLicense()).toBeTruthy();
        });

        it('care license validation allows value between 0 and 50.', function () {
          controller.details.licenseCount = 100;
          controller.careTrial.enabled = true;

          expect(helpers.validateCareLicense(-1, -1)).toBeFalsy();
          expect(helpers.validateCareLicense(1, 1)).toBeTruthy();
          expect(helpers.validateCareLicense(50, 50)).toBeTruthy();
          expect(helpers.validateCareLicense(51, 51)).toBeFalsy();
        });

        it('care license validation disallows value greater than details.licenseCount', function () {
          controller.details.licenseCount = CARE_LICENSE_COUNT - 1;
          controller.careTrial.enabled = true;
          expect(helpers.validateCareLicense(CARE_LICENSE_COUNT, CARE_LICENSE_COUNT)).toBeFalsy();
        });
      });

      describe('careLicenseCountLessThanTotalCount:', function () {
        it('total license count cannot be lesser than Care license count.', function () {
          controller.details.licenseCount = 10;
          controller.careTrial.enabled = true;
          controller.careTrial.details.quantity = 20;
          expect(helpers.careLicenseCountLessThanTotalCount()).toBeFalsy();
        });

        it('total license validation with Care succeeds when careTrial is not enabled.', function () {
          controller.details.licenseCount = 10;
          controller.careTrial.enabled = false;
          controller.careTrial.details.quantity = 20;
          expect(helpers.careLicenseCountLessThanTotalCount()).toBeTruthy();
        });
      });
    });
  });

  describe('with context service', function () {
    beforeEach(function () {
      spyOn(TrialService, 'editTrial').and.returnValue($q.when(getJSONFixture('core/json/trials/trialEditResponse.json')));
    });

    describe('enabled', function () {
      beforeEach(function () {
        controller.preset.context = true;
      });

      it('should edit trial with no change to context service', function () {
        controller.contextTrial.enabled = true;
        controller.editTrial();
        $scope.$apply();
        expect(TrialContextService.addService).not.toHaveBeenCalled();
        expect(TrialContextService.removeService).not.toHaveBeenCalled();
      });

      it('should disable context service', function () {
        controller.contextTrial.enabled = false;
        controller.editTrial();
        $scope.$apply();
        expect(TrialContextService.addService).not.toHaveBeenCalled();
        expect(TrialContextService.removeService).toHaveBeenCalled();
      });

      it('should display notification if call to disable context service fails', function () {
        removeContextSpy.and.returnValue($q.reject('rejected'));
        controller.contextTrial.enabled = false;
        controller.editTrial();
        $scope.$apply();
        expect(TrialContextService.addService).not.toHaveBeenCalled();
        expect(TrialContextService.removeService).toHaveBeenCalled();
        expect(Notification.errorResponse).toHaveBeenCalledWith('rejected', 'trialModal.editTrialContextServiceDisableError');
      });
    });

    describe('disabled', function () {
      beforeEach(function () {
        controller.preset.context = false;
      });

      it('should enable context service', function () {
        controller.contextTrial.enabled = true;
        controller.editTrial();
        $scope.$apply();
        expect(TrialContextService.addService).toHaveBeenCalled();
        expect(TrialContextService.removeService).not.toHaveBeenCalled();
      });

      it('should display notification if call to enable context service fails', function () {
        addContextSpy.and.returnValue($q.reject('rejected'));
        controller.contextTrial.enabled = true;
        controller.editTrial();
        $scope.$apply();
        expect(TrialContextService.addService).toHaveBeenCalled();
        expect(TrialContextService.removeService).not.toHaveBeenCalled();
        expect(Notification.errorResponse).toHaveBeenCalledWith('rejected', 'trialModal.editTrialContextServiceEnableError');
      });
    });
  });
});
