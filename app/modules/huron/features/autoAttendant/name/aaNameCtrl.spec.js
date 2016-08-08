'use strict';

describe('Controller: aaBuilderNameCtrl', function () {
  var controller, AANotificationService, AutoAttendantCeService;
  var AAModelService, AutoAttendantCeInfoModelService;
  var $rootScope, $scope, $q;

  var ces = getJSONFixture('huron/json/autoAttendant/callExperiences.json');
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
  var rightArrow = 39;
  var testGroupName = 'test';

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

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$rootScope_, _$q_, $controller, _AANotificationService_,
    _AutoAttendantCeInfoModelService_, _AAModelService_, _AutoAttendantCeService_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    $scope = $rootScope;
    $scope.$dismiss = function () {
      return true;
    };

    AAModelService = _AAModelService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    AANotificationService = _AANotificationService_;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);

    spyOn(AutoAttendantCeService, 'listCes').and.returnValue($q.when(angular.copy(ces)));

    controller = $controller('aaBuilderNameCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }));

  afterEach(function () {

  });

  describe('saveAARecord', function () {

    beforeEach(function () {
      spyOn(AutoAttendantCeService, 'createCe').and.returnValue($q.when(angular.copy(rawCeInfo)));
      spyOn(AutoAttendantCeService, 'updateCe').and.returnValue($q.when(angular.copy(rawCeInfo)));
      spyOn(AANotificationService, 'error');
      spyOn(AANotificationService, 'success');
      spyOn(AutoAttendantCeInfoModelService, 'setCeInfo');
      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
      aaModel.aaRecord = aCe;

      controller.name = rawCeInfo.callExperienceName;
      controller.ui = {};
      controller.ui.ceInfo = ce2CeInfo(rawCeInfo);
      controller.ui.builder = {};
    });

    it("should save a new aaRecord successfully", function () {
      controller.name = testGroupName;
      controller.saveAARecord();
      expect(controller.ui.ceInfo.name).toEqual(testGroupName);
    });

    it("should save a new aaRecord successfully on right arrow press", function () {
      controller.name = testGroupName;
      controller.evalKeyPress(rightArrow);
      expect(controller.ui.ceInfo.name).toEqual(testGroupName);
    });

    /*  Commented out as code references AutoAttendant.saveAARecords()
     *
     *
    it('should save a new aaRecord successfully', function () {

      $stateParams.aaName = '';

      controller.saveAARecord();
      $scope.$apply();

      expect(AutoAttendantCeService.createCe).toHaveBeenCalled();

      // check that aaRecord is saved successfully into model
      // note we only care about name in this stage of stories
      expect(angular.equals(aaModel.aaRecords[0].callExperienceName, rawCeInfo.callExperienceName)).toEqual(true);

      // check that ceInfos is updated successfully too because it is required on the landing page
      // note we only care about name in this stage of stories
      var ceInfo = ce2CeInfo(rawCeInfo);
      expect(angular.equals(aaModel.ceInfos[0].getName(), ceInfo.getName())).toEqual(true);

      expect(Notification.success).toHaveBeenCalledWith('autoAttendant.successCreateCe');
    });

    *** */

    /*  Commented out as code references AutoAttendant.saveAARecords()
     *
     *

    it('should issue error message on failure to save', function () {

      saveCeSpy.and.returnValue(
        $q.reject({
          status: 500
        })
      );

      controller.saveAARecord();
      $scope.$apply();

      expect(Notification.error).toHaveBeenCalledWith('autoAttendant.errorCreateCe');
    });
    **** */
  });

  it("should test the next Button when name is null", function () {
    controller.name = '';
    expect(controller.nextButton()).toEqual(false);
  });

  it("should test the next Button when name is not null", function () {
    controller.name = testGroupName;
    expect(controller.nextButton()).toEqual(true);
  });

  it("should test the previous  Button", function () {
    controller.name = testGroupName;
    expect(controller.previousButton()).toEqual("hidden");
  });

});
