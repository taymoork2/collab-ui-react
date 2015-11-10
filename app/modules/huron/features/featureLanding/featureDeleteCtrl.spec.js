'use strict';

describe('Controller: HuronFeatureDeleteCtrl', function () {
  var controller, Notification, AutoAttendantCeService, AutoAttendantCeInfoModelService, AAModelService, HuronFeatureDeleteCtrl, featDefer;
  var $rootScope, $scope, $stateParams, $q, $timeout, $translate;

  var cesWithNumber = getJSONFixture('huron/json/autoAttendant/callExperiencesWithNumber.json');
  var aaModel = {};

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

  beforeEach(inject(function (_$rootScope_, $controller, _$translate_, _$q_, _$timeout_, _Notification_, _AutoAttendantCeInfoModelService_, _AutoAttendantCeService_, _AAModelService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $q = _$q_;
    $translate = _$translate_;
    $timeout = _$timeout_;
    Notification = _Notification_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AAModelService = _AAModelService_;

    featDefer = $q.defer();
    spyOn(AutoAttendantCeService, 'deleteCe').and.returnValue(featDefer.promise);
    spyOn(AutoAttendantCeInfoModelService, 'deleteCeInfo');
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
      expect($rootScope.$broadcast).toHaveBeenCalledWith('HUNT_GROUP_DELETED');

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
      expect($rootScope.$broadcast).not.toHaveBeenCalledWith('HUNT_GROUP_DELETED');

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
      expect($rootScope.$broadcast).not.toHaveBeenCalledWith('HUNT_GROUP_DELETED');

    });
  });
});
