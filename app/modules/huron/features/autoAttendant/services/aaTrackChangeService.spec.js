'use strict';

describe('Service: AATrackChangeService', function () {

  var AATrackChangeService;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(inject(function (_AATrackChangeService_) {
    AATrackChangeService = _AATrackChangeService_;
  }));

  describe('isChanged', function () {
    it('should track registered key-value pair', function () {
      AATrackChangeService.track('aaName', 'AA');
      expect(AATrackChangeService.isChanged('aaName', 'AA')).toBe(false);
      expect(AATrackChangeService.isChanged('aaName', 'AA2')).toBe(true);
    });

    it('should return true for unregistered key/value pair', function () {
      expect(AATrackChangeService.isChanged('aaName', 'AA3')).toBe(true);
    });
  });

});
