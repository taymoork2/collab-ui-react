'use strict';

describe('Service: AAModelService', function () {
  var AAModelService;

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

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
});
