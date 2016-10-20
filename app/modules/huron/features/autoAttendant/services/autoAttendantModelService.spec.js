'use strict';

describe('Service: AAModelService', function () {
  var AAModelService;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_AAModelService_) {
    AAModelService = _AAModelService_;
  }));

  afterEach(function () {

  });

  describe('getAAModel', function () {
    it('should return the same model object that was set earlier using setAAModel', function () {
      var aaModel = {};
      aaModel.ui = {};
      AAModelService.setAAModel(aaModel);
      var aaModel2 = AAModelService.getAAModel();
      expect(angular.isDefined(aaModel2.ui)).toEqual(true);
    });
  });

  describe('newAARecord', function () {
    it('should return an AARecord object', function () {
      var _aaRecord = AAModelService.newAARecord();
      expect(_aaRecord.callExperienceName).toBe("");
      expect(_aaRecord.assignedResources.length).toBe(0);
      expect(_aaRecord.actionSets.length).toBe(1);
      expect(_aaRecord.actionSets[0].actions.length).toBe(0);
      expect(_aaRecord.actionSets[0].name).toBe("regularOpenActions");
    });
  });

  describe('newAAModel', function () {
    it('should return an AAModel object', function () {
      var _aaModel = AAModelService.newAAModel();
      expect(_aaModel.aaRecord.constructor.name).toBe('AARecord');
      expect(_aaModel.aaRecords.length).toBe(0);
    });
  });
});
