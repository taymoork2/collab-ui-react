'use strict';

describe('component: cbgEditCountry', function () {
  var $q, $scope, $state, $stateParams, $componentCtrl;
  var ctrl, PreviousState, cbgService, Notification;
  var preData = getJSONFixture('gemini/common.json');

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  afterEach(function () {
    $q = $scope = $state = $stateParams = $componentCtrl = ctrl = PreviousState = cbgService = Notification = undefined;
  });
  afterAll(function () {
    preData = undefined;
  });

  function dependencies(_$q_, _$state_, _$rootScope_, _$stateParams_, _$componentController_, _PreviousState_, _Notification_, _cbgService_) {
    $q = _$q_;
    $state = _$state_;
    cbgService = _cbgService_;
    $scope = _$rootScope_.$new();
    $stateParams = _$stateParams_;
    Notification = _Notification_;
    PreviousState = _PreviousState_;
    $componentCtrl = _$componentController_;
  }

  function initSpies() {
    spyOn($state, 'go');
    spyOn(PreviousState, 'go');
    spyOn(Notification, 'notify');
    spyOn(Notification, 'errorResponse');
    spyOn(cbgService, 'updateCallbackGroup').and.returnValue($q.resolve());
  }

  function initController() {
    $stateParams.obj = {};
    $state.current.data = {};
    $stateParams.obj.info = preData.getCurrentCallbackGroup;
    ctrl = $componentCtrl('cbgEditCountry', { $scope: $scope, $state: $state });
  }

  describe('$onInit', function () {
    it('should initialization', function () {
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.countries.length).toBe(1);
    });
  });

  describe('click event for onSetBtnDisable', function () {
    it('should call PreviousState.go', function () {
      ctrl.onCancel();
      $scope.$apply();
      expect(PreviousState.go).toHaveBeenCalled();
    });

    it('should be true when countries is empty', function () {
      ctrl.countries = [];
      ctrl.onSetBtnDisable();
      $scope.$apply();
      expect(ctrl.btnDisable).toBe(true);
    });

    it('should be true when groupName is null', function () {
      ctrl.countries = preData.getCurrentCallbackGroup.countries;
      ctrl.isReadonly = false;
      ctrl.model.groupName = '';
      ctrl.onSetBtnDisable();
      $scope.$apply();
      expect(ctrl.btnDisable).toBe(true);
    });

    it('should be false when groupName changed in text input', function () {
      ctrl.countries = preData.getCurrentCallbackGroup.countries;
      ctrl.isReadonly = true;
      ctrl.model.groupName = 'update groupName this time';
      ctrl.onSetBtnDisable('groupName');
      $scope.$apply();
      expect(ctrl.btnDisable).toBe(false);
    });

    it('should be false when customerAttribute changed in text input', function () {
      ctrl.countries = preData.getCurrentCallbackGroup.countries;
      ctrl.model.customerAttribute = 'update customerAttribute this time';
      ctrl.onSetBtnDisable('customerAttribute');
      $scope.$apply();
      expect(ctrl.btnDisable).toBe(false);
    });
  });

  describe('click event for onSave', function () {
    it('should call $state.go when response correct data', function () {
      var mockResponse = preData.common;
      ctrl.countries = preData.getCountries.content.data;
      cbgService.updateCallbackGroup.and.returnValue($q.resolve(mockResponse));
      ctrl.onSave();
      $scope.$apply();
      expect($state.go).toHaveBeenCalled();
    });

    it('should call Notification.notify', function () {
      var mockResponse = preData.common;
      mockResponse.content.data.returnCode = 1000;
      cbgService.updateCallbackGroup.and.returnValue($q.resolve(mockResponse));
      ctrl.onSave();
      $scope.$apply();
      expect(Notification.notify).toHaveBeenCalled();
    });

    it('should call Notification.errorResponse', function () {
      cbgService.updateCallbackGroup.and.returnValue($q.reject({ status: 404 }));
      ctrl.onSave();
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });
  });
});
