'use strict';

describe('Controller: TrialCtrl:', function () {
  var controller, helpers, $controller, $scope, $state, $q, $translate, $window, $httpBackend, Authinfo, Analytics, Config, Notification, TrialService, TrialContextService, TrialPstnService, HuronCustomer, FeatureToggleService, Orgservice;

  var stateParams = {};
  var addContextSpy, removeContextSpy, addWatchSpy;
  var trialEditResponse = getJSONFixture('core/json/trials/trialEditResponse.json');
  var purchasedCustomerData = getJSONFixture('core/json/customers/customerWithLicensesNoTrial.json');
  var purchasedWithTrialCustomerData = getJSONFixture('core/json/customers/customerWithLicensesAndTrial.json');
  var enabledFeatureToggles = [];

  var orgAlreadyRegistered = 'ORGANIZATION_REGISTERED_USING_API';

  afterEach(function () {
    controller = helpers = $controller = $scope = $state = $q = $translate = $window = $httpBackend = Analytics = Authinfo = Config = Notification = TrialService = TrialContextService = HuronCustomer = FeatureToggleService = Orgservice = undefined;
  });

  afterAll(function () {
    addContextSpy = removeContextSpy = undefined;
  });

  beforeEach(angular.mock.module('core.trial'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));


  beforeEach(inject(function ($rootScope, _$controller_, _$state_, _$q_, _$translate_, _$window_, _$httpBackend_, _Analytics_, _Authinfo_, _Config_, _Notification_, _TrialService_, _TrialContextService_, _TrialPstnService_, _HuronCustomer_, _FeatureToggleService_, _Orgservice_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $state = _$state_;
    $q = _$q_;
    $translate = _$translate_;
    $window = _$window_;
    $httpBackend = _$httpBackend_;
    Analytics = _Analytics_;
    Authinfo = _Authinfo_;
    Notification = _Notification_;
    TrialService = _TrialService_;
    TrialContextService = _TrialContextService_;
    HuronCustomer = _HuronCustomer_;
    FeatureToggleService = _FeatureToggleService_;
    Orgservice = _Orgservice_;
    TrialPstnService = _TrialPstnService_;
    Config = _Config_;

    spyOn(Notification, 'success');
    spyOn(Notification, 'errorResponse');
    $state.modal = jasmine.createSpyObj('modal', ['close']);
    spyOn($state, 'go');
    spyOn($state, 'href');
    spyOn($window, 'open');
    addWatchSpy = spyOn($scope, '$watch');
    spyOn(TrialService, 'getDeviceTrialsLimit');
    spyOn(Analytics, 'trackTrialSteps');
    addContextSpy = spyOn(TrialContextService, 'addService').and.returnValue($q.resolve());
    removeContextSpy = spyOn(TrialContextService, 'removeService').and.returnValue($q.resolve());
    spyOn(TrialContextService, 'trialHasService').and.returnValue(false);
    spyOn(TrialPstnService, 'checkForPstnSetup').and.returnValue($q.resolve(false));
    spyOn(FeatureToggleService, 'atlasCareTrialsGetStatus').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'atlasCareInboundTrialsGetStatus').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'atlasDarlingGetStatus').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'atlasTrialsShipDevicesGetStatus').and.returnValue($q.resolve(false));
    spyOn(FeatureToggleService, 'supports').and.callFake(function (param) {
      return $q.resolve(_.includes(enabledFeatureToggles, param));
    });
    spyOn(Orgservice, 'getAdminOrgAsPromise').and.returnValue($q.resolve({
      data: {
        success: true,
        isTestOrg: true,
      },
    }));
    //spyOn(Orgservice, 'getOrg');
    spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
      callback(getJSONFixture('core/json/organizations/Orgservice.json').getOrg, 200);
    });

    $httpBackend
      .when('GET', 'https://atlas-intb.ciscospark.com/admin/api/v1/organizations/null?disableCache=false')
      .respond({});
  }));

  function initController(params) {
    stateParams = params;
    controller = $controller('TrialCtrl', {
      $scope: $scope,
      $translate: $translate,
      $stateParams: stateParams,
      TrialService: TrialService,
      TrialContextService: TrialContextService,
      Orgservice: Orgservice,
      Notification: Notification,
      HuronCustomer: HuronCustomer,
      FeatureToggleService: FeatureToggleService,
      TrialPstnService: TrialPstnService,
    });
    helpers = controller._helpers;
    $scope.$apply();
  }

  describe('edit trial mode:', function () {
    beforeEach(function () {
      var stateParams = {
        currentTrial: {
          offers: [{
            id: 'COLLAB',
          }, {
            id: 'SQUAREDUC',
          }],
          customerOrgId: '1234',
        },
        isEditing: true,
        mode: 'edit',

        details: {},
      };
      initController(stateParams);
    });

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
          trialEditResponse.data.customerOrgId = '12345';
          spyOn(TrialService, 'editTrial').and.returnValue($q.resolve(trialEditResponse));
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
              message: 'An error occurred',
            },
          }));
          controller.editTrial();
          $scope.$apply();
        });

        it('should notify error', function () {
          expect(Notification.errorResponse).toHaveBeenCalled();
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
            customerName: 'fake-customer-name',
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
            expect($state.href).toHaveBeenCalledWith('login', {
              customerOrgId: 'fake-customer-org-id',
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
            enabled: true,
          }, {
            message: false,
          })).toBe(true);

          expect(hasEnabledMessageTrial({
            enabled: true,
          }, {
            message: true,
          })).toBe(false);

          expect(hasEnabledMessageTrial({
            enabled: false,
          }, {
            message: false,
          })).toBe(false);

          expect(hasEnabledMessageTrial({
            enabled: false,
          }, {
            message: true,
          })).toBe(false);
        });
      });

      describe('hasEnabledMeetingTrial', function () {
        it('should expect an object with a boolean property named "enabled" as its first arg, and an object with a boolean property named "meeting" as its second arg', function () {
          var hasEnabledMeetingTrial = helpers.hasEnabledMeetingTrial;
          expect(hasEnabledMeetingTrial({
            enabled: true,
          }, {
            meeting: false,
          })).toBe(true);

          expect(hasEnabledMeetingTrial({
            enabled: true,
          }, {
            meeting: true,
          })).toBe(false);

          expect(hasEnabledMeetingTrial({
            enabled: false,
          }, {
            meeting: false,
          })).toBe(false);

          expect(hasEnabledMeetingTrial({
            enabled: false,
          }, {
            meeting: true,
          })).toBe(false);
        });
      });

      describe('hasEnabledCallTrial', function () {
        it('should expect an object with a boolean property named "enabled" as its first arg, and an object with a boolean property named "call" as its second arg', function () {
          var hasEnabledCallTrial = helpers.hasEnabledCallTrial;
          expect(hasEnabledCallTrial({
            enabled: true,
          }, {
            call: false,
          })).toBe(true);

          expect(hasEnabledCallTrial({
            enabled: true,
          }, {
            call: true,
          })).toBe(false);

          expect(hasEnabledCallTrial({
            enabled: false,
          }, {
            call: false,
          })).toBe(false);

          expect(hasEnabledCallTrial({
            enabled: false,
          }, {
            call: true,
          })).toBe(false);
        });
      });

      describe('hasEnabledRoomSystemTrial', function () {
        it('should expect an object with a boolean property named "enabled" as its first arg, and an object with a boolean property named "roomSystems" as its second arg', function () {
          var hasEnabledRoomSystemTrial = helpers.hasEnabledRoomSystemTrial;
          expect(hasEnabledRoomSystemTrial({
            enabled: true,
          }, {
            roomSystems: false,
          })).toBe(true);

          expect(hasEnabledRoomSystemTrial({
            enabled: true,
          }, {
            roomSystems: true,
          })).toBe(false);

          expect(hasEnabledRoomSystemTrial({
            enabled: false,
          }, {
            roomSystems: false,
          })).toBe(false);

          expect(hasEnabledRoomSystemTrial({
            enabled: false,
          }, {
            roomSystems: true,
          })).toBe(false);
        });
      });

      describe('hasEnabledSparkBoardTrial', function () {
        it('should expect an object with a boolean property named "enabled" as its first arg, and an object with a boolean property named "roomSystems" as its second arg', function () {
          var hasEnabledSparkBoardTrial = helpers.hasEnabledSparkBoardTrial;
          expect(hasEnabledSparkBoardTrial({
            enabled: true,
          }, {
            sparkBoard: false,
          })).toBe(true);

          expect(hasEnabledSparkBoardTrial({
            enabled: true,
          }, {
            sparkBoard: true,
          })).toBe(false);

          expect(hasEnabledSparkBoardTrial({
            enabled: false,
          }, {
            sparkBoard: false,
          })).toBe(false);

          expect(hasEnabledSparkBoardTrial({
            enabled: false,
          }, {
            sparkBoard: true,
          })).toBe(false);
        });
      });

      describe('hasEnabledAdvanceCareTrial', function () {
        it('should expect an object with a boolean property named "enabled" as its first arg,' +
          'and an object with a boolean property named "care" as its second arg',
        function () {
          var hasEnabledAdvanceCareTrial = helpers.hasEnabledAdvanceCareTrial;
          expect(hasEnabledAdvanceCareTrial({
            enabled: true,
          }, {
            advanceCare: false,
          })).toBe(true);

          expect(hasEnabledAdvanceCareTrial({
            enabled: true,
          }, {
            advanceCare: true,
          })).toBe(false);

          expect(hasEnabledAdvanceCareTrial({
            enabled: false,
          }, {
            advanceCare: false,
          })).toBe(false);

          expect(hasEnabledAdvanceCareTrial({
            enabled: false,
          }, {
            advanceCare: true,
          })).toBe(false);
        });
      });

      describe('hasEnabledCareTrial', function () {
        it('should expect an object with a boolean property named "enabled" as its first arg,' +
          'and an object with a boolean property named "advanceCare" as its second arg',
        function () {
          var hasEnabledCareTrial = helpers.hasEnabledCareTrial;
          expect(hasEnabledCareTrial({
            enabled: true,
          }, {
            care: false,
          })).toBe(true);

          expect(hasEnabledCareTrial({
            enabled: true,
          }, {
            care: true,
          })).toBe(false);

          expect(hasEnabledCareTrial({
            enabled: false,
          }, {
            care: false,
          })).toBe(false);

          expect(hasEnabledCareTrial({
            enabled: false,
          }, {
            care: true,
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
                enabled: false,
              },
              meetingTrial: {
                enabled: false,
              },
              callTrial: {
                enabled: false,
              },
              roomSystemTrial: {
                enabled: false,
              },
              sparkBoardTrial: {
                enabled: false,
              },
              careTrial: {
                enabled: false,
              },
              advanceCareTrial: {
                enabled: false,
              },
            };
            _preset = {
              message: false,
              meeting: false,
              call: false,
              roomSystems: false,
              care: false,
              advanceCare: false,
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

          it('should return true if the "sparkBoardTrial.enabled" sub-property on the first arg is true, ' +
              'and the "roomSystems" property on the second arg is false',
          function () {
            var hasEnabledAnyTrial = helpers.hasEnabledAnyTrial;
            _vm.sparkBoardTrial.enabled = true;
            _preset.sparkBoard = false;
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

          it('should return true if the "advanceCareTrial.enabled" sub-property on the first arg is true, ' +
              'and the "advanceCare" property on the second arg is false',
          function () {
            var hasEnabledAnyTrial = helpers.hasEnabledAnyTrial;
            _vm.advanceCareTrial.enabled = true;
            _preset.advanceCare = false;
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
            controller.advanceCareTrial.enabled = true;
            controller.messageTrial.enabled = false;
            expect(helpers.messageOfferDisabledExpression()).toBeTruthy();
            expect(controller.careTrial.enabled).toBeFalsy();
            expect(controller.advanceCareTrial.enabled).toBeFalsy();

            controller.messageTrial.enabled = true;
            expect(helpers.messageOfferDisabledExpression()).toBeFalsy();
            //Care is a choice to enable/disable when Message is enabled.
            expect(controller.careTrial.enabled).toBeFalsy();
            expect(controller.advanceCareTrial.enabled).toBeFalsy();
          });
        });

        describe('callOfferDisabledExpression:', function () {
          it('should be disabled if call is disabled.', function () {
            controller.careTrial.enabled = true;
            controller.advanceCareTrial.enabled = true;
            controller.callTrial.enabled = false;
            expect(helpers.callOfferDisabledExpression()).toBeTruthy();
            expect(controller.careTrial.enabled).toBeFalsy();
            expect(controller.advanceCareTrial.enabled).toBeFalsy();

            controller.callTrial.enabled = true;
            expect(helpers.callOfferDisabledExpression()).toBeFalsy();
            //Care is a choice to enable/disable when Call is enabled.
            expect(controller.careTrial.enabled).toBeFalsy();
            expect(controller.advanceCareTrial.enabled).toBeFalsy();
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

        describe('advanceCareLicenseInputDisabledExpression:', function () {
          it('advance care license count disabled expression returns false in happy scenario.', function () {
            controller.advanceCareTrial.enabled = true;
            controller.advanceCareTrial.details.quantity = CARE_LICENSE_COUNT;
            expect(helpers.advanceCareLicenseInputDisabledExpression()).toBeFalsy();
            expect(controller.advanceCareTrial.details.quantity).toEqual(CARE_LICENSE_COUNT);
          });

          it('advance care license count resets to 0 when disabled.', function () {
            controller.advanceCareTrial.details.quantity = CARE_LICENSE_COUNT;
            controller.advanceCareTrial.enabled = false;
            expect(helpers.advanceCareLicenseInputDisabledExpression()).toBeTruthy();
            expect(controller.advanceCareTrial.details.quantity).toEqual(0);
          });

          it('advance care license count shows default value when enabled.', function () {
            controller.advanceCareTrial.details.quantity = 0;
            controller.advanceCareTrial.enabled = true;
            expect(helpers.advanceCareLicenseInputDisabledExpression()).toBeFalsy();
            expect(controller.advanceCareTrial.details.quantity).toEqual(CARE_LICENSE_COUNT_DEFAULT);
          });
        });

        describe('validateCareLicense:', function () {
          it('care license validation allows max value up to and including 50.', function () {
            controller.details.licenseCount = 100;
            controller.careTrial.enabled = true;
            controller.advanceCareTrial.details.quantity = 0;
            var max = controller._helpers.getCareMaxLicenseCount(controller.careTypes.K1);
            expect(max).toBe(50);
          });

          it('care license validation allows max value up to and including 50 with advance care enabled', function () {
            controller.details.licenseCount = 50;
            controller.careTrial.enabled = true;
            controller.advanceCareTrial.details.quantity = 25;
            var max = controller._helpers.getCareMaxLicenseCount(controller.careTypes.K1);
            expect(max).toBe(50);
          });

          it('care license validation disallows value greater than details.licenseCount', function () {
            controller.details.licenseCount = CARE_LICENSE_COUNT - 1;
            controller.careTrial.enabled = true;
            var max = controller._helpers.getCareMaxLicenseCount(controller.careTypes.K1);
            expect(max).toBe(CARE_LICENSE_COUNT - 1);
          });
        });

        describe('validateAdvanceCareLicense:', function () {
          it('advance care license validation allows value up to and including 50.', function () {
            controller.details.licenseCount = 100;
            controller.advanceCareTrial.enabled = true;
            controller.careTrial.details.quantity = 0;
            var max = controller._helpers.getCareMaxLicenseCount(controller.careTypes.K2);
            expect(max).toBe(50);
          });

          it('advance care license validation allows max value up to and including 50 with advance care enabled.', function () {
            controller.details.licenseCount = 50;
            controller.advanceCareTrial.enabled = true;
            controller.careTrial.details.quantity = 25;
            var max = controller._helpers.getCareMaxLicenseCount(controller.careTypes.K1);
            expect(max).toBe(50);
          });

          it('advance care license validation disallows value greater than details.licenseCount', function () {
            controller.details.licenseCount = CARE_LICENSE_COUNT - 1;
            controller.advanceCareTrial.enabled = true;
            var max = controller._helpers.getCareMaxLicenseCount(controller.careTypes.K2);
            expect(max).toBe(CARE_LICENSE_COUNT - 1);
          });
        });
      });

      describe('care checkbox disabled/enabled', function () {
        it('should disable care checkbox in edit trial when care was already selected in start trial', function () {
          controller.preset.care = true;
          controller.messageTrial.enabled = true;
          var isDisabled = helpers.messageOfferDisabledExpression() || helpers.callOfferDisabledExpression() || controller.preset.care;
          expect(isDisabled).toBeTruthy();
        });

        it('should enable care checkbox in edit trial when care was not already selected in start trial', function () {
          controller.preset.care = false;
          controller.messageTrial.enabled = true;
          controller.callTrial.enabled = true;
          var isDisabled = helpers.messageOfferDisabledExpression() || helpers.callOfferDisabledExpression() || controller.preset.care;
          expect(isDisabled).toBeFalsy();
        });

        it('should disable care checkbox in edit trial when message was not selected in start trial', function () {
          controller.preset.care = false;
          controller.messageTrial.enabled = false;
          controller.callTrial.enabled = true;
          var isDisabled = helpers.messageOfferDisabledExpression() || helpers.callOfferDisabledExpression() || controller.preset.care;
          expect(isDisabled).toBeTruthy();
        });

        it('should disable care checkbox in edit trial when call was not selected in start trial', function () {
          controller.preset.care = false;
          controller.messageTrial.enabled = true;
          controller.callTrial.enabled = false;
          var isDisabled = helpers.messageOfferDisabledExpression() || helpers.callOfferDisabledExpression() || controller.preset.care;
          expect(isDisabled).toBeTruthy();
        });
      });

      describe('advance care checkbox disabled/enabled', function () {
        it('should disable advance care checkbox in edit trial when advance care was already selected in start trial', function () {
          controller.preset.advanceCare = true;
          controller.messageTrial.enabled = true;
          var isDisabled = helpers.messageOfferDisabledExpression() || helpers.callOfferDisabledExpression() || controller.preset.advanceCare;
          expect(isDisabled).toBeTruthy();
        });

        it('should enable advance care checkbox in edit trial when advance care was not already selected in start trial', function () {
          controller.preset.advanceCare = false;
          controller.messageTrial.enabled = true;
          controller.callTrial.enabled = true;
          var isDisabled = helpers.messageOfferDisabledExpression() || helpers.callOfferDisabledExpression() || controller.preset.advanceCare;
          expect(isDisabled).toBeFalsy();
        });

        it('should disable advance care checkbox in edit trial when message was not selected in start trial', function () {
          controller.preset.advanceCare = false;
          controller.messageTrial.enabled = false;
          controller.callTrial.enabled = true;
          var isDisabled = helpers.messageOfferDisabledExpression() || helpers.callOfferDisabledExpression() || controller.preset.advanceCare;
          expect(isDisabled).toBeTruthy();
        });

        it('should disable advance care checkbox in edit trial when call was not selected in start trial', function () {
          controller.preset.advanceCare = false;
          controller.messageTrial.enabled = true;
          controller.callTrial.enabled = false;
          var isDisabled = helpers.messageOfferDisabledExpression() || helpers.callOfferDisabledExpression() || controller.preset.advanceCare;
          expect(isDisabled).toBeTruthy();
        });
      });

      describe('advance care checkbox disabled/enabled', function () {
        it('should disable advance care checkbox in edit trial when advance care was already selected in start trial', function () {
          controller.preset.advanceCare = true;
          controller.messageTrial.enabled = true;
          var isDisabled = helpers.messageOfferDisabledExpression() || helpers.callOfferDisabledExpression() || controller.preset.advanceCare;
          expect(isDisabled).toBeTruthy();
        });

        it('should enable advance care checkbox in edit trial when advance care was not already selected in start trial', function () {
          controller.preset.advanceCare = false;
          controller.messageTrial.enabled = true;
          controller.callTrial.enabled = true;
          var isDisabled = helpers.messageOfferDisabledExpression() || helpers.callOfferDisabledExpression() || controller.preset.advanceCare;
          expect(isDisabled).toBeFalsy();
        });

        it('should disable advance care checkbox in edit trial when message was not selected in start trial', function () {
          controller.preset.advanceCare = false;
          controller.messageTrial.enabled = false;
          controller.callTrial.enabled = true;
          var isDisabled = helpers.messageOfferDisabledExpression() || helpers.callOfferDisabledExpression() || controller.preset.advanceCare;
          expect(isDisabled).toBeTruthy();
        });

        it('should disable advance care checkbox in edit trial when call was not selected in start trial', function () {
          controller.preset.advanceCare = false;
          controller.messageTrial.enabled = true;
          controller.callTrial.enabled = false;
          var isDisabled = helpers.messageOfferDisabledExpression() || helpers.callOfferDisabledExpression() || controller.preset.advanceCare;
          expect(isDisabled).toBeTruthy();
        });
      });
    });

    describe('with context service', function () {
      beforeEach(function () {
        trialEditResponse.data.customerOrgId = '12345';
        spyOn(TrialService, 'editTrial').and.returnValue($q.resolve(trialEditResponse));
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

        it('doesn\'t notify on ORGANIZATION_REGISTERED_USING_API if care trial is enabled', function () {
          addContextSpy.and.returnValue(
            $q.reject({
              data: {
                error: {
                  statusText: orgAlreadyRegistered,
                },
              },
            })
          );

          controller.contextTrial.enabled = true;
          controller.careTrial.enabled = true;
          controller.advanceCareTrial.enabled = true;
          controller.editTrial();

          // Check if button is greyed out, depending on form element being touched (in this case, false)
          // Should evaluate to true
          var greyedOut = controller.hasRegisteredContextService({ $pristine: true });

          $scope.$apply();

          expect(greyedOut).toBe(true);
          expect(TrialContextService.addService).toHaveBeenCalled();
          expect(TrialContextService.removeService).not.toHaveBeenCalled();
          expect(Notification.errorResponse).not.toHaveBeenCalled();
        });

        it('doesn\'t notify on ORGANIZATION_REGISTERED_USING_API if care trial is disabled', function () {
          addContextSpy.and.returnValue(
            $q.reject({
              data: {
                error: {
                  statusText: orgAlreadyRegistered,
                },
              },
            })
          );

          controller.contextTrial.enabled = true;
          controller.careTrial.enabled = false;
          controller.advanceCareTrial.enabled = false;
          controller.editTrial();

          // Check if button is greyed out, depending on form element being touched (in this case, false)
          // Should evaluate to true
          var greyedOut = controller.hasRegisteredContextService({ $pristine: true });

          $scope.$apply();

          expect(greyedOut).toBe(true);
          expect(TrialContextService.addService).toHaveBeenCalled();
          expect(TrialContextService.removeService).not.toHaveBeenCalled();
          expect(Notification.errorResponse).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('start trial mode:', function () {
    beforeEach(function () {
      var stateParams = {
        currentTrial: {},
        details: {},
        mode: 'add',
      };
      addWatchSpy.and.callThrough();
      initController(stateParams);
    });

    it('should be created successfully', function () {
      expect(controller).toBeDefined();
    });

    it('should have default offers', function () {
      expect(controller.messageTrial.enabled).toBeTruthy();
      expect(controller.meetingTrial.enabled).toBeTruthy();
      expect(controller.webexTrial.enabled).toBeTruthy();
      expect(controller.roomSystemTrial.enabled).toBeTruthy();
      expect(controller.sparkBoardTrial.enabled).toBeTruthy();
      expect(controller.callTrial.enabled).toBeTruthy();
      expect(controller.pstnTrial.enabled).toBeTruthy();
      expect(controller.contextTrial.enabled).toBeFalsy();
    });

    it('should start in trial.info state', function () {
      expect(controller.navStates).toEqual(['trial.info']);
    });

    it('should have correct navigation state order', function () {
      expect(controller.navOrder).toEqual(['trial.info', 'trial.webex', 'trial.pstnDeprecated', 'trial.emergAddress', 'trial.call']);
    });

    it('should transition state', function () {
      expect(controller.hasNextStep()).toBeTruthy();
      controller.nextStep();
      expect($state.go).toHaveBeenCalledWith('trial.info');
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
      controller.roomSystemTrial.enabled = false;
      controller.sparkBoardTrial.enabled = false;
      $scope.$apply();
      $scope.$digest();
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
        callback = jasmine.createSpy('addNumbersCallback').and.returnValue($q.resolve());
        spyOn(TrialService, 'startTrial').and.returnValue($q.resolve(getJSONFixture('core/json/trials/trialAddResponse.json')));
      });


      describe('basic behavior', function () {
        beforeEach(function () {
          controller.callTrial.enabled = false;
          controller.pstnTrial.enabled = false;
          controller.sparkBoardTrial.enabled = false;
          controller.roomSystemTrial.enabled = false;
          controller.startTrial();
          $scope.$apply();
        });

        it('should notify success', function () {
          expect(Notification.success).toHaveBeenCalledWith('trialModal.addSuccess', jasmine.any(Object));
        });

        it('should have a customer org id set', function () {
          expect(controller.customerOrgId).toBeDefined();
        });
      });

      describe('with addNumbers callback', function () {
        beforeEach(function () {
          controller.callTrial.enabled = false;
          controller.pstnTrial.enabled = false;
          controller.roomSystemTrial.enabled = false;
          controller.sparkBoardTrial.enabled = false;
          controller.startTrial(callback);
          $scope.$apply();
        });

        it('should call with customerOrgId', function () {
          expect(callback).toHaveBeenCalledWith('123');
        });

        it('should go to finish page', function () {
          expect($state.go).toHaveBeenCalledWith('trial.finishSetup');
        });
      });

      describe('without addNumbers callback', function () {
        beforeEach(function () {
          controller.callTrial.enabled = false;
          controller.roomSystemTrial.enabled = false;
          controller.pstnTrial.enabled = false;
          controller.sparkBoardTrial.enabled = false;
          controller.startTrial();
          $scope.$apply();
        });

        it('should not call callback', function () {
          expect(callback).not.toHaveBeenCalled();
        });

        it('should go to finish page', function () {
          expect($state.go).toHaveBeenCalledWith('trial.finishSetup');
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
          spyOn(HuronCustomer, 'create').and.returnValue($q.resolve());
          controller.startTrial();
          $scope.$apply();
          expect(HuronCustomer.create).toHaveBeenCalled();
          expect(Notification.success).toHaveBeenCalledWith('trialModal.addSuccess', jasmine.any(Object));
          expect(Notification.success.calls.count()).toEqual(1);
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
          controller.preset.pstn = false;
          spyOn(HuronCustomer, 'create').and.returnValue($q.resolve());
          spyOn(TrialPstnService, 'createPstnEntityV2').and.returnValue($q.resolve());
          controller.startTrial();
          $scope.$apply();
          expect(HuronCustomer.create).toHaveBeenCalled();
          expect(TrialPstnService.createPstnEntityV2).toHaveBeenCalled();
          expect(Notification.success).toHaveBeenCalledWith('trialModal.addSuccess', jasmine.any(Object));
          expect(Notification.success.calls.count()).toEqual(1);
        });

        it('error should notify error', function () {
          spyOn(HuronCustomer, 'create').and.returnValue($q.reject());
          controller.startTrial();
          $scope.$apply();
          expect(Notification.errorResponse).toHaveBeenCalled();
          expect(Notification.errorResponse.calls.count()).toEqual(1);
        });
      });

      describe('hasUserServices() ', function () {
        beforeEach(function () {
          controller.callTrial.enabled = false;
          controller.meetingTrial.enabled = false;
          controller.webexTrial.enabled = false;
          controller.messageTrial.enabled = false;
          controller.messageTrial.enabled = false;
          controller.roomSystemTrial.enabled = true;
          $scope.$apply();
        });

        it('should return false when only roomSystemTrial is enabled', function () {
          expect(controller.hasUserServices()).toBeFalsy();
        });

        it('should return false when only roomSystemTrial and sparkBoardTrial is enabled', function () {
          controller.sparkBoardTrial.enabled = true;
          expect(controller.hasUserServices()).toBeFalsy();
        });

        it('should return false when only sparkboardTrial is enabled', function () {
          controller.sparkBoardTrial.enabled = true;
          controller.roomSystemTrial.enabled = false;
          controller.sparkBoardTrial.enabled = false;
          expect(controller.hasUserServices()).toBeFalsy();
        });

        it('should return false when no services are enabled', function () {
          controller.roomSystemTrial.enabled = false;
          controller.sparkBoardTrial.enabled = false;
          $scope.$apply();
          expect(controller.hasUserServices()).toBeFalsy();
        });

        it('should return true when any user service is enabled', function () {
          controller.messageTrial.enabled = true;
          $scope.$apply();
          expect(controller.hasUserServices()).toBeTruthy();
        });
      });

      describe('with context service checked', function () {
        it('should enable context service', function () {
          controller.contextTrial.enabled = true;
          controller.callTrial.enabled = false;
          controller.sparkBoardTrial.enabled = false;
          controller.roomSystemTrial.enabled = false;
          controller.startTrial();
          $scope.$apply();
          expect(TrialContextService.addService).toHaveBeenCalled();
          expect(Notification.errorResponse).not.toHaveBeenCalled();
        });

        it('should display error notification if call to enable context service fails', function () {
          addContextSpy.and.returnValue($q.reject('rejected'));
          controller.contextTrial.enabled = true;
          controller.callTrial.enabled = false;
          controller.roomSystemTrial.enabled = false;
          controller.sparkBoardTrial.enabled = false;
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
          controller.roomSystemTrial.enabled = false;
          controller.sparkBoardTrial.enabled = false;
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
      beforeEach(function () {
        spyOn(TrialService, 'startTrial').and.returnValue($q.reject({
          data: {
            message: 'An error occurred',
          },
        }));
        controller.startTrial();
        $scope.$apply();
      });

      it('should notify error', function () {
        expect(Notification.errorResponse).toHaveBeenCalled();
      });

      it('should not have closed the modal', function () {
        expect($state.modal.close).not.toHaveBeenCalled();
      });
    });

    describe('Set ship devices modal display with Orgservice call', function () {
      it('should disable ship devices modal for test org', function () {
        spyOn(Orgservice, 'getAdminOrg').and.returnValue($q.resolve({
          data: {
            success: true,
            isTestOrg: true,
          },
        }));
        $scope.$apply();
        expect(controller.devicesModal.enabled).toBeFalsy();
      });
    });

    describe('Care offer trial', function () {
      describe('primary behaviors:', function () {
        it('Message and Care are enabled by default', function () {
          expect(controller.messageTrial.enabled).toBeTruthy();
          expect(controller.careTrial.enabled).toBeTruthy();
        });
      });

      describe('helper functions:', function () {
        var CARE_LICENSE_COUNT_DEFAULT = 15;
        var CARE_LICENSE_COUNT = CARE_LICENSE_COUNT_DEFAULT * 2;

        describe('messageOfferDisabledExpression:', function () {
          it('should be disabled if message is disabled.', function () {
            controller.messageTrial.enabled = false;
            expect(controller._helpers.messageOfferDisabledExpression()).toBeTruthy();
            expect(controller.careTrial.enabled).toBeFalsy();

            controller.messageTrial.enabled = true;
            expect(controller._helpers.messageOfferDisabledExpression()).toBeFalsy();
            //Care is a choice to enable/disable when Message is enabled.
            expect(controller.careTrial.enabled).toBeFalsy();
          });
        });

        describe('careLicenseInputDisabledExpression:', function () {
          it('care license count disabled expression works correctly.', function () {
            controller.careTrial.enabled = true;
            controller.careTrial.details.quantity = CARE_LICENSE_COUNT;
            expect(controller._helpers.careLicenseInputDisabledExpression()).toBeFalsy();
            expect(controller.careTrial.details.quantity).toEqual(CARE_LICENSE_COUNT);
          });

          it('care license count resets to 0 when disabled.', function () {
            controller.careTrial.details.quantity = CARE_LICENSE_COUNT;
            controller.careTrial.enabled = false;
            expect(controller._helpers.careLicenseInputDisabledExpression()).toBeTruthy();
            expect(controller.careTrial.details.quantity).toEqual(0);
          });

          it('care license count shows default value when enabled.', function () {
            controller.careTrial.details.quantity = 0;
            controller.careTrial.enabled = true;
            expect(controller._helpers.careLicenseInputDisabledExpression()).toBeFalsy();
            expect(controller.careTrial.details.quantity).toEqual(CARE_LICENSE_COUNT_DEFAULT);
          });
        });

        describe('advanceCareLicenseInputDisabledExpression:', function () {
          it('advance care license count disabled expression works correctly.', function () {
            controller.advanceCareTrial.enabled = true;
            controller.advanceCareTrial.details.quantity = CARE_LICENSE_COUNT;
            expect(controller._helpers.advanceCareLicenseInputDisabledExpression()).toBeFalsy();
            expect(controller.advanceCareTrial.details.quantity).toEqual(CARE_LICENSE_COUNT);
          });

          it('advance care license count resets to 0 when disabled.', function () {
            controller.advanceCareTrial.details.quantity = CARE_LICENSE_COUNT;
            controller.advanceCareTrial.enabled = false;
            expect(controller._helpers.advanceCareLicenseInputDisabledExpression()).toBeTruthy();
            expect(controller.advanceCareTrial.details.quantity).toEqual(0);
          });

          it('advance care license count shows default value when enabled.', function () {
            controller.advanceCareTrial.details.quantity = 0;
            controller.advanceCareTrial.enabled = true;
            expect(controller._helpers.advanceCareLicenseInputDisabledExpression()).toBeFalsy();
            expect(controller.advanceCareTrial.details.quantity).toEqual(CARE_LICENSE_COUNT_DEFAULT);
          });
        });

        describe('validateCareLicense:', function () {
          it('care license validation disallows value greater than total users.', function () {
            controller.details.licenseCount = 10;
            controller.careTrial.enabled = true;
            controller.advanceCareTrial.enabled = false;
            controller.advanceCareTrial.paid = 0;
            var max = controller._helpers.getCareMaxLicenseCount(controller.careTypes.K1);
            expect(max).toBe(10);
          });
          it('if message is purchased care license <= message licenses regardless of licenseCount', function () {
            controller.details.licenseCount = 10;
            controller.careTrial.enabled = true;
            controller.advanceCareTrial.enabled = false;
            controller.messageTrial.enabled = false;
            controller.messageTrial.paid = 40;
            var max = controller._helpers.getCareMaxLicenseCount(controller.careTypes.K1);
            expect(max).toBe(40);
          });
          it('if advanceCare purchased should count with K1', function () {
            controller.details.licenseCount = 10;
            controller.careTrial.enabled = true;
            controller.advanceCareTrial.enabled = false;
            controller.advanceCareTrial.paid = 5;
            controller.messageTrial.enabled = false;
            controller.messageTrial.paid = 40;
            var max = controller._helpers.getCareMaxLicenseCount(controller.careTypes.K1);
            expect(max).toBe(35);
          });
        });

        describe('validateAdvanceCareLicense:', function () {
          it('advance care license validation disallows value greater than total users.', function () {
            controller.details.licenseCount = 10;
            controller.advanceCareTrial.enabled = true;
            controller.careTrial.enabled = false;
            var max = controller._helpers.getCareMaxLicenseCount(controller.careTypes.K2);
            expect(max).toBe(10);
          });
          it('if message is purchased advance care license <= message licenses regardless of licenseCount', function () {
            controller.details.licenseCount = 10;
            controller.advanceCareTrial.enabled = true;
            controller.messageTrial.enabled = false;
            controller.messageTrial.paid = 40;
            controller.careTrial.enabled = false;
            var max = controller._helpers.getCareMaxLicenseCount(controller.careTypes.K2);
            expect(max).toBe(40);
          });
        });
      });
    });
  });

  describe('start trial existing org mode:', function () {
    beforeEach(function () {
      var stateParams = {
        currentTrial: purchasedCustomerData,
        details: {},
        mode: 'add',
      };
      addWatchSpy.and.callThrough();
      initController(stateParams);
    });

    it('should be created successfully', function () {
      expect(controller).toBeDefined();
    });

    it('should have purchased offer disabled and set to paid', function () {
      expect(controller.messageTrial.enabled).toBeFalsy();
      expect(controller.meetingTrial.enabled).toBeFalsy();
      expect(controller.webexTrial.enabled).toBeFalsy();
      expect(controller.roomSystemTrial.enabled).toBeFalsy();
      expect(controller.roomSystemTrial.paid).not.toBeFalsy();
      expect(controller.sparkBoardTrial.enabled).toBeFalsy();
      expect(controller.callTrial.enabled).toBeFalsy();
      expect(controller.contextTrial.enabled).toBeFalsy();
    });

    it('should start in trial.info state', function () {
      expect(controller.navStates).toEqual(['trial.info']);
    });

    it('should have correct navigation state order', function () {
      expect(controller.navOrder).toEqual(['trial.info', 'trial.webex', 'trial.pstnDeprecated', 'trial.emergAddress', 'trial.call']);
    });

    it('should transition state', function () {
      expect(controller.hasNextStep()).toBeTruthy();
      controller.nextStep();
      expect($state.go).toHaveBeenCalledWith('trial.info');
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
      controller.roomSystemTrial.enabled = true;
      $scope.$apply();
      $scope.$digest();
      expect(controller.pstnTrial.enabled).toBeTruthy();
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
        callback = jasmine.createSpy('addNumbersCallback').and.returnValue($q.resolve());
        spyOn(TrialService, 'startTrial').and.returnValue($q.resolve(getJSONFixture('core/json/trials/trialAddResponse.json')));
      });


      describe('basic behavior', function () {
        beforeEach(function () {
          controller.callTrial.enabled = false;
          controller.pstnTrial.enabled = false;
          controller.startTrial();
          $scope.$apply();
        });

        it('should notify success', function () {
          expect(Notification.success).toHaveBeenCalledWith('trialModal.addSuccess', jasmine.any(Object));
        });

        it('should have a customer org id set', function () {
          expect(controller.customerOrgId).toBeDefined();
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
          expect($state.go).toHaveBeenCalledWith('trial.finishSetup');
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
          expect($state.go).toHaveBeenCalledWith('trial.finishSetup');
        });
      });

      describe('With Squared UC', function () {
        beforeEach(function () {
          controller.pstnTrial.enabled = false;
          controller.callTrial.enabled = true;
        });

        it('should notify success', function () {
          spyOn(HuronCustomer, 'create').and.returnValue($q.resolve());
          controller.startTrial();
          $scope.$apply();
          expect(HuronCustomer.create).toHaveBeenCalled();
          expect(Notification.success).toHaveBeenCalledWith('trialModal.addSuccess', jasmine.any(Object));
          expect(Notification.success.calls.count()).toEqual(1);
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
        beforeEach(function () {
          controller.pstnTrial.enabled = true;
          controller.callTrial.enabled = true;
          controller.preset.call = false;
          controller.preset.pstn = false;
        });

        it('should have Squared UC offer', function () {
          expect(controller.callTrial.enabled).toBeTruthy();
          expect(controller.pstnTrial.enabled).toBeTruthy();
        });

        it('should notify success', function () {
          spyOn(HuronCustomer, 'create').and.returnValue($q.resolve());
          spyOn(TrialPstnService, 'createPstnEntityV2').and.returnValue($q.resolve());
          controller.startTrial();
          $scope.$apply();
          expect(HuronCustomer.create).toHaveBeenCalled();
          expect(TrialPstnService.createPstnEntityV2).toHaveBeenCalled();
          expect(Notification.success).toHaveBeenCalledWith('trialModal.addSuccess', jasmine.any(Object));
          expect(Notification.success.calls.count()).toEqual(1);
        });
        it('error should notify error', function () {
          spyOn(HuronCustomer, 'create').and.returnValue($q.reject());
          controller.startTrial();
          $scope.$apply();
          expect(Notification.errorResponse).toHaveBeenCalled();
          expect(Notification.errorResponse.calls.count()).toEqual(1);
        });
      });

      describe('hasUserServices() ', function () {
        beforeEach(function () {
          controller.callTrial.enabled = false;
          controller.meetingTrial.enabled = false;
          controller.webexTrial.enabled = false;
          controller.messageTrial.enabled = false;
          controller.messageTrial.enabled = false;
          controller.roomSystemTrial.enabled = true;
          $scope.$apply();
        });

        it('should return false when only roomSystemTrial is enabled', function () {
          expect(controller.hasUserServices()).toBeFalsy();
        });

        it('should return false when only roomSystemTrial and sparkBoardTrial is enabled', function () {
          controller.sparkBoardTrial.enabled = true;
          expect(controller.hasUserServices()).toBeFalsy();
        });

        it('should return false when only sparkboardTrial is enabled', function () {
          controller.sparkBoardTrial.enabled = true;
          controller.roomSystemTrial.enabled = false;
          expect(controller.hasUserServices()).toBeFalsy();
        });

        it('should return false when no services are enabled', function () {
          controller.roomSystemTrial.enabled = false;
          $scope.$apply();
          expect(controller.hasUserServices()).toBeFalsy();
        });

        it('should return true when any user service is enabled', function () {
          controller.messageTrial.enabled = true;
          $scope.$apply();
          expect(controller.hasUserServices()).toBeTruthy();
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

        it('doesn\'t notify on ORGANIZATION_REGISTERED_USING_API if care trial is enabled', function () {
          addContextSpy.and.returnValue(
            $q.reject({
              data: {
                error: {
                  statusText: orgAlreadyRegistered,
                },
              },
            })
          );

          controller.contextTrial.enabled = true;
          controller.callTrial.enabled = false;
          controller.careTrial.enabled = true;
          controller.advanceCareTrial.enabled = true;
          controller.startTrial();

          // Check if button is greyed out, depending on form element being touched (in this case, true)
          // Should evaluate to false
          var greyedOut = controller.hasRegisteredContextService({ $pristine: false });

          $scope.$apply();

          expect(greyedOut).toBe(false);
          expect(TrialContextService.addService).toHaveBeenCalled();
          expect(Notification.errorResponse).not.toHaveBeenCalled();
        });

        it('doesn\'t notify on ORGANIZATION_REGISTERED_USING_API if care trial is disabled', function () {
          addContextSpy.and.returnValue(
            $q.reject({
              data: {
                error: {
                  statusText: orgAlreadyRegistered,
                },
              },
            })
          );

          controller.contextTrial.enabled = true;
          controller.callTrial.enabled = false;
          controller.careTrial.enabled = false;
          controller.advanceCareTrial.enabled = false;
          controller.startTrial();

          // Check if button is greyed out, depending on form element being touched (in this case, true)
          // Should evaluate to false
          var greyedOut = controller.hasRegisteredContextService({ $pristine: false });

          $scope.$apply();

          expect(greyedOut).toBe(false);
          expect(TrialContextService.addService).toHaveBeenCalled();
          expect(Notification.errorResponse).not.toHaveBeenCalled();
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
      beforeEach(function () {
        spyOn(TrialService, 'startTrial').and.returnValue($q.reject({
          data: {
            message: 'An error occurred',
          },
        }));
        controller.startTrial();
        $scope.$apply();
      });

      it('should notify error', function () {
        expect(Notification.errorResponse).toHaveBeenCalled();
      });

      it('should not have closed the modal', function () {
        expect($state.modal.close).not.toHaveBeenCalled();
      });
    });

    describe('Set ship devices modal display with Orgservice call', function () {
      it('should disable ship devices modal for test org', function () {
        spyOn(Orgservice, 'getAdminOrg').and.returnValue($q.resolve({
          data: {
            success: true,
            isTestOrg: true,
          },
        }));
        $scope.$apply();
        expect(controller.devicesModal.enabled).toBeFalsy();
      });
    });
  });

  describe('Functions and functionality introduced for purchased customer trials', function () {
    beforeEach(function () {
      var stateParams = {
        currentTrial: purchasedWithTrialCustomerData,
        details: {},
        mode: 'add',
      };
      addWatchSpy.and.callThrough();
      initController(stateParams);
    });

    it('have purchased offer disabled', function () {
      expect(controller.messageTrial.enabled).toBeFalsy();
      expect(controller.meetingTrial.enabled).toBeFalsy();
      expect(controller.roomSystemTrial.enabled).toBeTruthy();
      expect(controller.sparkBoardTrial.enabled).toBeTruthy();
      expect(controller.webexTrial.enabled).toBeTruthy();
      expect(controller.callTrial.enabled).toBeFalsy();
    });

    it('have getPaidLicense calculate quantity for purchased services correctly', function () {
      var meetingLicenses = _.filter(controller.currentTrial.licenseList, { licenseType: 'CONFERENCING', isTrial: false });
      expect(meetingLicenses.length).toBe(2);
      expect(meetingLicenses[0].volume).toBe(69);
      expect(meetingLicenses[1].volume).toBe(70);
      expect(controller.currentTrial.licenseList);
      expect(controller.paidServices.meeting.qty).toBe(139);
    });

    it('find offers correctly for multiple offer types', function () {
      var result = controller._helpers.hasOfferType(Config.trials.meeting, Config.offerTypes.meetings, Config.offerTypes.webex);
      expect(result).toBeTruthy();
    });

    it('find offers correctly for single offer types', function () {
      expect(controller._helpers.hasOfferType(Config.offerTypes.roomSystems)).toBeTruthy();
    });

    it('get paid services correctly', function () {
      expect(controller.paidServices.message.qty).toBe(49);
      expect(controller.paidServices.meeting.qty).toBe(139);
      expect(controller.paidServices.webex.qty).toBe(0);
      expect(controller.paidServices.call.qty).toBe(0);
      expect(controller.paidServices.roomSystems.qty).toBe(0);
      expect(controller.paidServices.sparkBoard.qty).toBe(0);
      expect(controller.paidServices.care.qty).toBe(0);
      expect(controller.paidServices.advanceCare.qty).toBe(0);
      expect(controller.paidServices.context.qty).toBe(0);
    });

    it('merge trial presets with purchased services', function () {
      expect(controller.preset.message).toBeFalsy();
      expect(controller.preset.meeting).toBeFalsy();
      expect(controller.preset.webex).toBeTruthy();
      expect(controller.preset.call).toBeFalsy();
      expect(controller.preset.roomSystems).toBeTruthy();
      expect(controller.preset.sparkBoard).toBeTruthy();
      expect(controller.preset.care).toBeFalsy();
      expect(controller.preset.advanceCare).toBeFalsy();
      expect(controller.preset.context).toBeFalsy();
    });

    it('should group purchased services by partner', function () {
      spyOn(Authinfo, 'getOrgId').and.returnValue('12345');
      spyOn(Authinfo, 'getOrgName').and.returnValue('My Org Name');
      var stateParams = {
        currentTrial: purchasedWithTrialCustomerData,
        details: {},
        mode: 'add',
      };
      initController(stateParams);
      expect(controller.paidServicesForDisplay.length).toBe(2);
      expect(controller.paidServicesForDisplay[0].org).toBe('My Org Name');
    });

    it('should populate name and email fields', function () {
      spyOn(TrialService, 'startTrial').and.returnValue($q.resolve(getJSONFixture('core/json/trials/trialAddResponse.json')));
      controller.startTrial();
      $scope.$apply();
      expect(controller.trialData.details.customerEmail).toBe(controller.currentTrial.customerEmail);
      expect(controller.trialData.details.customerName).toBe(controller.currentTrial.customerName);
    });
  });

  describe('user license validation', function () {
    beforeEach(function () {
      addWatchSpy.and.callThrough();
      var stateParams = {
        currentTrial: purchasedWithTrialCustomerData,
        details: {},
        mode: 'add',
      };
      initController(stateParams);
    });

    it('should set user license minimum as 1 if there are user services in trial', function () {
      controller.messageTrial.enabled = false;
      controller.messageTrial.paid = 0;
      controller.callTrial.enabled = true;
      controller.webexTrial.enabled = false;

      var min = controller._helpers.getMinUserLicenseRequired();
      expect(min).toBe(1);
    });

    it('should set user license minimum to be 0 if there are no user services in trial', function () {
      controller.messageTrial.enabled = false;
      controller.messageTrial.paid = 0;
      controller.callTrial.enabled = false;
      controller.webexTrial.enabled = false;

      var min = controller._helpers.getMinUserLicenseRequired();
      expect(min).toBe(0);
    });

    it('should set user license minimum to be N if there are user services in trial and care license number = N ', function () {
      controller.messageTrial.enabled = true;
      controller.messageTrial.paid = 0;
      controller.callTrial.enabled = true;
      controller.webexTrial.enabled = false;
      controller.careTrial.enabled = true;
      controller.advanceCareTrial.enabled = true;
      controller.careTrial.details.quantity = 3;
      controller.advanceCareTrial.details.quantity = 6;

      var min = controller._helpers.getMinUserLicenseRequired();
      expect(min).toBe(9);
    });

    it('should set user license minimum as 1 if there are user services in trial and care license number > 1  and message purchased licenses', function () {
      controller.messageTrial.enabled = true;
      controller.messageTrial.paid = 10;
      controller.callTrial.enabled = true;
      controller.webexTrial.enabled = false;
      controller.careTrial.enabled = true;
      controller.advanceCareTrial.enabled = true;
      controller.careTrial.details.quantity = 3;
      controller.advanceCareTrial.details.quantity = 6;

      var min = controller._helpers.getMinUserLicenseRequired();
      expect(min).toBe(1);
    });

    it('should set user license minimum as 0 if there are no user services in trial and case license number >1  and message has purchased licenses', function () {
      controller.messageTrial.enabled = false;
      controller.messageTrial.paid = 10;
      controller.callTrial.enabled = false;
      controller.webexTrial.enabled = false;
      controller.careTrial.enabled = true;
      controller.advanceCareTrial.enabled = false;
      controller.careTrial.details.quantity = 3;

      var min = controller._helpers.getMinUserLicenseRequired();
      expect(min).toBe(0);
    });
  });
});
