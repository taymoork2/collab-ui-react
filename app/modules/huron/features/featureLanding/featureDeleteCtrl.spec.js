'use strict';

describe('Controller: HuronFeatureDeleteCtrl', function () {
  var controller, Notification, AutoAttendantCeService, AutoAttendantCeInfoModelService, AAModelService, HuronFeatureDeleteCtrl, featDefer, AACalendarService;
  var $rootScope, $scope, $stateParams, $q, $timeout, $translate;

  var cesWithNumber = getJSONFixture('huron/json/autoAttendant/callExperiencesWithNumber.json');
  var aaModel = {};
  var callExperience = getJSONFixture('huron/json/autoAttendant/aCallExperience.json');

  function ce2CeInfo(rawCeInfo) {
    var _ceInfo = AutoAttendantCeInfoModelService.newCeInfo();
    for (var j = 0; j < rawCeInfo.assignedResources.length; j++) {
      var _resource = AutoAttendantCeInfoModelService.newResource();
      _resource.setId(rawCeInfo.assignedResources[j].id);
      _resource.setTrigger(rawCeInfo.assignedResources[j].trigger);
      _resource.setType(rawCeInfo.assignedResources[j].type);
      if (angular.isDefined(rawCeInfo.assignedResources[j].number)) {
        _resource.setNumber(rawCeInfo.assignedResources[j].number);
      }
      _ceInfo.addResource(_resource);
    }
    _ceInfo.setName(rawCeInfo.callExperienceName);
    _ceInfo.setCeUrl(rawCeInfo.callExperienceURL);
    return _ceInfo;
  }

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_$rootScope_, $controller, _$translate_, _$q_, _$timeout_, _Notification_, _AutoAttendantCeInfoModelService_, _AutoAttendantCeService_, _AAModelService_, _AACalendarService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $q = _$q_;
    $translate = _$translate_;
    $timeout = _$timeout_;
    Notification = _Notification_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AAModelService = _AAModelService_;
    AACalendarService = _AACalendarService_;

    featDefer = $q.defer();
    spyOn(AutoAttendantCeService, 'deleteCe').and.returnValue(featDefer.promise);
    spyOn(AutoAttendantCeInfoModelService, 'deleteCeInfo');
    spyOn(AutoAttendantCeService, 'readCe').and.returnValue($q.when(callExperience));
    spyOn(AACalendarService, 'deleteCalendar').and.returnValue($q.when());

    spyOn($rootScope, '$broadcast').and.callThrough();

    $stateParams = {
      deleteFeatureId: 'c16a6027-caef-4429-b3af-9d61ddc7964b',
      deleteFeautureName: 'Oleg\'s Call Experience 1',
      deleteFeatureType: 'AA'
    };

    controller = $controller('HuronFeatureDeleteCtrl as vm', {
      $scope: $scope,
      $stateParams: $stateParams,
      Notification: Notification,
      $timeout: $timeout
    });
    $scope.$apply();

  }));

  describe('deleteFeature', function () {
    beforeEach(function () {

      spyOn(Notification, 'success');
      spyOn(Notification, 'error');
      spyOn($scope.vm, 'deleteSuccess').and.callThrough();
      spyOn($scope.vm, 'deleteError').and.callThrough();

      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);

      var ceInfos = [];
      for (var i = 0; i < cesWithNumber.length; i++) {
        var _ceInfo = ce2CeInfo(cesWithNumber[i]);
        ceInfos[i] = _ceInfo;
      }
      aaModel.ceInfos = ceInfos;

    });

    it('should produce a success notification and broadcast when auto attendant is deleted', function () {

      var successResponse = {
        'status': 200,
        'statusText': 'OK'
      };

      expect(aaModel.ceInfos.length).toEqual(2);
      controller.deleteFeature();
      featDefer.resolve(successResponse);
      $scope.$apply();
      $timeout.flush();
      expect(Notification.success).toHaveBeenCalledWith(
        'huronFeatureDetails.deleteSuccessText', jasmine.any(Object)
      );
      expect(Notification.error).not.toHaveBeenCalled();
      expect(aaModel.ceInfos.length).toEqual(1);
      expect(AutoAttendantCeInfoModelService.deleteCeInfo).toHaveBeenCalled();
      expect($rootScope.$broadcast).toHaveBeenCalledWith('HURON_FEATURE_DELETED');

    });

    it('should produce a error notification when auto attendant deletion fails', function () {

      var errorResponse = {
        'data': 'Not Found',
        'status': 404,
        'statusText': 'Not Found'
      };
      expect(aaModel.ceInfos.length).toEqual(2);
      controller.deleteFeature();
      featDefer.reject(errorResponse);
      $scope.$apply();
      $timeout.flush();
      expect(aaModel.ceInfos.length).toEqual(2);
      expect(Notification.error).toHaveBeenCalledWith(jasmine.any(String));
      expect(AutoAttendantCeInfoModelService.deleteCeInfo).not.toHaveBeenCalled();
      expect($rootScope.$broadcast).not.toHaveBeenCalledWith('HURON_FEATURE_DELETED');

    });

    it('should produce a error notification if feature id for auto attendant delete is invalid', function () {

      $scope.vm.featureId = 'invalid-aa-id';
      expect(aaModel.ceInfos.length).toEqual(2);
      controller.deleteFeature();
      $scope.$apply();
      $timeout.flush();
      expect(aaModel.ceInfos.length).toEqual(2);
      expect(Notification.error).toHaveBeenCalledWith('huronFeatureDetails.deleteFailedText');
      expect(AutoAttendantCeInfoModelService.deleteCeInfo).not.toHaveBeenCalled();
      expect($rootScope.$broadcast).not.toHaveBeenCalledWith('HURON_FEATURE_DELETED');

    });
  });
});

describe('Huron Feature DeleteCtrl', function () {

  var featureDeleteCtrl, rootScope, $scope, $stateParams, $q, $timeout, $translate, Authinfo, huntGroupService, autoAttendantCeService, Notification, Log, featureDelDeferred;
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

  beforeEach(module('Huron'));
  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));

  beforeEach(inject(function (_$rootScope_, $controller, _$timeout_, _$translate_, _$q_, Authinfo, _HuntGroupService_, _AutoAttendantCeService_, _Notification_, _Log_) {
    rootScope = _$rootScope_;
    $scope = rootScope.$new();
    $q = _$q_;
    $translate = _$translate_;
    $timeout = _$timeout_;
    Authinfo = Authinfo;
    huntGroupService = _HuntGroupService_;
    autoAttendantCeService = _AutoAttendantCeService_;
    Notification = _Notification_;
    Log = _Log_;

    featureDelDeferred = $q.defer();
    spyOn(huntGroupService, 'deleteHuntGroup').and.returnValue(featureDelDeferred.promise);
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');
    spyOn(rootScope, '$broadcast').and.callThrough();

    $stateParams = {
      deleteFeatureId: 123,
      deleteFeatureName: 'Technical Support',
      deleteFeatureType: 'HG'
    };

    featureDeleteCtrl = $controller('HuronFeatureDeleteCtrl', {
      $rootScope: rootScope,
      $scope: $scope,
      $stateParams: $stateParams,
      $timeout: $timeout,
      $translate: $translate,
      Authinfo: Authinfo,
      HuntGroupService: huntGroupService,
      AutoAttendantCeService: autoAttendantCeService,
      Log: Log,
      Notification: Notification
    });

  }));

  it('should broadcast HURON_FEATURE_DELETED event when hunt group is deleted successfully', function () {

    featureDeleteCtrl.deleteFeature();

    featureDelDeferred.resolve(successResponse);
    $scope.$apply();
    $timeout.flush();

    expect(rootScope.$broadcast).toHaveBeenCalledWith('HURON_FEATURE_DELETED');

  });

  it('should give a successful notification when hunt group is deleted successfully', function () {
    featureDeleteCtrl.deleteFeature();
    featureDelDeferred.resolve(successResponse);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
      featureName: $stateParams.deleteFeatureName,
      featureType: jasmine.any(String)
    });
  });

  it('should give the an error notification when hunt group deletion fails', function () {
    featureDeleteCtrl.deleteFeature();
    featureDelDeferred.reject(failureResponse);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.error).toHaveBeenCalledWith(jasmine.any(String));
  });

});
