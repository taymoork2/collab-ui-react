'use strict';

describe('Care Feature Delete Ctrl', function () {
  var controller, $rootScope, $q, $scope, $stateParams, $timeout, $translate, CareFeatureList, CvaService, Log, Notification, Authinfo, EvaService, Analytics, AbcService;
  var deferred, cvaDeferred, evaDeferred, abcDeferred;

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

  beforeEach(inject(function (_$rootScope_, $controller, _$stateParams_, _$timeout_, _$translate_, _$q_, _AbcService_, _Analytics_, _Authinfo_, _CareFeatureList_, _CvaService_, _EvaService_, _Log_, _Notification_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $q = _$q_;
    $stateParams = _$stateParams_;
    $translate = _$translate_;
    $timeout = _$timeout_;
    CareFeatureList = _CareFeatureList_;
    CvaService = _CvaService_;
    Notification = _Notification_;
    Log = _Log_;
    controller = $controller;
    Authinfo = _Authinfo_;
    EvaService = _EvaService_;
    Analytics = _Analytics_;
    AbcService = _AbcService_;

    deferred = $q.defer();
    cvaDeferred = $q.defer();
    evaDeferred = $q.defer();
    abcDeferred = $q.defer();
    spyOn(CareFeatureList, 'deleteTemplate').and.returnValue(deferred.promise);
    spyOn(CvaService, 'deleteConfig').and.returnValue(cvaDeferred.promise);
    spyOn(EvaService, 'deleteExpertAssistant').and.returnValue(evaDeferred.promise);
    spyOn(AbcService, 'deleteAbcConfig').and.returnValue(abcDeferred.promise);
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');
    spyOn(Notification, 'errorWithTrackingId');
    spyOn(Analytics, 'trackEvent');
    spyOn($rootScope, '$broadcast').and.callThrough();
  }));

  afterEach(function () {
    controller = $rootScope = $q = $scope = $stateParams = $timeout = $translate = CareFeatureList = CvaService = Log = Notification = Authinfo = EvaService = AbcService = deferred = cvaDeferred = evaDeferred = abcDeferred = Analytics = undefined;
  });

  $stateParams = {
    deleteFeatureId: 123,
    deleteFeatureName: 'Sunlight Dev Template',
    deleteFeatureType: 'Ch',
  };

  var cvaStateParams = {
    deleteFeatureId: 123,
    deleteFeatureName: 'Customer Virtual Assistant Dev Config',
    deleteFeatureType: 'customerVirtualAssistant',
  };

  var evaStateParams = {
    deleteFeatureId: 123,
    deleteFeatureName: 'Expert Virtual Assistant Dev Config',
    deleteFeatureType: 'expertVirtualAssistant',
  };

  var abcStateParams = {
    deleteFeatureId: 123,
    deleteFeatureName: 'Apple Business Chat Dev Config',
    deleteFeatureType: 'appleBusinessChat',
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

  it('should delete chat template successfully', function () {
    callController($stateParams);
    controller.deleteFeature();
    deferred.resolve(successResponse);
    $scope.$apply();
    $timeout.flush();
    expect($rootScope.$broadcast).toHaveBeenCalledWith('CARE_FEATURE_DELETED');
    expect(Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
      featureName: $stateParams.deleteFeatureName,
    });
    expect(Analytics.trackEvent).not.toHaveBeenCalled();
  });

  it('should fail at deleting chat template', function () {
    callController($stateParams);
    controller.deleteFeature();
    deferred.reject(failureResponse);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.errorWithTrackingId).toHaveBeenCalledWith(failureResponse, jasmine.any(String), {
      featureName: $stateParams.deleteFeatureName,
    });
    expect(Analytics.trackEvent).not.toHaveBeenCalled();
  });

  it('should delete CVA config successfully', function () {
    callController(cvaStateParams);
    controller.deleteFeature();
    cvaDeferred.resolve(successResponse);
    $scope.$apply();
    $timeout.flush();
    expect($rootScope.$broadcast).toHaveBeenCalledWith('CARE_FEATURE_DELETED');
    expect(Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
      featureName: cvaStateParams.deleteFeatureName,
    });
    expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_DELETE_SUCCESS);
  });

  it('should fail at deleting CVA config', function () {
    callController(cvaStateParams);
    controller.deleteFeature();
    cvaDeferred.reject(failureResponse);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.errorWithTrackingId).toHaveBeenCalledWith(failureResponse, jasmine.any(String), {
      featureName: cvaStateParams.deleteFeatureName,
    });
    expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_DELETE_FAILURE);
  });

  it('should delete EVA config successfully', function () {
    callController(evaStateParams);
    controller.deleteFeature();
    evaDeferred.resolve(successResponse);
    $scope.$apply();
    $timeout.flush();
    expect($rootScope.$broadcast).toHaveBeenCalledWith('CARE_FEATURE_DELETED');
    expect(Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
      featureName: evaStateParams.deleteFeatureName,
    });
    expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_DELETE_SUCCESS);
  });

  it('should fail at deleting EVA config', function () {
    callController(evaStateParams);
    controller.deleteFeature();
    evaDeferred.reject(failureResponse);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.errorWithTrackingId).toHaveBeenCalledWith(failureResponse, jasmine.any(String), {
      featureName: evaStateParams.deleteFeatureName,
    });
    expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_DELETE_FAILURE);
  });

  it('should delete ABC config successfully', function () {
    callController(abcStateParams);
    controller.deleteFeature();
    abcDeferred.resolve(successResponse);
    $scope.$apply();
    $timeout.flush();
    expect($rootScope.$broadcast).toHaveBeenCalledWith('CARE_FEATURE_DELETED');
    expect(Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
      featureName: abcStateParams.deleteFeatureName,
    });
    expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.sections.APPLE_BUSINESS_CHAT.eventNames.ABC_DELETE_SUCCESS);
  });

  it('should show error notification if deleting ABC config fails', function () {
    callController(abcStateParams);
    controller.deleteFeature();
    abcDeferred.reject(failureResponse);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.errorWithTrackingId).toHaveBeenCalledWith(failureResponse, jasmine.any(String), {
      featureName: abcStateParams.deleteFeatureName,
    });
    expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.sections.APPLE_BUSINESS_CHAT.eventNames.ABC_DELETE_FAILURE);
  });
});
