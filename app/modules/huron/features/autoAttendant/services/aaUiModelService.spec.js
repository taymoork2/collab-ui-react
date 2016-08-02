'use strict';

describe('Service: AAUiModelService', function () {
  var AAUiModelService;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_AAUiModelService_) {
    AAUiModelService = _AAUiModelService_;
  }));

  afterEach(function () {

  });

  describe('getUiModel', function () {
    it('should return the same object that was stored into the model', function () {
      AAUiModelService.initUiModel();
      var aaUiModel = AAUiModelService.getUiModel();
      aaUiModel.ui = {};
      var aaUiModel2 = AAUiModelService.getUiModel();
      expect(angular.isDefined(aaUiModel2.ui)).toEqual(true);
    });
  });
});
