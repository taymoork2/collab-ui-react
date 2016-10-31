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

  describe('Initial selection', function () {
    it('sparkCall is selected if "ciscouc" is present', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              entitlements: ['ciscouc']
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
              entitlements: ['something']
            }
          };
        }
      };
      initController();

      expect(controller.service).toBe('sparkOnly');
    });
  });

  describe('Next', function () {
    it('should pass on the selected service', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {}
          };
        },
        next: function () {}
      };
      spyOn($stateParams.wizard, 'next');
      initController();
      var service = "testService";
      controller.service = service;

      controller.next();
      expect($stateParams.wizard.next).toHaveBeenCalledWith({ service: service });
    });
  });

  describe('Save', function () {
    it('should just close the modal if place does not have "ciscouc" entitlement', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {}
          };
        }
      };
      $scope.$dismiss = function () {};
      spyOn($scope, '$dismiss');
      initController();

      controller.save();
      expect($scope.$dismiss).toHaveBeenCalled();
    });

    it('should remove the "ciscouc" entitlement and close the modal', function () {
      var selectedPlace = {};
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              entitlements: ['ciscouc', 'something'],
              selectedPlace: selectedPlace
            }
          };
        }
      };
      CsdmDataModelService.updateCloudberryPlace = function () {};
      spyOn(CsdmDataModelService, 'updateCloudberryPlace').and.returnValue($q.when());
      $scope.$dismiss = function () {};
      spyOn($scope, '$dismiss');
      spyOn(Notification, 'success');
      initController();

      controller.save();
      $scope.$digest();
      expect(CsdmDataModelService.updateCloudberryPlace).toHaveBeenCalledWith(selectedPlace, ['something']);
      expect($scope.$dismiss).toHaveBeenCalled();
      expect(Notification.success).toHaveBeenCalled();
    });
  });
});
