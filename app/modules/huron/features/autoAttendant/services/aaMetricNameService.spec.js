'use strict';

describe('Service: AAMetricNameService', function () {

  var AAMetricNameService;
  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_AAMetricNameService_) {
    AAMetricNameService = _AAMetricNameService_;
  }));

  describe('createAA', function () {
    it('should return event name', function () {
      expect(AAMetricNameService.CREATE_AA).toEqual('aa.create');
    });
  });

});
