'use strict';

describe('Huron Feature DeleteCtrl for AA', function () {
  var controller, Notification, AutoAttendantCeService, AutoAttendantCeInfoModelService, AAModelService, featDefer, AACalendarService, AACommonService, DoRestService;
  var $rootScope, $scope, $stateParams, $q, $timeout;

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
      if (!_.isUndefined(rawCeInfo.assignedResources[j].number)) {
        _resource.setNumber(rawCeInfo.assignedResources[j].number);
      }
      _ceInfo.addResource(_resource);
    }
    _ceInfo.setName(rawCeInfo.callExperienceName);
    _ceInfo.setCeUrl(rawCeInfo.callExperienceURL);
    return _ceInfo;
  }

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$rootScope_, $controller, _$q_, _$timeout_, _Notification_, _AutoAttendantCeInfoModelService_, _AutoAttendantCeService_, _AAModelService_, _AACalendarService_, _AACommonService_, _DoRestService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $q = _$q_;
    $timeout = _$timeout_;
    Notification = _Notification_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AAModelService = _AAModelService_;
    AACalendarService = _AACalendarService_;
    AACommonService = _AACommonService_;
    DoRestService = _DoRestService_;

    featDefer = $q.defer();
    spyOn(AutoAttendantCeService, 'deleteCe').and.returnValue(featDefer.promise);
    spyOn(AutoAttendantCeInfoModelService, 'deleteCeInfo');
    spyOn(AutoAttendantCeService, 'readCe').and.returnValue($q.resolve(callExperience));
    spyOn(AACalendarService, 'deleteCalendar').and.returnValue($q.resolve());

    spyOn($rootScope, '$broadcast').and.callThrough();

    $stateParams = {
      deleteFeatureId: 'c16a6027-caef-4429-b3af-9d61ddc7964b',
      deleteFeautureName: 'Oleg\'s Call Experience 1',
      deleteFeatureType: 'AA',
    };

    controller = $controller('HuronFeatureDeleteCtrl as vm', {
      $scope: $scope,
      $stateParams: $stateParams,
      Notification: Notification,
      $timeout: $timeout,
    });
    $scope.$apply();
  }));

  afterEach(function () {
    $rootScope = $scope = $q = $timeout = Notification = AutoAttendantCeService = AutoAttendantCeInfoModelService = AAModelService = AACalendarService = AACommonService = DoRestService = featDefer = undefined;
  });

  describe('deleteFeature', function () {
    beforeEach(function () {
      spyOn(Notification, 'success');
      spyOn(Notification, 'error');
      spyOn($scope.vm, 'deleteSuccess').and.callThrough();
      spyOn($scope.vm, 'deleteError').and.callThrough();

      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      spyOn(DoRestService, 'deleteDoRest').and.returnValue($q.resolve());

      var ceInfos = [];
      for (var i = 0; i < cesWithNumber.length; i++) {
        var _ceInfo = ce2CeInfo(cesWithNumber[i]);
        ceInfos[i] = _ceInfo;
      }
      aaModel.ceInfos = ceInfos;
    });

    it('should produce a success notification and broadcast when auto attendant is deleted', function () {
      var successResponse = {
        status: 200,
        statusText: 'OK',
      };

      expect(aaModel.ceInfos.length).toBe(2);
      spyOn(AACommonService, 'isRestApiToggle').and.returnValue(true);
      controller.deleteFeature();
      featDefer.resolve(successResponse);
      $scope.$apply();
      $timeout.flush();
      expect(DoRestService.deleteDoRest).toHaveBeenCalled();
      expect(Notification.success).toHaveBeenCalledWith(
        'huronFeatureDetails.deleteSuccessText', jasmine.any(Object)
      );
      expect(Notification.error).not.toHaveBeenCalled();
      expect(aaModel.ceInfos.length).toBe(1);
      expect(AutoAttendantCeInfoModelService.deleteCeInfo).toHaveBeenCalled();
      expect($rootScope.$broadcast).toHaveBeenCalledWith('HURON_FEATURE_DELETED');
    });

    it('should produce a success notification and broadcast when auto attendant is deleted in non-REST API toggled tenants', function () {
      var successResponse = {
        status: 200,
        statusText: 'OK',
      };

      expect(aaModel.ceInfos.length).toBe(2);
      spyOn(AACommonService, 'isRestApiToggle').and.returnValue(false);
      controller.deleteFeature();
      featDefer.resolve(successResponse);
      $scope.$apply();
      $timeout.flush();
      expect(DoRestService.deleteDoRest).not.toHaveBeenCalled();
      expect(Notification.success).toHaveBeenCalledWith(
        'huronFeatureDetails.deleteSuccessText', jasmine.any(Object)
      );
      expect(Notification.error).not.toHaveBeenCalled();
      expect(aaModel.ceInfos.length).toBe(1);
      expect(AutoAttendantCeInfoModelService.deleteCeInfo).toHaveBeenCalled();
      expect($rootScope.$broadcast).toHaveBeenCalledWith('HURON_FEATURE_DELETED');
    });

    it('should produce a success notification and broadcast when auto attendant is deleted where the REST block is not found with 404', function () {
      var successResponse = {
        status: 200,
        statusText: 'OK',
      };

      expect(aaModel.ceInfos.length).toBe(2);
      spyOn(AACommonService, 'isRestApiToggle').and.returnValue(true);
      DoRestService.deleteDoRest.and.returnValue($q.reject({
        statusText: 'Not Found',
        status: 404,
      }));
      controller.deleteFeature();
      featDefer.resolve(successResponse);
      $scope.$apply();
      $timeout.flush();
      expect(DoRestService.deleteDoRest).toHaveBeenCalled();
      expect(Notification.success).toHaveBeenCalledWith(
        'huronFeatureDetails.deleteSuccessText', jasmine.any(Object)
      );
      expect(Notification.error).not.toHaveBeenCalled();
      expect(aaModel.ceInfos.length).toBe(1);
      expect(AutoAttendantCeInfoModelService.deleteCeInfo).toHaveBeenCalled();
      expect($rootScope.$broadcast).toHaveBeenCalledWith('HURON_FEATURE_DELETED');
    });

    it('should produce a error notification when auto attendant deletion fails', function () {
      var errorResponse = {
        data: 'Not Found',
        status: 404,
        statusText: 'Not Found',
      };
      expect(aaModel.ceInfos.length).toBe(2);
      spyOn(AACommonService, 'isRestApiToggle').and.returnValue(true);
      controller.deleteFeature();
      featDefer.reject(errorResponse);
      $scope.$apply();
      $timeout.flush();
      expect(DoRestService.deleteDoRest).toHaveBeenCalled();
      expect(aaModel.ceInfos.length).toBe(2);
      expect(Notification.error).toHaveBeenCalledWith(jasmine.any(String));
      expect(AutoAttendantCeInfoModelService.deleteCeInfo).not.toHaveBeenCalled();
      expect($rootScope.$broadcast).not.toHaveBeenCalledWith('HURON_FEATURE_DELETED');
    });

    it('should produce an error notification when auto attendant deletion fails while deleting a REST block', function () {
      var errorResponse = {
        data: 'Not Found',
        status: 404,
        statusText: 'Not Found',
      };
      expect(aaModel.ceInfos.length).toBe(2);
      spyOn(AACommonService, 'isRestApiToggle').and.returnValue(true);
      DoRestService.deleteDoRest.and.returnValue($q.reject({
        statusText: 'Server Error',
        status: 500,
      }));
      controller.deleteFeature();
      featDefer.reject(errorResponse);
      $scope.$apply();
      $timeout.flush();
      expect(DoRestService.deleteDoRest).toHaveBeenCalled();
      expect(aaModel.ceInfos.length).toBe(2);
      expect(Notification.error).toHaveBeenCalledWith(jasmine.any(String));
      expect(AutoAttendantCeInfoModelService.deleteCeInfo).not.toHaveBeenCalled();
      expect($rootScope.$broadcast).not.toHaveBeenCalledWith('HURON_FEATURE_DELETED');
    });

    it('should produce a error notification if feature id for auto attendant delete is invalid', function () {
      $scope.vm.featureId = 'invalid-aa-id';
      expect(aaModel.ceInfos.length).toBe(2);
      spyOn(AACommonService, 'isRestApiToggle').and.returnValue(true);
      controller.deleteFeature();
      $scope.$apply();
      $timeout.flush();
      expect(DoRestService.deleteDoRest).not.toHaveBeenCalled();
      expect(aaModel.ceInfos.length).toBe(2);
      expect(Notification.error).toHaveBeenCalledWith('huronFeatureDetails.deleteFailedText');
      expect(AutoAttendantCeInfoModelService.deleteCeInfo).not.toHaveBeenCalled();
      expect($rootScope.$broadcast).not.toHaveBeenCalledWith('HURON_FEATURE_DELETED');
    });
  });
});

describe('Huron Feature DeleteCtrl for HuntGroup', function () {
  var featureDeleteCtrl, rootScope, $scope, $stateParams, $q, $timeout, $translate, huntGroupService, autoAttendantCeService, Notification, Log, featureDelDeferred;
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

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', spiedAuthinfo);
  }));

  beforeEach(inject(function (_$rootScope_, $controller, _$timeout_, _$translate_, _$q_, Authinfo, _HuntGroupService_, _AutoAttendantCeService_, _Notification_, _Log_) {
    rootScope = _$rootScope_;
    $scope = rootScope.$new();
    $q = _$q_;
    $translate = _$translate_;
    $timeout = _$timeout_;
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
      deleteFeatureType: 'HG',
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
      Notification: Notification,
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
      featureType: jasmine.any(String),
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

describe('Huron Feature DeleteCtrl for PagingGroup', function () {
  var featureDeleteCtrl, rootScope, $scope, $stateParams, $q, $timeout, $translate, pagingGroupService, Notification, Log, featureDelDeferred;
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

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', spiedAuthinfo);
  }));

  beforeEach(inject(function (_$rootScope_, $controller, _$timeout_, _$translate_, _$q_, Authinfo, _PagingGroupService_, _Notification_, _Log_) {
    rootScope = _$rootScope_;
    $scope = rootScope.$new();
    $q = _$q_;
    $translate = _$translate_;
    $timeout = _$timeout_;
    pagingGroupService = _PagingGroupService_;
    Notification = _Notification_;
    Log = _Log_;

    featureDelDeferred = $q.defer();
    spyOn(pagingGroupService, 'deletePagingGroup').and.returnValue(featureDelDeferred.promise);
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');
    spyOn(rootScope, '$broadcast').and.callThrough();

    $stateParams = {
      deleteFeatureId: 'aaaa',
      deleteFeatureName: 'aaaa',
      deleteFeatureType: 'PG',
    };

    featureDeleteCtrl = $controller('HuronFeatureDeleteCtrl', {
      $rootScope: rootScope,
      $scope: $scope,
      $stateParams: $stateParams,
      $timeout: $timeout,
      $translate: $translate,
      Authinfo: Authinfo,
      PagingGroupService: pagingGroupService,
      Log: Log,
      Notification: Notification,
    });
  }));

  it('should broadcast HURON_FEATURE_DELETED event when paging group is deleted successfully', function () {
    featureDeleteCtrl.deleteFeature();
    featureDelDeferred.resolve(successResponse);
    $scope.$apply();
    $timeout.flush();
    expect(rootScope.$broadcast).toHaveBeenCalledWith('HURON_FEATURE_DELETED');
  });

  it('should give a successful notification when paging group is deleted successfully', function () {
    featureDeleteCtrl.deleteFeature();
    featureDelDeferred.resolve(successResponse);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
      featureName: $stateParams.deleteFeatureName,
      featureType: jasmine.any(String),
    });
  });

  it('should give the an error notification when paging group deletion fails', function () {
    featureDeleteCtrl.deleteFeature();
    featureDelDeferred.reject(failureResponse);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.error).toHaveBeenCalledWith(jasmine.any(String));
  });
});

describe('Huron Feature DeleteCtrl for PickupGroup', function () {
  var featureDeleteCtrl, rootScope, $scope, $stateParams, $q, $timeout, $translate, pickupGroupService, Notification, Log, featureDelDeferred;
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

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', spiedAuthinfo);
  }));

  beforeEach(inject(function (_$rootScope_, $controller, _$timeout_, _$translate_, _$q_, Authinfo, _CallPickupGroupService_, _Notification_, _Log_) {
    rootScope = _$rootScope_;
    $scope = rootScope.$new();
    $q = _$q_;
    $translate = _$translate_;
    $timeout = _$timeout_;
    pickupGroupService = _CallPickupGroupService_;
    Notification = _Notification_;
    Log = _Log_;

    featureDelDeferred = $q.defer();
    spyOn(pickupGroupService, 'deletePickupGroup').and.returnValue(featureDelDeferred.promise);
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');
    spyOn(rootScope, '$broadcast').and.callThrough();

    $stateParams = {
      deleteFeatureId: 'aaaa',
      deleteFeatureName: 'aaaa',
      deleteFeatureType: 'PI',
    };

    featureDeleteCtrl = $controller('HuronFeatureDeleteCtrl', {
      $rootScope: rootScope,
      $scope: $scope,
      $stateParams: $stateParams,
      $timeout: $timeout,
      $translate: $translate,
      Authinfo: Authinfo,
      CallPickupGroupService: pickupGroupService,
      Log: Log,
      Notification: Notification,
    });
  }));

  it('should broadcast HURON_FEATURE_DELETED event when pickup group is deleted successfully', function () {
    featureDeleteCtrl.deleteFeature();
    featureDelDeferred.resolve(successResponse);
    $scope.$apply();
    $timeout.flush();
    expect(rootScope.$broadcast).toHaveBeenCalledWith('HURON_FEATURE_DELETED');
  });

  it('should give a successful notification when pickup group is deleted successfully', function () {
    featureDeleteCtrl.deleteFeature();
    featureDelDeferred.resolve(successResponse);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
      featureName: $stateParams.deleteFeatureName,
      featureType: jasmine.any(String),
    });
  });

  it('should give the an error notification when pickup group deletion fails', function () {
    featureDeleteCtrl.deleteFeature();
    featureDelDeferred.reject(failureResponse);
    $scope.$apply();
    $timeout.flush();
    expect(Notification.error).toHaveBeenCalledWith(jasmine.any(String));
  });
});
