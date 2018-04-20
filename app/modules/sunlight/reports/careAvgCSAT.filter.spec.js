'use strict';

describe('Average CSAT filter', function () {
  beforeEach(function () {
    angular.mock.module('Sunlight');
  });

  it('should convert milliseconds to time', inject(function ($filter) {
    var avgCSAT = $filter('careAvgCSAT');
    expect(avgCSAT(0 / 0)).toEqual('-');
    expect(avgCSAT(0)).toEqual('-');
    expect(avgCSAT(23.456)).toEqual(23.46);
  }));
});
