'use strict';

describe('Care Feature Delete Ctrl', function () {
  var controller, $rootScope, $q, $scope, $stateParams, $timeout, $translate, CareFeatureList, Log, Notification, Authinfo;
  var deferred, vaDeferred;

  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1'),
  };
  var successResponse = {
    status: 200,
    statusText: 'OK',
  };
  var failureResponse = {
    data: 'Internal Server Error',
    status: 500,
    statusText: 'Internal Server Error',
  };

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', spiedAuthinfo);
  }));

  beforeEach(inject(function (_$rootScope_, $controller, _$stateParams_, _$timeout_, _$translate_, _$q_, _Authinfo_, _CareFeatureList_, _Notification_, _Log_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $q = _$q_;
    $stateParams = _$stateParams_;
    $translate = _$translate_;
    $timeout = _$timeout_;
    CareFeatureList = _CareFeatureList_;
    Notification = _Notification_;
    Log = _Log_;
    controller = $controller;
    Authinfo = _Authinfo_;

    deferred = $q.defer();
    vaDeferred = $q.defer();
    spyOn(CareFeatureList, 'deleteTemplate').and.returnValue(deferred.promise);
    spyOn(CareFeatureList, 'deleteVirtualAssistantConfig').and.returnValue(vaDeferred.promise);
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');
    spyOn(Notification, 'errorWithTrackingId');
    spyOn($rootScope, '$broadcast').and.callThrough();
  }));

  $stateParams = {
    deleteFeatureId: 123,
    deleteFeatureName: 'Sunlight Dev Template',
    deleteFeatureType: 'Ch',
  };

  var vaStateParams = {
    deleteFeatureId: 123,
    deleteFeatureName: 'Virtual Assistant Dev Config',
    deleteFeatureType: 'Va',
  };

  function callController(_stateParams) {
    controller = controller('CareFeaturesDeleteCtrl', {
      $rootScope: $rootScope,
      $scope: $scope,
      $stateParams: _stateParams,
      $timeout: $timeout,
      $translate: $translate,
      Authinfo: Authinfo,
      CareFeatureList: CareFeatureList,
      Log: Log,
      Notification: Notification,
    });
  }

  it('should broadcast CARE_FEATURE_DELETED event when chat template is deleted successfully', function () {
    callController($stateParams);
    controller.deleteFeature();
    deferred.resolve(successResponse);
    $scope.$apply();
    $timeout.flush();
    expect($rootScope.$broadcast).toHaveBeenCalledWith('CARE_FEATURE_DELETED');
  });

  it('should give a successful notification when chat template is deleted successfully', function () {
    callController($stateParams);
    controller.deleteFeature();
    deferred.resolve(successResponse);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
      featureName: $stateParams.deleteFeatureName,
    });
  });

  it('should give an error notification when chat template deletion fails', function () {
    callController($stateParams);
    controller.deleteFeature();
    deferred.reject(failureResponse);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.errorWithTrackingId).toHaveBeenCalledWith(failureResponse, jasmine.any(String));
  });

  it('should broadcast CARE_FEATURE_DELETED event when VA config is deleted successfully', function () {
    callController(vaStateParams);
    controller.deleteFeature();
    vaDeferred.resolve(successResponse);
    $scope.$apply();
    $timeout.flush();
    expect($rootScope.$broadcast).toHaveBeenCalledWith('CARE_FEATURE_DELETED');
  });

  it('should give a successful notification when VA config is deleted successfully', function () {
    callController(vaStateParams);
    controller.deleteFeature();
    vaDeferred.resolve(successResponse);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
      featureName: vaStateParams.deleteFeatureName,
    });
  });

  it('should give an error notification when VA config deletion fails', function () {
    callController(vaStateParams);
    controller.deleteFeature();
    vaDeferred.reject(failureResponse);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.errorWithTrackingId).toHaveBeenCalledWith(failureResponse, jasmine.any(String));
  });
});
