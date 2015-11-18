'use strict';

describe('Service: AutoAttendantCeInfoModelService', function () {
  var AutoAttendantCeInfoModelService;
  // require('jasmine-collection-matchers');

  var callExperienceInfos = getJSONFixture('huron/json/autoAttendant/callExperiencesWithNumber.json');
  var ceInfos = [];
  var rawCeInfos = [{
    "name": "Oleg's Call Experience 1",
    "resources": [{
      "id": "1111", //"212b075f-0a54-4040-bd94-d2aa247bd9f9", //workaround Tropo-AA integration
      "trigger": "incomingCall",
      "type": "directoryNumber",
      "number": "1111"
    }],
    "ceUrl": "https://ces.hitest.huron-dev.com/api/v1/customers/6662df48-b367-4c1e-9c3c-aa408aaa79a1/callExperiences/c16a6027-caef-4429-b3af-9d61ddc7964b"
  }, {
    "name": "AA2",
    "resources": [{
      "id": "1112", //"00097a86-45ef-44a7-aa78-6d32a0ca1d3b", //workaround Tropo-AA integration
      "trigger": "incomingCall",
      "type": "directoryNumber",
      "number": "1112"
    }],
    "ceUrl": "https://ces.hitest.huron-dev.com/api/v1/customers/6662df48-b367-4c1e-9c3c-aa408aaa79a1/callExperiences/0c192613-a960-43bb-9101-b9bc80be049c"
  }];

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_AutoAttendantCeInfoModelService_) {
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;

    for (var i = 0; i < rawCeInfos.length; i++) {
      var _ceInfo = AutoAttendantCeInfoModelService.newCeInfo();
      for (var j = 0; j < rawCeInfos[i].resources.length; j++) {
        var _resource = AutoAttendantCeInfoModelService.newResource();
        _resource.setId(rawCeInfos[i].resources[j].id);
        _resource.setTrigger(rawCeInfos[i].resources[j].trigger);
        _resource.setType(rawCeInfos[i].resources[j].type);
        _resource.setNumber(rawCeInfos[i].resources[j].number);
        _ceInfo.addResource(_resource);
      }
      _ceInfo.setName(rawCeInfos[i].name);
      _ceInfo.setCeUrl(rawCeInfos[i].ceUrl);
      ceInfos[i] = _ceInfo;
    }
  }));

  afterEach(function () {

  });

  describe('newCeInfo/newResource', function () {
    it('should return ceInfos from given callExperienceInfos', function () {
      for (var i = 0; i < ceInfos.length; i++) {
        expect(ceInfos[i].getName()).toBe(rawCeInfos[i].name);
        var resources = ceInfos[i].getResources();
        for (var j = 0; j < resources.length; j++) {
          expect(resources[j].getId()).toBe(rawCeInfos[i].resources[j].id);
          expect(resources[j].getTrigger()).toBe(rawCeInfos[i].resources[j].trigger);
          expect(resources[j].getType()).toBe(rawCeInfos[i].resources[j].type);
          expect(resources[j].getNumber()).toBe(rawCeInfos[i].resources[j].number);
        }
        expect(ceInfos[i].getCeUrl()).toBe(rawCeInfos[i].ceUrl);
      }
    });
  });

  describe('getAllCeInfos', function () {
    it('should return ceInfos from the given callExperienceInfos', function () {
      var _ceInfos = AutoAttendantCeInfoModelService.getAllCeInfos(callExperienceInfos);
      expect(angular.equals(_ceInfos, ceInfos)).toBe(true);
    });
  });

  describe('getCeInfo', function () {
    it('should return ceInfo from the given callExperience', function () {
      var _ceInfo = AutoAttendantCeInfoModelService.getCeInfo(callExperienceInfos[0]);
      expect(angular.equals(_ceInfo, ceInfos[0])).toBe(true);
    });
  });

  describe('setCeInfo', function () {
    it('should update the content of aaRecord with the given ceInfo', function () {
      var aaRecord = {};
      AutoAttendantCeInfoModelService.setCeInfo(aaRecord, ceInfos[0]);

      expect(angular.equals(aaRecord.callExperienceName, callExperienceInfos[0].callExperienceName)).toBe(true);
      expect(angular.equals(aaRecord.assignedResources, callExperienceInfos[0].assignedResources)).toBe(true);
    });
  });

  describe('deleteCeInfo', function () {
    it('should delete the associated aaResourceRecord in aaResourceRecords for the given ceInfo', function () {
      var aaResourceRecords = angular.copy(callExperienceInfos);
      var length = aaResourceRecords.length;
      AutoAttendantCeInfoModelService.deleteCeInfo(aaResourceRecords, ceInfos[0]);
      expect(aaResourceRecords.length + 1).toBe(length);
    });
  });

});
