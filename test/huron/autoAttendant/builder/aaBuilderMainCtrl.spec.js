'use strict';

describe('Controller: AABuilderMainCtrl', function () {
  var controller, Notification, AutoAttendantCeService;
  var AAModelService, AutoAttendantCeInfoModelService;
  var $rootScope, $scope, $q, $translate, $stateParams;

  var ces = getJSONFixture('huron/json/autoAttendant/callExperiences.json');
  var cesWithNumber = getJSONFixture('huron/json/autoAttendant/callExperiencesWithNumber.json');
  var aCe = getJSONFixture('huron/json/autoAttendant/aCallExperience.json');
  var rawCeInfo = {
    "callExperienceName": "AAA2",
    "callExperienceURL": "https://ces.hitest.huron-dev.com/api/v1/customers/6662df48-b367-4c1e-9c3c-aa408aaa79a1/callExperiences/c16a6027-caef-4429-b3af-9d61ddc7964b",
    "assignedResources": [{
      "id": "00097a86-45ef-44a7-aa78-6d32a0ca1d3b",
      "type": "directoryNumber",
      "trigger": "incomingCall"
    }]
  };

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

  beforeEach(inject(function (_$rootScope_, _$q_, _$stateParams_, $controller, _$translate_, _Notification_,
    _AutoAttendantCeInfoModelService_, _AAModelService_, _AutoAttendantCeService_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    $scope = $rootScope;
    $scope.$dismiss = function () {
      return true;
    };
    $translate = _$translate_;
    $stateParams = _$stateParams_;
    AAModelService = _AAModelService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    Notification = _Notification_;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);

    controller = $controller('AABuilderMainCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }));

  afterEach(function () {

  });

  describe('saveAARecords', function () {

    beforeEach(function () {
      spyOn(AutoAttendantCeService, 'createCe').and.returnValue($q.when(angular.copy(rawCeInfo)));
      spyOn(AutoAttendantCeService, 'updateCe').and.returnValue($q.when(angular.copy(rawCeInfo)));
      spyOn(Notification, 'success');

      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
      aaModel.aaRecord = aCe;
    });

    it('should save a new aaRecord successfully', function () {
      controller.saveAARecords();
      $scope.$apply();

      expect(AutoAttendantCeService.createCe).toHaveBeenCalled();

      // check that aaRecord is saved successfully into model
      expect(angular.equals(aaModel.aaRecords[0], rawCeInfo)).toEqual(true);

      // check that ceInfos is updated successfully too because it is required on the landing page
      var ceInfo = ce2CeInfo(rawCeInfo);
      expect(angular.equals(aaModel.ceInfos[0], ceInfo)).toEqual(true);

      expect(Notification.success).toHaveBeenCalled();
    });

    it('should update an existing aaRecord successfully', function () {
      aaModel.aaRecords.push(rawCeInfo);

      controller.saveAARecords();
      $scope.$apply();

      expect(AutoAttendantCeService.updateCe).toHaveBeenCalled();

      // check that aaRecord is saved successfully into model
      expect(angular.equals(aaModel.aaRecords[0], rawCeInfo)).toEqual(true);

      // check that ceInfos is updated successfully too because it is required on the landing page
      var ceInfo = ce2CeInfo(rawCeInfo);
      expect(angular.equals(aaModel.ceInfos[0], ceInfo)).toEqual(true);

      expect(Notification.success).toHaveBeenCalled();
    });
  });
});
