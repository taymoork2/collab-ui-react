'use strict';

describe('Controller: TrialEditCtrl:', function () {
  var controller, $scope, $state, $q, $translate, $window, $httpBackend, Notification, TrialService, HuronCustomer, FeatureToggleService, Orgservice;

  beforeEach(module('core.trial'));
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  var stateParams = {
    currentTrial: {
      offers: [{
        id: 'COLLAB'
      }, {
        id: 'SQUAREDUC'
      }]
    }
  };

  beforeEach(inject(function ($rootScope, $controller, _$state_, _$q_, _$translate_, _$window_, _$httpBackend_, _Notification_, _TrialService_, _HuronCustomer_, _FeatureToggleService_, _Orgservice_) {
    $scope = $rootScope.$new();
    $state = _$state_;
    $q = _$q_;
    $translate = _$translate_;
    $window = _$window_;
    $httpBackend = _$httpBackend_;
    Notification = _Notification_;
    TrialService = _TrialService_;
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
    spyOn(TrialService, 'getDeviceTrialsLimit');
    spyOn(FeatureToggleService, 'supports').and.callFake(function (input) {
      if (input === 'atlasTrialsShipDevices') {
        return $q.when(false);
      } else {
        return $q.when(true);
      }
    });

    $httpBackend
      .when('GET', 'https://atlas-integration.wbx2.com/admin/api/v1/organizations/null?disableCache=false')
      .respond({});

    controller = $controller('TrialEditCtrl', {
      $scope: $scope,
      $translate: $translate,
      $stateParams: stateParams,
      TrialService: TrialService,
      Notification: Notification,
      HuronCustomer: HuronCustomer,
      FeatureToggleService: FeatureToggleService,
    });
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

    describe('Interacting with TrialService.editTrial', function () {
      beforeEach(function () {
        spyOn(TrialService, "editTrial").and.returnValue($q.when(getJSONFixture('core/json/trials/trialEditResponse.json')));
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
        spyOn(TrialService, "editTrial").and.returnValue($q.reject({
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
        var hasEnabled = controller._helpers.hasEnabled;
        expect(hasEnabled(true, false)).toBe(true);
        expect(hasEnabled(true, true)).toBe(false);
        expect(hasEnabled(false, true)).toBe(false);
        expect(hasEnabled(false, false)).toBe(false);
      });
    });

    describe('hasEnabledMessageTrial', function () {
      it('should expect an object with a boolean property named "enabled" as its first arg, and an object with a boolean property named "message" as its second arg', function () {
        var hasEnabledMessageTrial = controller._helpers.hasEnabledMessageTrial;
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
        var hasEnabledMeetingTrial = controller._helpers.hasEnabledMeetingTrial;
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
        var hasEnabledCallTrial = controller._helpers.hasEnabledCallTrial;
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
        var hasEnabledRoomSystemTrial = controller._helpers.hasEnabledRoomSystemTrial;
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

    describe('hasEnabledAnyTrial', function () {
      describe('expects two args: an object with properties of "messageTrial", "meetingTrial", ' +
        '"callTrial", "roomSystemTrial" as its first, and an object with properties of "message", ' +
        '"meeting", "call", and "roomSystems" as its second',
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
            };
            _preset = {
              message: false,
              meeting: false,
              call: false,
              roomSystems: false,
            };
          });

          it('should return true if the "messageTrial.enabled" sub-property on the first arg is true, ' +
            'and the "message" property on the second arg is false',
            function () {
              var hasEnabledAnyTrial = controller._helpers.hasEnabledAnyTrial;
              _vm.messageTrial.enabled = true;
              _preset.message = false;
              expect(hasEnabledAnyTrial(_vm, _preset)).toBe(true);
            });

          it('should return true if the "meetingTrial.enabled" sub-property on the first arg is true, ' +
            'and the "meeting" property on the second arg is false',
            function () {
              var hasEnabledAnyTrial = controller._helpers.hasEnabledAnyTrial;
              _vm.meetingTrial.enabled = true;
              _preset.meeting = false;
              expect(hasEnabledAnyTrial(_vm, _preset)).toBe(true);
            });

          it('should return true if the "callTrial.enabled" sub-property on the first arg is true, ' +
            'and the "call" property on the second arg is false',
            function () {
              var hasEnabledAnyTrial = controller._helpers.hasEnabledAnyTrial;
              _vm.callTrial.enabled = true;
              _preset.call = false;
              expect(hasEnabledAnyTrial(_vm, _preset)).toBe(true);
            });

          it('should return true if the "roomSystemTrial.enabled" sub-property on the first arg is true, ' +
            'and the "roomSystems" property on the second arg is false',
            function () {
              var hasEnabledAnyTrial = controller._helpers.hasEnabledAnyTrial;
              _vm.roomSystemTrial.enabled = true;
              _preset.roomSystems = false;
              expect(hasEnabledAnyTrial(_vm, _preset)).toBe(true);
            });
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
        expect(controller.canSeeDevicePage).toBeFalsy();
      });
    });
  });
});
