'use strict';

describe('Service: AAMediaUploadService', function () {
  var AACtrlResourcesService;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_AACtrlResourcesService_) {
    AACtrlResourcesService = _AACtrlResourcesService_;
  }));

  afterEach(function () {

  });

  describe('getCtrlToResourceMap', function () {

    it('should get the resource map', function () {
      expect(AACtrlResourcesService.getCtrlToResourceMap()).toEqual({});
    });
  });

  describe('getCtrlKeys', function () {
    it('should get the keys from the ctrl resource map', function () {
      expect(AACtrlResourcesService.getCtrlKeys()).toEqual([]);
    });
  });
});
