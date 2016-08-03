'use strict';

describe('Service: AAMetricNameService', function () {

  var AAMetricNameService;
  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_AAMetricNameService_) {
    AAMetricNameService = _AAMetricNameService_;
  }));

  describe('CREATE_AA', function () {
    it('should return event name', function () {
      expect(AAMetricNameService.CREATE_AA).toEqual('aa.createAA');
    });
  });

  describe('TIMEOUT_PHONE_MENU', function () {
    it('should return event name', function () {
      expect(AAMetricNameService.TIMEOUT_PHONE_MENU).toEqual('aa.timeout.phoneMenu');
    });
  });

  describe('TIMEOUT_DIAL_BY_EXT', function () {
    it('should return event name', function () {
      expect(AAMetricNameService.TIMEOUT_DIAL_BY_EXT).toEqual('aa.timeout.dialByExt');
    });
  });

});
