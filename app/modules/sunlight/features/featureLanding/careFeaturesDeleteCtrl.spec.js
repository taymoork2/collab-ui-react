'use strict';

describe('Care Feature Delete Ctrl', function () {

  var controller, $rootScope, $q, $scope, $stateParams, $timeout, $translate, CareFeatureList, Log, Notification;
  var deferred;

  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };
  var successResponse = {
    'status': 200,
    'statusText': 'OK'
  };
  var failureResponse = {
    'data': 'Internal Server Error',
    'status': 500,
    'statusText': 'Internal Server Error'
  };

  beforeEach(module('Sunlight'));
  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));

  beforeEach(inject(function (_$rootScope_, $controller, _$stateParams_, _$timeout_, _$translate_, _$q_, Authinfo, _CareFeatureList_, _Notification_, _Log_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $q = _$q_;
    $stateParams = _$stateParams_;
    $translate = _$translate_;
    $timeout = _$timeout_;
    Authinfo = Authinfo;
    CareFeatureList = _CareFeatureList_;
    Notification = _Notification_;
    Log = _Log_;

    deferred = $q.defer();
    spyOn(CareFeatureList, 'deleteChatTemplate').and.returnValue(deferred.promise);
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');
    spyOn($rootScope, '$broadcast').and.callThrough();

    $stateParams = {
      deleteFeatureId: 123,
      deleteFeatureName: 'Sunlight Dev Template',
      deleteFeatureType: 'CT'
    };

    controller = $controller('CareFeaturesDeleteCtrl', {
      $rootScope: $rootScope,
      $scope: $scope,
      $stateParams: $stateParams,
      $timeout: $timeout,
      $translate: $translate,
      Authinfo: Authinfo,
      CareFeatureList: CareFeatureList,
      Log: Log,
      Notification: Notification
    });

  }));

  it('should broadcast CARE_FEATURE_DELETED event when chat template is deleted successfully', function () {
    controller.deleteFeature();
    deferred.resolve(successResponse);
    $scope.$apply();
    $timeout.flush();
    expect($rootScope.$broadcast).toHaveBeenCalledWith('CARE_FEATURE_DELETED');

  });

  it('should give a successful notification when chat template is deleted successfully', function () {
    controller.deleteFeature();
    deferred.resolve(successResponse);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
      featureName: $stateParams.deleteFeatureName,
      featureText: jasmine.any(String)
    });
  });

  it('should give an error notification when chat template deletion fails', function () {
    controller.deleteFeature();
    deferred.reject(failureResponse);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.error).toHaveBeenCalledWith(jasmine.any(String));
  });

});
