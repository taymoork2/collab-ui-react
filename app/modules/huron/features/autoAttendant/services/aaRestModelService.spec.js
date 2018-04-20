// TODO: convert this file to TypeScript

'use strict';

describe('Service: AARestModelService', function () {
  var AARestModelService;
  var restBlocks = {};
  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(inject(function (_AARestModelService_) {
    AARestModelService = _AARestModelService_;
    restBlocks = {
      Temp_1: {
        method: 'GET',
        url: 'test URL1',
        responseActions: [{
          assignVar: {
            variableName: 'test var1',
            value: 'res',
          },
        }],
      },
      Temp_2: {
        method: 'GET',
        url: 'test URL2',
        responseActions: [{
          assignVar: {
            variableName: 'test var2',
            value: 'res',
          },
        }],
      },
    };
  }));

  afterEach(function () {
    AARestModelService = restBlocks = undefined;
  });

  describe('getRestBlocks', function () {
    it('should return the same CE REST object that was set earlier using setRestBlocks', function () {
      AARestModelService.setRestBlocks(restBlocks);
      var restBlockAfterGet = AARestModelService.getRestBlocks();
      expect(!_.isUndefined(restBlockAfterGet)).toBe(true);
      expect(restBlockAfterGet.Temp_1.url).toBe('test URL1');
      expect(restBlockAfterGet.Temp_2.url).toBe('test URL2');
    });
  });

  describe('getUiRestBlocks', function () {
    it('should return the same UI REST model object that was set earlier using setUiRestBlocks', function () {
      AARestModelService.setUiRestBlocks(restBlocks);
      var restBlockAfterGet = AARestModelService.getUiRestBlocks();
      expect(!_.isUndefined(restBlockAfterGet)).toBe(true);
      expect(restBlockAfterGet.Temp_1.url).toBe('test URL1');
      expect(restBlockAfterGet.Temp_2.url).toBe('test URL2');
    });
  });
});
