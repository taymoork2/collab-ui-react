'use strict';

describe('Service: DeviceFilter', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var DeviceFilter;

  beforeEach(inject(function (_DeviceFilter_) {
    DeviceFilter = _DeviceFilter_;
  }));

  it('should return a list of filters', function () {
    expect(DeviceFilter.getFilters().length).toBe(6);
  });

  it('should return a list of filters with correct count', function () {
    DeviceFilter.getFilteredList([{
      isOnline: true
    }, {
      needsActivation: true
    }, {
      isOnline: true,
      hasIssues: true
    }, {
      isOnline: false,
      needsActivation: false
    }, {
      isUnused: true
    }]);
    var filters = DeviceFilter.getFilters();

    expect(_.find(filters, {
      filterValue: 'all'
    }).count).toBe(5);
    expect(_.find(filters, {
      filterValue: 'codes'
    }).count).toBe(1);
    expect(_.find(filters, {
      filterValue: 'issues'
    }).count).toBe(1);
    expect(_.find(filters, {
      filterValue: 'online'
    }).count).toBe(2);
    expect(_.find(filters, {
      filterValue: 'offline'
    }).count).toBe(1);
    expect(_.find(filters, {
      filterValue: 'inactive'
    }).count).toBe(1);
  });

  it('should filter all but all when search filter is set', function () {
    DeviceFilter.setCurrentSearch('yolo');
    DeviceFilter.getFilteredList([{
      isOnline: true
    }, {
      needsActivation: false
    }, {
      hasIssues: true,
      isOnline: true
    }, {
      isOnline: false,
      needsActivation: false
    }, {
      isUnused: true
    }]);
    var filters = DeviceFilter.getFilters();

    expect(_.find(filters, {
      filterValue: 'all'
    }).count).toBe(0);
    expect(_.find(filters, {
      filterValue: 'codes'
    }).count).toBe(0);
    expect(_.find(filters, {
      filterValue: 'issues'
    }).count).toBe(0);
    expect(_.find(filters, {
      filterValue: 'online'
    }).count).toBe(0);
    expect(_.find(filters, {
      filterValue: 'offline'
    }).count).toBe(0);
    expect(_.find(filters, {
      filterValue: 'inactive'
    }).count).toBe(0);
  });

  describe('get filtered list', function () {

    it('should return all when no filter', function () {
      var arr = [{}, {}];
      expect(DeviceFilter.getFilteredList(arr).length).toBe(2);
    });

    it('should search on display name', function () {
      var arr = [{
        displayName: 'xfoox'
      }, {}];

      DeviceFilter.setCurrentSearch('foo');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
      expect(DeviceFilter.getFilteredList(arr)[0].displayName).toBe('xfoox');
    });

    it('should return all when all filter', function () {
      var arr = [{}, {}];
      DeviceFilter.setCurrentFilter('all');
      expect(DeviceFilter.getFilteredList(arr).length).toBe(2);
    });

    it('should filter activation codes', function () {
      var arr = [{
        needsActivation: true
      }, {}];

      DeviceFilter.setCurrentFilter('codes');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
    });

    it('should filter online devices', function () {
      var arr = [{
        isOnline: true
      }, {}];

      DeviceFilter.setCurrentFilter('online');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
    });

    it('should filter offline devices', function () {
      var arr = [{
        isOnline: false,
        needsActivation: false
      }, {
        isOnline: true
      }];

      DeviceFilter.setCurrentFilter('offline');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
    });

    it('activation codes are not offline', function () {
      var arr = [{
        isOnline: false,
        needsActivation: true
      }];

      DeviceFilter.setCurrentFilter('offline');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(0);
    });

    it('should filter devices in error', function () {
      var arr = [{
        hasIssues: true
      }, {}];

      DeviceFilter.setCurrentFilter('issues');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
    });

  });

});
