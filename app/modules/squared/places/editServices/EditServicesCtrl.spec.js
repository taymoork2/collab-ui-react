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
      CsdmDataModelService: CsdmDataModelService
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
                entitlements: ['ciscouc']
              }
            }
          };
        }
      };
      initController();

      expect(controller.service).toBe('sparkCall');
    });

    it('sparkOnly is selected if "ciscouc" is not present', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              account: {
                entitlements: ['something']
              }
            }
          };
        }
      };
      initController();

      expect(controller.service).toBe('sparkOnly');
    });
  });

  describe('wizard functions', function () {
    var deviceCisUuid;
    beforeEach(function () {
      deviceCisUuid = 'deviceId';
    });

    describe('next', function () {
      var state;
      it('should pass on all fields required by the next step', function () {
        state = function () {
          return {
            data: {
              account: {
                entitlements: ['something']
              }
            }
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {}
        };
        spyOn($stateParams.wizard, 'next');
        initController();
        controller.service = 'sparkCall';
        controller.next();
        expect($stateParams.wizard.next).toHaveBeenCalled();
        var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
        expect(wizardState.account.entitlements).toEqual(['something', 'ciscouc']);
      });
    });

    describe('Save', function () {
      beforeEach(function () {
        $scope.$dismiss = function () {};
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
                account: {}
              }
            };
          }
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
                  entitlements: ['ciscouc', 'something']
                }
              }
            };
          }
        };
        var place = { cisUuid: deviceCisUuid };
        CsdmDataModelService.getPlacesMap = function () {};
        spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.when({ 'http://placeurl': place }));
        CsdmDataModelService.updateCloudberryPlace = function () {};
        spyOn(CsdmDataModelService, 'updateCloudberryPlace').and.returnValue($q.when());
        initController();
        controller.service = 'sparkOnly';
        controller.save();
        $scope.$digest();
        expect(CsdmDataModelService.updateCloudberryPlace).toHaveBeenCalledWith(place, ['something']);
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
                  entitlements: ['ciscouc']
                }
              }
            };
          }
        };
        spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.when({ 'http://placeurl': {} }));
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
                  entitlements: ['ciscouc']
                }
              }
            };
          }
        };
        spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.reject());
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
                  entitlements: ['ciscouc']
                }
              }
            };
          }
        };
        spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.when({ 'http://placeurl': { cisUuid: deviceCisUuid } }));
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
