'use strict';

describe('Service: PlaceFilter', function () {
  beforeEach(angular.mock.module('Squared'));

  var PlaceFilter;

  beforeEach(inject(function (_PlaceFilter_) {
    PlaceFilter = _PlaceFilter_;
  }));

  it('should return a list of filters', function () {
    expect(PlaceFilter.getFilters().length).toBe(2);
  });

  it('should return a list of filters with correct count', function () {
    PlaceFilter.getFilteredList([{
      devices: [{}]
    }, {
      devices: [{}]
    }, {
      devices: []
    }]);
    var filters = PlaceFilter.getFilters();

    expect(_.find(filters, {
      filterValue: 'all'
    }).count).toBe(3);
    expect(_.find(filters, {
      filterValue: 'devices'
    }).count).toBe(2);
  });

  it('should filter all but all when search filter is set', function () {
    PlaceFilter.setCurrentSearch('yolo');
    PlaceFilter.getFilteredList([{
      devices: [{}]
    }, {
      devices: [{}]
    }, {
      devices: []
    }]);
    var filters = PlaceFilter.getFilters();

    expect(_.find(filters, {
      filterValue: 'all'
    }).count).toBe(0);
    expect(_.find(filters, {
      filterValue: 'devices'
    }).count).toBe(0);
  });

  describe('get filtered list', function () {

    it('should return all when no filter', function () {
      var arr = [{}, {}];
      expect(PlaceFilter.getFilteredList(arr).length).toBe(2);
    });

    it('should search on display name', function () {
      var arr = [{
        displayName: 'xfoox'
      }, {}];

      PlaceFilter.setCurrentSearch('foo');

      expect(PlaceFilter.getFilteredList(arr).length).toBe(1);
      expect(PlaceFilter.getFilteredList(arr)[0].displayName).toBe('xfoox');
    });

    it('should search on type', function () {
      var arr = [{
        readableType: 'xfoox'
      }, {}];

      PlaceFilter.setCurrentSearch('foo');

      expect(PlaceFilter.getFilteredList(arr).length).toBe(1);
      expect(PlaceFilter.getFilteredList(arr)[0].readableType).toBe('xfoox');
    });

    it('should search on SIP uri', function () {
      var arr = [{
        sipUrl: "xfoox"
      }, {}];

      PlaceFilter.setCurrentSearch('foo');

      expect(PlaceFilter.getFilteredList(arr).length).toBe(1);
      expect(PlaceFilter.getFilteredList(arr)[0].sipUrl).toBe('xfoox');
    });

    it('should search on multiple terms', function () {
      var arr = [{
        displayName: 'xfoox',
        readableType: 'xbarx'
      }, {
        displayName: 'xfoox'
      }];

      PlaceFilter.setCurrentSearch('foo,bar');

      expect(PlaceFilter.getFilteredList(arr).length).toBe(1);
      expect(PlaceFilter.getFilteredList(arr)[0].displayName).toBe('xfoox');
      expect(PlaceFilter.getFilteredList(arr)[0].readableType).toBe('xbarx');

      PlaceFilter.setCurrentSearch('foo bar');

      expect(PlaceFilter.getFilteredList(arr).length).toBe(1);
      expect(PlaceFilter.getFilteredList(arr)[0].displayName).toBe('xfoox');
      expect(PlaceFilter.getFilteredList(arr)[0].readableType).toBe('xbarx');

      PlaceFilter.setCurrentSearch('foo, bar');

      expect(PlaceFilter.getFilteredList(arr).length).toBe(1);
      expect(PlaceFilter.getFilteredList(arr)[0].displayName).toBe('xfoox');
      expect(PlaceFilter.getFilteredList(arr)[0].readableType).toBe('xbarx');
    });

    it('should return all when all filter', function () {
      var arr = [{}, {}];
      PlaceFilter.setCurrentFilter('all');
      expect(PlaceFilter.getFilteredList(arr).length).toBe(2);
    });

  });

});
