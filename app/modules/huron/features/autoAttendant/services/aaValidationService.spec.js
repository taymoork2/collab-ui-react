'use strict';

describe('Service: AAValidationService', function () {
  var Notification, AAModelService, AutoAttendantCeInfoModelService, AAValidationService;

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

  beforeEach(inject(function (_Notification_, _AutoAttendantCeInfoModelService_, _AAModelService_, _AAValidationService_) {
    AAModelService = _AAModelService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AAValidationService = _AAValidationService_;
    Notification = _Notification_;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
  }));

  afterEach(function () {

  });

  describe('isNameValidationSuccess', function () {

    beforeEach(function () {
      spyOn(Notification, 'error');
      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
    });

    it('report name validation error for an empty string', function () {
      // when aaModel.aaRecord is defined
      var ceInfo_name = '';
      var uuid = '';
      var valid = AAValidationService.isNameValidationSuccess(ceInfo_name, uuid);

      expect(valid).toEqual(false);
      expect(Notification.error).toHaveBeenCalled();
    });

    it('report name validation error for a string of spaces', function () {
      var ceInfo_name = '   ';
      var uuid = '';
      var valid = AAValidationService.isNameValidationSuccess(ceInfo_name, uuid);

      expect(valid).toEqual(false);
      expect(Notification.error).toHaveBeenCalled();
    });

    it('should report name validation error if new AA name is not unique', function () {
      var ceInfo = ce2CeInfo(rawCeInfo);
      aaModel.ceInfos.push(ceInfo);

      var ceInfo_name = 'AAA2';
      var uuid = 'c16a6027-caef-4429-b3af-9d61ddc7964c';
      var valid = AAValidationService.isNameValidationSuccess(ceInfo_name, uuid);

      expect(valid).toEqual(false);
      expect(Notification.error).toHaveBeenCalled();
    });

    it('should report name validation success if new AA name is unique', function () {
      var ceInfo = ce2CeInfo(rawCeInfo);
      aaModel.ceInfos.push(ceInfo);

      var ceInfo_name = "AAA3";
      var uuid = 'c16a6027-caef-4429-b3af-9d61ddc7964c';
      var valid = AAValidationService.isNameValidationSuccess(ceInfo_name, uuid);

      expect(valid).toEqual(true);
    });
  });
});
