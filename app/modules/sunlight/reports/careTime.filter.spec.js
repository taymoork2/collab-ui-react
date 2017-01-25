'use strict';

describe('Filter: careTime', function () {
  beforeEach(function () {
    angular.mock.module('Sunlight');
  });

  it('should convert milliseconds to time', inject(function ($filter) {
    expect($filter('careTime')).not.toBeNull();
    var careTime = $filter('careTime');
    expect(careTime(0)).toEqual('-');
    expect(careTime("hello")).toEqual('-');
    expect(careTime(14890801)).toEqual('4h 8m 10s');
  }));
});
