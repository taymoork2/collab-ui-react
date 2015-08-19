'use strict';

describe('Service: AAUiModelService', function () {
  var AAUiModelService;

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_AAUiModelService_) {
    AAUiModelService = _AAUiModelService_;
  }));

  afterEach(function () {

  });

  describe('getCeMenus', function () {
    it('should return the same model object that was set earlier using setAAUiModel', function () {
      var aaUiModel = {};
      AAUiModelService.setCeMenus('openhour', aaUiModel);
      aaUiModel.ui = {};
      var aaUiModel2 = AAUiModelService.getCeMenus('openhour');
      expect(angular.isDefined(aaUiModel2.ui)).toEqual(true);
    });
  });

  describe('getCeInfo', function () {
    it('should return the same model object that was set earlier using setCeInfo', function () {
      var aaUiModel = {};
      AAUiModelService.setCeInfo(aaUiModel);
      aaUiModel.ui = {};
      var aaUiModel2 = AAUiModelService.getCeInfo();
      expect(angular.isDefined(aaUiModel2.ui)).toEqual(true);
    });
  });
});
