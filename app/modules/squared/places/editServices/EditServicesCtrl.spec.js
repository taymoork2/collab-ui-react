'use strict';

describe('EditServicesCtrl: Ctrl', function () {
  var controller, $stateParams, $q, $state, $scope, CsdmDataModelService, Notification;
  var $controller;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Squared'));

  beforeEach(inject(function (_$controller_, _$q_, $rootScope, _$stateParams_, _$state_, _CsdmDataModelService_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    CsdmDataModelService = _CsdmDataModelService_;
    Notification = _Notification_;
  }));

  function initController() {
    controller = $controller('EditServicesCtrl', {
      $scope: $scope,
      $state: $state,
      CsdmDataModelService: CsdmDataModelService,
    });
  }

  afterEach(function () {
    jasmine.getJSONFixtures().clearCache();
  });
  beforeEach(installPromiseMatchers);

  describe('initial selection', function () {
    it('sparkCall is selected if "ciscouc" is present', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              account: {
                entitlements: ['ciscouc'],
              },
            },
          };
        },
      };
      initController();

      expect(controller.service).toBe('sparkCall');
    });

    it('sparkOnly is selected if "ciscouc" and callConnect entitlements  is not present', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              account: {
                entitlements: ['something'],
              },
            },
          };
        },
      };
      initController();

      expect(controller.service).toBe('sparkOnly');
    });

    it('sparkCallConnect is selected if the two entitlements is present', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              account: {
                entitlements: ['squared-fusion-uc', 'squared-fusion-ec'],
              },
            },
          };
        },
      };
      initController();

      expect(controller.service).toBe('sparkCallConnect');
    });
  });

  describe('init of ctrl', function () {
    it('should set sparkCallConnectEnabled to false if toggle is not present and hybridCallEnabledOnOrg is true', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              csdmHybridCallFeature: false,
              hybridCallEnabledOnOrg: true,
              account: {
                entitlements: ['something'],
              },
            },
          };
        },
      };
      initController();
      $scope.$apply();
      expect(controller.sparkCallConnectEnabled).toBe(false);
    });

    it('should set sparkCallConnectEnabled to false if toggle is not present and callConnect is enabled ', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              csdmHybridCallFeature: false,
              hybridCallEnabledOnOrg: true,
              account: {
                entitlements: ['squared-fusion-uc', 'squared-fusion-ec'],
              },
            },
          };
        },
      };
      initController();
      $scope.$digest();
      expect(controller.sparkCallConnectEnabled).toBe(false);
    });

    it('should set sparkCallConnectEnabled to true if toggle is present and callConnect is enabled on org', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              csdmHybridCallFeature: true,
              hybridCallEnabledOnOrg: true,
              account: {
                entitlements: ['something'],
              },
            },
          };
        },
      };
      initController();
      $scope.$digest();
      expect(controller.sparkCallConnectEnabled).toBe(true);
    });
  });

  describe('wizard functions', function () {
    var deviceCisUuid;
    beforeEach(function () {
      deviceCisUuid = 'deviceId';
    });

    describe('hasNextStep', function () {
      it('should be true when editServiceIsn`t set', function () {
        var state = function () {
          return {
            data: {
              csdmHybridCallFeature: true,
              account: {
                entitlements: ['something'],
              },
              function: 'anotherFunction',
            },
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          },
        };
        initController();

        expect(controller.hasNextStep()).toBe(true);
      });

      it('should be true when service is sparkCall and it is not the previous service', function () {
        var state = function () {
          return {
            data: {
              account: {
                entitlements: ['squared-fusion-uc', 'squared-fusion-ec'],
              },
              function: 'editServices',
            },
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          },
        };
        initController();
        controller.service = 'sparkCall';

        expect(controller.hasNextStep()).toBe(true);
      });

      it('should be true when service is sparkCallConnect and it is not the previouis service', function () {
        var state = function () {
          return {
            data: {
              account: {
                entitlements: ['ciscouc'],
              },
              function: 'editServices',
            },
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          },
        };
        initController();
        controller.service = 'sparkCallConnect';

        expect(controller.hasNextStep()).toBe(true);
      });

      it('should be true when service is sparkOnly and it is the previous service and calendar is selected', function () {
        var state = function () {
          return {
            data: {
              account: {
                entitlements: ['ciscouc'],
              },
              function: 'editServices',
            },
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          },
        };
        initController();
        controller.service = 'sparkOnly';
        controller.enableCalService = true;

        expect(controller.hasNextStep()).toBe(true);
      });

      it('should be false when editService is set and it is the previous service', function () {
        var state = function () {
          return {
            data: {
              account: {
                entitlements: ['something'],
              },
              function: 'editServices',
            },
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          },
        };
        initController();
        expect(controller.hasNextStep()).toBe(false);
      });
    });

    describe('next', function () {
      var state;
      it('selecting sparkCall should pass on all fields required by the next step including cicouc entitlement', function () {
        state = function () {
          return {
            data: {
              account: {
                entitlements: ['something'],
              },
            },
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          },
        };
        spyOn($stateParams.wizard, 'next');
        initController();
        controller.service = 'sparkCall';
        controller.next();
        expect($stateParams.wizard.next).toHaveBeenCalled();
        var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
        expect(wizardState.account.entitlements).toEqual(['something', 'ciscouc']);
      });

      it('selecting sparkCall and Calendar should pass on all fields required by the next step including cicouc entitlement', function () {
        state = function () {
          return {
            data: {
              account: {
                entitlements: ['something'],
              },
            },
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          },
        };
        spyOn($stateParams.wizard, 'next');
        initController();
        controller.service = 'sparkCall';
        controller.enableCalService = true;

        controller.next();
        expect($stateParams.wizard.next).toHaveBeenCalled();
        var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
        expect(wizardState.account.entitlements).toEqual(['something', 'ciscouc']);
        expect(wizardState.account.enableCalService).toBe(true);
      });

      it('selecting sparkOnly and Calendar should pass on all fields required by the next step including no call entitlement', function () {
        state = function () {
          return {
            data: {
              account: {
                entitlements: ['something'],
              },
            },
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          },
        };
        spyOn($stateParams.wizard, 'next');
        initController();
        controller.service = 'sparkOnly';
        controller.enableCalService = true;

        controller.next();
        expect($stateParams.wizard.next).toHaveBeenCalled();
        var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
        expect(wizardState.account.entitlements).toEqual(['something']);
        expect(wizardState.account.enableCalService).toBe(true);
      });

      it('selecting sparkCallConnect should pass on all fields required by the next step including the two callConnect entitlements', function () {
        state = function () {
          return {
            data: {
              account: {
                entitlements: ['something'],
              },
            },
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          },
        };
        spyOn($stateParams.wizard, 'next');
        initController();
        controller.service = 'sparkCallConnect';
        controller.next();
        expect($stateParams.wizard.next).toHaveBeenCalled();
        var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
        expect(wizardState.account.entitlements).toEqual(['something', 'squared-fusion-ec', 'squared-fusion-uc']);
        expect(wizardState.account.enableCalService).toBe(false);
      });

      it('selecting sparkCallConnect and calendar should pass on all fields required by the next step including the two callConnect entitlements', function () {
        state = function () {
          return {
            data: {
              account: {
                entitlements: ['something'],
              },
            },
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          },
        };
        spyOn($stateParams.wizard, 'next');
        initController();
        controller.service = 'sparkCallConnect';
        controller.enableCalService = true;
        controller.next();
        expect($stateParams.wizard.next).toHaveBeenCalled();
        var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
        expect(wizardState.account.entitlements).toEqual(['something', 'squared-fusion-ec', 'squared-fusion-uc']);
        expect(wizardState.account.enableCalService).toBe(true);
      });

      it('selecting sparkCallConnect and disabling calendar should pass on all fields required by the next step including the two callConnect entitlements', function () {
        state = function () {
          return {
            data: {
              account: {
                entitlements: ['something', 'squared-fusion-cal'],
                externalLinkedAccounts: [
                  { providerID: 'squared-fusion-cal', accountGUID: 'example0@example.com' },
                  { providerID: 'squared-fusion-gcal', accountGUID: 'example1@example.com' },
                  { providerID: 'squared-fusion-uc', accountGUID: 'example2@example.com' }],
              },
            },
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          },
        };
        spyOn($stateParams.wizard, 'next');
        initController();
        controller.service = 'sparkCallConnect';
        controller.enableCalService = false;
        controller.next();
        expect($stateParams.wizard.next).toHaveBeenCalled();
        var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
        expect(wizardState.account.entitlements).toEqual(['something', 'squared-fusion-ec', 'squared-fusion-uc']);
        expect(wizardState.account.enableCalService).toBe(false);
      });

      it('deselecting sparkCallConnect and enabling calendar should pass on all fields required by the next step excluding the two callConnect entitlements', function () {
        state = function () {
          return {
            data: {
              account: {
                entitlements: ['something'],
              },
            },
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          },
        };
        spyOn($stateParams.wizard, 'next');
        initController();
        controller.service = 'sparkCall';
        controller.enableCalService = true;
        controller.next();
        expect($stateParams.wizard.next).toHaveBeenCalled();
        var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
        expect(wizardState.account.entitlements).toEqual(['something', 'ciscouc']);
        expect(wizardState.account.enableCalService).toBe(true);
      });

      it('selecting sparkCallConnect when calendar was already enabled, should pass on all fields required by the next step including the two callConnect entitlements', function () {
        state = function () {
          return {
            data: {
              account: {
                entitlements: ['something', 'squared-fusion-cal'],
                externalLinkedAccounts: [
                  { providerID: 'squared-fusion-cal', accountGUID: 'example0@example.com' },
                  { providerID: 'squared-fusion-gcal', accountGUID: 'example1@example.com' },
                  { providerID: 'squared-fusion-uc', accountGUID: 'example2@example.com' }],
              },
            },
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          },
        };
        spyOn($stateParams.wizard, 'next');
        initController();
        controller.service = 'sparkCallConnect';
        controller.enableCalService = true;
        controller.next();
        expect($stateParams.wizard.next).toHaveBeenCalled();
        var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
        expect(wizardState.account.entitlements).toEqual(['something', 'squared-fusion-ec', 'squared-fusion-uc', 'squared-fusion-cal']);
        expect(wizardState.account.enableCalService).toBe(false);
      });
    });

    describe('Save', function () {
      beforeEach(function () {
        $scope.$dismiss = function () {
        };
        spyOn($scope, '$dismiss');
        spyOn(Notification, 'success');
        spyOn(Notification, 'warning');
        spyOn(Notification, 'errorResponse');
      });

      it('should just close the modal if place does not have "ciscouc" entitlement', function () {
        $stateParams.wizard = {
          state: function () {
            return {
              data: {
                account: {},
              },
            };
          },
        };
        initController();
        controller.save();
        expect($scope.$dismiss).toHaveBeenCalled();
      });

      it('should remove the "ciscouc" entitlement and close the modal', function () {
        $stateParams.wizard = {
          state: function () {
            return {
              data: {
                account: {
                  cisUuid: deviceCisUuid,
                  entitlements: ['ciscouc', 'something'],
                },
              },
            };
          },
        };
        var place = { cisUuid: deviceCisUuid };
        CsdmDataModelService.getPlacesMap = function () {
        };
        spyOn(CsdmDataModelService, 'reloadPlace').and.returnValue($q.resolve(place));
        CsdmDataModelService.updateCloudberryPlace = function () {
        };
        spyOn(CsdmDataModelService, 'updateCloudberryPlace').and.returnValue($q.resolve());
        initController();
        controller.service = 'sparkOnly';
        controller.save();
        $scope.$digest();
        expect(CsdmDataModelService.updateCloudberryPlace).toHaveBeenCalledWith(place, {
          entitlements: ['something'],
          externalLinkedAccounts: null,
        });
        expect($scope.$dismiss).toHaveBeenCalled();
        expect(Notification.success).toHaveBeenCalled();
      });

      it('should remove ext linked for cal and remove cal entitlement when calendar was deselected', function () {
        $stateParams.wizard = {
          state: function () {
            return {
              data: {
                account: {
                  cisUuid: deviceCisUuid,
                  entitlements: ['squared-fusion-cal', 'squared-fusion-uc', 'squared-fusion-ec', 'something'],
                  externalLinkedAccounts: [
                    { providerID: 'squared-fusion-cal', accountGUID: 'example0@example.com' },
                    { providerID: 'squared-fusion-gcal', accountGUID: 'example1@example.com' },
                    { providerID: 'squared-fusion-uc', accountGUID: 'example2@example.com' },
                  ],
                },
              },
            };
          },
        };
        var place = { cisUuid: deviceCisUuid };
        CsdmDataModelService.getPlacesMap = function () {
        };
        spyOn(CsdmDataModelService, 'reloadPlace').and.returnValue($q.resolve(place));
        CsdmDataModelService.updateCloudberryPlace = function () {
        };
        spyOn(CsdmDataModelService, 'updateCloudberryPlace').and.returnValue($q.resolve());
        initController();
        // controller.service = 'sparkCallConnect'; //it should be unchanged
        controller.enableCalService = false;
        controller.save();
        $scope.$digest();
        expect(CsdmDataModelService.updateCloudberryPlace).toHaveBeenCalledWith(place, {
          entitlements: ['something', 'squared-fusion-ec', 'squared-fusion-uc'],
          externalLinkedAccounts: [
            { providerID: 'squared-fusion-cal', accountGUID: 'example0@example.com', operation: 'delete' },
            { providerID: 'squared-fusion-gcal', accountGUID: 'example1@example.com', operation: 'delete' },
            // { providerID: 'squared-fusion-uc', accountGUID: 'example2@example.com' }],//should not resave this
          ],
        });
        expect($scope.$dismiss).toHaveBeenCalled();
        expect(Notification.success).toHaveBeenCalled();
      });

      it('should remove ext linked for call and remove call entitlement when callConnect was deselected', function () {
        $stateParams.wizard = {
          state: function () {
            return {
              data: {
                account: {
                  cisUuid: deviceCisUuid,
                  entitlements: ['squared-fusion-cal', 'squared-fusion-uc', 'squared-fusion-ec', 'something'],
                  externalLinkedAccounts: [
                    { providerID: 'squared-fusion-cal', accountGUID: 'example0@example.com' },
                    { providerID: 'squared-fusion-gcal', accountGUID: 'example1@example.com' },
                    { providerID: 'squared-fusion-uc', accountGUID: 'example2@example.com' }],
                },
              },
            };
          },
        };
        var place = { cisUuid: deviceCisUuid };
        CsdmDataModelService.getPlacesMap = function () {
        };
        spyOn(CsdmDataModelService, 'reloadPlace').and.returnValue($q.resolve(place));
        CsdmDataModelService.updateCloudberryPlace = function () {
        };
        spyOn(CsdmDataModelService, 'updateCloudberryPlace').and.returnValue($q.resolve());
        initController();
        controller.service = 'sparkOnly';
        // controller.enableCalService = true;  //it should be unchanged
        controller.save();
        $scope.$digest();
        expect(CsdmDataModelService.updateCloudberryPlace).toHaveBeenCalledWith(place, {
          entitlements: ['something', 'squared-fusion-cal'],
          externalLinkedAccounts: [
            { providerID: 'squared-fusion-gcal', accountGUID: 'example1@example.com', operation: 'delete' }, //should be cleaned up
            { providerID: 'squared-fusion-uc', accountGUID: 'example2@example.com', operation: 'delete' },
            // { providerID: 'squared-fusion-cal', accountGUID: 'example0@example.com' }, //should not be resaved
          ],
        });
        expect($scope.$dismiss).toHaveBeenCalled();
        expect(Notification.success).toHaveBeenCalled();
      });

      it('should remove ext linked for call and calendar and remove call entitlement when callConnect was deselected', function () {
        $stateParams.wizard = {
          state: function () {
            return {
              data: {
                account: {
                  cisUuid: deviceCisUuid,
                  entitlements: ['squared-fusion-uc', 'squared-fusion-ec', 'something'],
                  externalLinkedAccounts: [
                    { providerID: 'squared-fusion-cal', accountGUID: 'example0@example.com' },
                    { providerID: 'squared-fusion-gcal', accountGUID: 'example1@example.com' },
                    { providerID: 'special provider', accountGUID: '234052519823' },
                    { providerID: 'squared-fusion-uc', accountGUID: 'example2@example.com' }],
                },
              },
            };
          },
        };
        var place = { cisUuid: deviceCisUuid };
        CsdmDataModelService.getPlacesMap = function () {
        };
        spyOn(CsdmDataModelService, 'reloadPlace').and.returnValue($q.resolve(place));
        CsdmDataModelService.updateCloudberryPlace = function () {
        };
        spyOn(CsdmDataModelService, 'updateCloudberryPlace').and.returnValue($q.resolve());
        initController();
        controller.service = 'sparkOnly';
        // controller.enableCalService = true;  //it should be unchanged
        controller.save();
        $scope.$digest();
        expect(CsdmDataModelService.updateCloudberryPlace).toHaveBeenCalledWith(place, {
          entitlements: ['something'],
          externalLinkedAccounts: [
            { providerID: 'squared-fusion-cal', accountGUID: 'example0@example.com', operation: 'delete' }, //should be cleaned up
            { providerID: 'squared-fusion-gcal', accountGUID: 'example1@example.com', operation: 'delete' }, //should be cleaned up
            // { providerID: 'special provider', accountGUID: '234052519823' }, //should be left intact, not deleted, eg not sent in as a delete.
            { providerID: 'squared-fusion-uc', accountGUID: 'example2@example.com', operation: 'delete' }],
        });
        expect($scope.$dismiss).toHaveBeenCalled();
        expect(Notification.success).toHaveBeenCalled();
      });

      it('display warning when place not found', function () {
        $stateParams.wizard = {
          state: function () {
            return {
              data: {
                account: {
                  cisUuid: deviceCisUuid,
                  entitlements: ['ciscouc'],
                },
              },
            };
          },
        };
        spyOn(CsdmDataModelService, 'reloadPlace').and.returnValue($q.resolve());
        initController();
        controller.service = 'sparkOnly';
        controller.save();
        $scope.$digest();
        expect(Notification.warning).toHaveBeenCalled();
        expect($scope.$dismiss).toHaveBeenCalledTimes(0);
      });

      it('display error when fetching places fails', function () {
        $stateParams.wizard = {
          state: function () {
            return {
              data: {
                account: {
                  cisUuid: deviceCisUuid,
                  entitlements: ['ciscouc'],
                },
              },
            };
          },
        };
        spyOn(CsdmDataModelService, 'reloadPlace').and.returnValue($q.reject());
        initController();
        controller.service = 'sparkOnly';
        controller.save();
        $scope.$digest();
        expect(Notification.errorResponse).toHaveBeenCalled();
        expect($scope.$dismiss).toHaveBeenCalledTimes(0);
      });

      it('display error when update fails', function () {
        $stateParams.wizard = {
          state: function () {
            return {
              data: {
                account: {
                  cisUuid: deviceCisUuid,
                  entitlements: ['ciscouc'],
                },
              },
            };
          },
        };
        spyOn(CsdmDataModelService, 'reloadPlace').and.returnValue($q.resolve({ cisUuid: deviceCisUuid }));
        spyOn(CsdmDataModelService, 'updateCloudberryPlace').and.returnValue($q.reject());
        initController();
        controller.service = 'sparkOnly';
        controller.save();
        $scope.$digest();
        expect(Notification.errorResponse).toHaveBeenCalled();
        expect($scope.$dismiss).toHaveBeenCalledTimes(0);
      });
    });
  });
});
