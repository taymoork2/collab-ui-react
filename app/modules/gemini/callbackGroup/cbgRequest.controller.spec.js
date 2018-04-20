'use strict';

describe('controller: CbgRequestCtrl', function () {
  var $q, $state, $scope, $controller, $stateParams;
  var ctrl, cbgService, Notification;

  beforeEach(function () {
    this.preData = _.cloneDeep(getJSONFixture('gemini/common.json'));
  });

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  afterEach(function () {
    $q = $state = $scope = $controller = $stateParams = ctrl = cbgService = undefined;
  });

  function dependencies(_$q_, _$state_, $rootScope, _$controller_, _$stateParams_, _Notification_, _cbgService_) {
    $q = _$q_;
    $state = _$state_;
    cbgService = _cbgService_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $stateParams = _$stateParams_;
    Notification = _Notification_;
  }

  function initSpies() {
    $state.modal = jasmine.createSpyObj('modal', ['close']);
    spyOn(Notification, 'errorResponse');
    spyOn(cbgService, 'postRequest').and.returnValue($q.resolve());
  }

  function initController() {
    $stateParams.customerId = 'ff808081552992ec0155299619cb0001';

    ctrl = $controller('CbgRequestCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      $element: angular.element(''),
    });

    ctrl.countries = this.preData.getCountries;
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
      cbgService.postRequest.and.returnValue($q.resolve());
      ctrl.onSubmit();
      $scope.$apply();
      expect($state.modal.close).toHaveBeenCalled();
    });

    it('should show Notification error when submit failed', function () {
      cbgService.postRequest.and.returnValue($q.reject({ status: 404 }));
      ctrl.onSubmit();
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });
  });
});
