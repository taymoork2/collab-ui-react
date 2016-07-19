'use strict';

describe('Service: AutoAttendantCeInfoModelService', function () {
  var AutoAttendantCeInfoModelService, AutoAttendantCeService, AACeDependenciesService, AAModelService;
  var $rootScope, $scope, $q, $timeout;
  // require('jasmine-collection-matchers');

  var callExperienceInfos = getJSONFixture('huron/json/autoAttendant/callExperiencesWithNumber.json');
  var depends = getJSONFixture('huron/json/autoAttendant/dependencies.json');
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
  beforeEach(module('Sunlight'));

  beforeEach(inject(function (_AutoAttendantCeInfoModelService_, _AutoAttendantCeService_, _AACeDependenciesService_, _AAModelService_, _$rootScope_, _$q_, _$timeout_) {
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    AACeDependenciesService = _AACeDependenciesService_;
    AAModelService = _AAModelService_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $q = _$q_;
    $timeout = _$timeout_;

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

  describe('getCeInfosList', function () {
    var notFoundResponse = {
      'status': 404,
      'statusText': 'Not Found'
    };

    var errorResponse = {
      'status': 500,
      'statusText': 'Server Error'
    };
    var aaModel, listCesDeferred, readCeDependsDeferred;

    beforeEach(inject(function () {
      // setup the promises
      listCesDeferred = $q.defer();
      readCeDependsDeferred = $q.defer();
      spyOn(AutoAttendantCeService, 'listCes').and.returnValue(listCesDeferred.promise);
      spyOn(AACeDependenciesService, 'readCeDependencies').and.returnValue(readCeDependsDeferred.promise);
      spyOn(AAModelService, 'setAAModel');

      // setup aaModel for test
      aaModel = undefined;
      AutoAttendantCeInfoModelService.getCeInfosList().then(function (value) {
        aaModel = value;
      });
    }));

    it('should set aaModel after resolve of ceInfos and depends', function () {
      // verify listCes already called with test setup
      expect(aaModel).toBeUndefined();
      expect(AutoAttendantCeService.listCes).toHaveBeenCalled();
      expect(AACeDependenciesService.readCeDependencies).not.toHaveBeenCalled();

      // resolve listCes
      listCesDeferred.resolve(callExperienceInfos);
      $scope.$apply();
      $timeout.flush();

      // verify depends called
      expect(AACeDependenciesService.readCeDependencies).toHaveBeenCalled();
      expect(aaModel).toBeUndefined();

      // now resolve depends
      readCeDependsDeferred.resolve(depends);
      $scope.$apply();
      $timeout.flush();
      expect(AAModelService.setAAModel).toHaveBeenCalled();

      // verify data returned
      expect(aaModel).toBeDefined();
      expect(aaModel.ceInfos.length).toEqual(2);
      expect(aaModel.ceInfos).toEqual(ceInfos);
      expect(aaModel.dependsIds.length).toEqual(1);
    });

    it('should set empty aaModel upon 404 for ceInfos', function () {
      // verify listCes already called with test setup
      expect(aaModel).toBeUndefined();
      expect(AutoAttendantCeService.listCes).toHaveBeenCalled();
      expect(AACeDependenciesService.readCeDependencies).not.toHaveBeenCalled();

      // reject ceInfos with 404
      listCesDeferred.reject(notFoundResponse);
      $scope.$apply();
      $timeout.flush();
      expect(AAModelService.setAAModel).toHaveBeenCalled();

      // verify depends not called
      expect(AACeDependenciesService.readCeDependencies).not.toHaveBeenCalled();

      // verify empty data returned
      expect(aaModel).toBeDefined();
      expect(aaModel.ceInfos.length).toEqual(0);
      expect(aaModel.dependsIds).toEqual({});
    });

    it('should set aaModel upon resolve of ceInfos then 404 for depends', function () {
      // verify listCes already called with test setup
      expect(aaModel).toBeUndefined();
      expect(AutoAttendantCeService.listCes).toHaveBeenCalled();
      expect(AACeDependenciesService.readCeDependencies).not.toHaveBeenCalled();

      // resolve listCes
      listCesDeferred.resolve(callExperienceInfos);
      $scope.$apply();
      $timeout.flush();

      // verify depends called
      expect(AACeDependenciesService.readCeDependencies).toHaveBeenCalled();
      expect(aaModel).toBeUndefined();

      // now resolve depends
      readCeDependsDeferred.reject(notFoundResponse);
      $scope.$apply();
      $timeout.flush();

      expect(AAModelService.setAAModel).toHaveBeenCalled();

      // verify data returned
      expect(aaModel).toBeDefined();
      expect(aaModel.ceInfos.length).toEqual(2);
      expect(aaModel.ceInfos).toEqual(ceInfos);
      expect(aaModel.dependsIds).toEqual({});
    });

    it('should return error upon error for ceInfos', function () {
      // verify listCes already called with test setup
      expect(aaModel).toBeUndefined();
      expect(AutoAttendantCeService.listCes).toHaveBeenCalled();
      expect(AACeDependenciesService.readCeDependencies).not.toHaveBeenCalled();

      listCesDeferred.reject(errorResponse);
      $scope.$apply();
      $timeout.flush();

      expect(AACeDependenciesService.readCeDependencies).not.toHaveBeenCalled();

      expect(AAModelService.setAAModel).toHaveBeenCalled();

      // verify data not returned
      expect(aaModel).toBeUndefined();
    });

    it('should return error upon resolve of ceInfos but then error for depends', function () {
      // verify listCes already called with test setup
      expect(aaModel).toBeUndefined();
      expect(AutoAttendantCeService.listCes).toHaveBeenCalled();
      expect(AACeDependenciesService.readCeDependencies).not.toHaveBeenCalled();

      // resolve listCes
      listCesDeferred.resolve(callExperienceInfos);
      $scope.$apply();
      $timeout.flush();

      // verify depends called
      expect(AACeDependenciesService.readCeDependencies).toHaveBeenCalled();
      expect(aaModel).toBeUndefined();

      // now reject depends
      readCeDependsDeferred.reject(errorResponse);
      $scope.$apply();
      $timeout.flush();

      expect(AAModelService.setAAModel).toHaveBeenCalled();

      // verify data is not returned
      expect(aaModel).toBeUndefined();
    });

  });
});
