'use strict';

describe('controller: CbgRequestCtrl', function () {
  var $q, $state, $scope, $controller, $stateParams;
  var ctrl, cbgService, gemService, Notification;
  var preData = getJSONFixture('gemini/common.json');

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  afterEach(function () {
    $q = $state = $scope = $controller = $stateParams = ctrl = cbgService = undefined;
  });
  afterAll(function () {
    preData = undefined;
  });

  function dependencies(_$q_, _$state_, $rootScope, _$controller_, _$stateParams_, _Notification_, _gemService_, _cbgService_) {
    $q = _$q_;
    $state = _$state_;
    gemService = _gemService_;
    cbgService = _cbgService_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $stateParams = _$stateParams_;
    Notification = _Notification_;
  }

  function initSpies() {
    spyOn(Notification, 'notify');
    spyOn(gemService, 'showError');
    $state.modal = jasmine.createSpyObj('modal', ['close']);
    spyOn(cbgService, 'postRequest').and.returnValue($q.resolve());
  }

  function initController() {
    $stateParams.customerId = 'ff808081552992ec0155299619cb0001';
    ctrl = $controller('CbgRequestCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
    });

    ctrl.countries = preData.getCountries.content.data;
  }

  describe('$onInit', function () {
    it('should be show if countries is not empty', function () {
      ctrl.countries.pop();
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.countryDisable).toBe('show');
    });

    it('should be null if countries is empty', function () {
      ctrl.countries = [];
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.countryDisable).toBe('');
    });
  });

  describe('onSubmit', function () {
    it('should call $state.modal.close', function () {
      cbgService.postRequest.and.returnValue($q.resolve(preData.common));
      ctrl.onSubmit();
      $scope.$apply();
      expect($state.modal.close).toHaveBeenCalled();
    });

    it('should call Notification.notify', function () {
      preData.common.content.data.returnCode = 1000;
      cbgService.postRequest.and.returnValue($q.resolve(preData.common));
      ctrl.onSubmit();
      $scope.$apply();
      expect(Notification.notify).toHaveBeenCalled();
    });
  });
});
