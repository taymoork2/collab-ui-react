'use strict';

describe('Service: DeviceFilter', function () {
  beforeEach(angular.mock.module('Squared'));

  var DeviceFilter;

  beforeEach(inject(function (_DeviceFilter_) {
    DeviceFilter = _DeviceFilter_;
  }));

  it('should return a list of filters', function () {
    expect(DeviceFilter.getFilters().length).toBe(5);
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

    it('should search on product', function () {
      var arr = [{
        product: 'xfoox'
      }, {}];

      DeviceFilter.setCurrentSearch('foo');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
      expect(DeviceFilter.getFilteredList(arr)[0].product).toBe('xfoox');
    });

    it('should search on status', function () {
      var arr = [{
        state: {
          readableState: 'xfoox'
        }
      }, {}];

      DeviceFilter.setCurrentSearch('foo');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
      expect(DeviceFilter.getFilteredList(arr)[0].state.readableState).toBe('xfoox');
    });

    it('should search on ip', function () {
      var arr = [{
        ip: '192.168.0.5'
      }, {}];

      DeviceFilter.setCurrentSearch('168');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
      expect(DeviceFilter.getFilteredList(arr)[0].ip).toBe('192.168.0.5');
    });

    it('should search on mac', function () {
      var arr = [{
        mac: '1A:2B:3C:4D:5E:6F'
      }, {}];

      DeviceFilter.setCurrentSearch('2B:3C');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
      expect(DeviceFilter.getFilteredList(arr)[0].mac).toBe('1A:2B:3C:4D:5E:6F');
    });

    it('should search on mac without colon', function () {
      var arr = [{
        mac: '1A:2B:3C:4D:5E:6F'
      }, {}];

      DeviceFilter.setCurrentSearch('2B3C4D');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
      expect(DeviceFilter.getFilteredList(arr)[0].mac).toBe('1A:2B:3C:4D:5E:6F');
    });

    it('should search on tags', function () {
      var arr = [{
        tags: ['foo', 'bar', 'oof']
      }, {}];

      DeviceFilter.setCurrentSearch('bar');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
      expect(DeviceFilter.getFilteredList(arr)[0].tags).toBe(arr[0].tags);
    });

    it('should search on serial', function () {
      var arr = [{
        serial: 'xfoox'
      }, {}];

      DeviceFilter.setCurrentSearch('foo');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
      expect(DeviceFilter.getFilteredList(arr)[0].serial).toBe('xfoox');
    });

    it('should search on upgrade channel', function () {
      var arr = [{
        upgradeChannel: 'xfoox'
      }, {}];

      DeviceFilter.setCurrentSearch('foo');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
      expect(DeviceFilter.getFilteredList(arr)[0].upgradeChannel).toBe('xfoox');
    });

    it('should search on issue types', function () {
      var arr = [{
        diagnosticsEvents: [{
          type: "foo"
        }, {
          type: "bar"
        }]
      }, {}];

      DeviceFilter.setCurrentSearch('bar');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
      expect(DeviceFilter.getFilteredList(arr)[0].diagnosticsEvents).toBe(arr[0].diagnosticsEvents);
    });

    it('should search on issue messages', function () {
      var arr = [{
        diagnosticsEvents: [{
          message: "foo"
        }, {
          message: "bar"
        }]
      }, {}];

      DeviceFilter.setCurrentSearch('bar');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
      expect(DeviceFilter.getFilteredList(arr)[0].diagnosticsEvents).toBe(arr[0].diagnosticsEvents);
    });

    it('should search on multiple terms', function () {
      var arr = [{
        displayName: 'xfoox',
        product: 'xbarx'
      }, {
        displayName: 'xfoox'
      }];

      DeviceFilter.setCurrentSearch('foo,bar');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
      expect(DeviceFilter.getFilteredList(arr)[0].displayName).toBe('xfoox');
      expect(DeviceFilter.getFilteredList(arr)[0].product).toBe('xbarx');

      DeviceFilter.setCurrentSearch('foo bar');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
      expect(DeviceFilter.getFilteredList(arr)[0].displayName).toBe('xfoox');
      expect(DeviceFilter.getFilteredList(arr)[0].product).toBe('xbarx');

      DeviceFilter.setCurrentSearch('foo, bar');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
      expect(DeviceFilter.getFilteredList(arr)[0].displayName).toBe('xfoox');
      expect(DeviceFilter.getFilteredList(arr)[0].product).toBe('xbarx');
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
        hasIssues: true,
        isOnline: true
      }, {}];

      DeviceFilter.setCurrentFilter('issues');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(1);
    });

    it('inactive accounts are not counted as devices with issues', function () {
      var arr = [{
        hasIssues: true,
        isUnused: true
      }, {}];

      DeviceFilter.setCurrentFilter('issues');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(0);
    });

    it('offline devices are not counted as devices with issues', function () {
      var arr = [{
        hasIssues: true,
        isUnused: true
      }, {}];

      DeviceFilter.setCurrentFilter('issues');

      expect(DeviceFilter.getFilteredList(arr).length).toBe(0);
    });

  });

});
