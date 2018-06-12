'use strict';

describe('DeviceUsageService', function () {
  beforeEach(angular.mock.module('Core'));

  var DeviceUsageService;
  var $httpBackend;
  var Authinfo;
  var UrlConfig;
  var now = moment('2016-10-27T00:00:00.000Z').toDate(); // Fri, Oct, 2016
  var usageData = {
    day1: [
      {
        date: '2016-10-28T00:00:00.000Z',
        accountId: '*',
        category: 'ce',
        model: 'SX20',
        countryCode: '*',
        callCount: 6,
        callDuration: 2500,
      },
      {
        date: '2016-10-28T00:00:00.000Z',
        accountId: '*',
        category: 'ce',
        model: 'MX700',
        countryCode: '*',
        callCount: 5,
        callDuration: 1000,
      },
    ],
    day2: [
      {
        date: '2016-10-27T00:00:00.000Z',
        accountId: '*',
        category: 'ce',
        model: 'SX20',
        countryCode: '*',
        callCount: 4,
        callDuration: 500,
      }, {
        date: '2016-10-27T00:00:00.000Z',
        accountId: '*',
        category: 'SparkBoard',
        model: 'SparkBoard 55',
        countryCode: '*',
        callCount: 2,
        callDuration: 1000,
      },
    ],
    day4: [
      {
        date: '2016-10-25T00:00:00.000Z',
        accountId: '*',
        category: 'ce',
        model: 'SX20',
        countryCode: '*',
        callCount: 2,
        callDuration: 500,
      },
      {
        date: '2016-10-25T00:00:00.000Z',
        accountId: '*',
        category: 'SparkBoard',
        model: 'SparkBoard 55',
        countryCode: '*',
      },
    ],
  };

  var expectedResult = [{
    callCount: 2,
    totalDuration: 500,
    totalDurationY: '0.14',
    time: '2016-10-25',
  }, {
    callCount: 6,
    totalDuration: 1500,
    totalDurationY: '0.42',
    time: '2016-10-27',
  }, {
    callCount: 11,
    totalDuration: 3500,
    totalDurationY: '0.97',
    time: '2016-10-28',
  }];

  var availableDataResponse = [
    {
      date: '2016-10-25T00:00:00.000Z',
      available: true,
    }, {
      date: '2016-10-26T00:00:00.000Z',
      available: false,
    }, {
      date: '2017-10-27T00:00:00.000Z',
      available: true,
    }, {
      date: '2017-10-28T00:00:00.000Z',
      available: true,
    },
  ];

  // TODO: Swap when production ready
  var urlBase = 'http://berserk.rd.cisco.com:8080/atlas-server/admin/api/v1/organization';

  afterEach(function () {
    DeviceUsageService = undefined;
  });

  beforeEach(inject(function (_$httpBackend_, _DeviceUsageService_, _Authinfo_, _UrlConfig_) {
    DeviceUsageService = _DeviceUsageService_;
    $httpBackend = _$httpBackend_;
    UrlConfig = _UrlConfig_;
    Authinfo = _Authinfo_;
    moment.tz.setDefault('America/Los_Angeles');
    jasmine.clock().install();
    var baseTime = now;
    jasmine.clock().mockDate(baseTime);
    urlBase = UrlConfig.getAdminServiceUrl() + 'organization';
  }));

  afterEach(function () {
    moment.tz.setDefault();
    jasmine.clock().uninstall();
  });

  describe('get usage data', function () {
    var usageDataResponse;
    beforeEach(function () {
      usageDataResponse = usageData.day4
        .concat(usageData.day2)
        .concat(usageData.day1);
    });

    function testReduceAllDataWithTZ(usageDataResponse, timeZone) {
      moment.tz.setDefault(timeZone);
      var result = DeviceUsageService.reduceAllData(usageDataResponse, 'day');
      return result;
    }

    function testGetDataForRangeWithTZ(timeZone) {
      moment.tz.setDefault(timeZone);
      return DeviceUsageService.getDataForRange('2010-10-25', '2016-10-28', 'day', [], 'backend');
    }

    it('reduces data to calculated totals pr day', function () {
      var result = testReduceAllDataWithTZ(usageDataResponse, 'America/Toronto');
      expect(result).toEqual(expectedResult);
      result = testReduceAllDataWithTZ(usageDataResponse, 'America/Los_Angeles');
      expect(result).toEqual(expectedResult);
    });

    it('replaces missing days with data indicating zero use', function () {
      spyOn(Authinfo, 'getOrgId');
      Authinfo.getOrgId.and.returnValue('1234');
      var usageRequest = urlBase + '/1234/reports/device/usage?interval=day&from=2010-10-25&to=2016-10-28&categories=aggregate&countryCodes=aggregate&accounts=aggregate&models=aggregate';
      $httpBackend
        .when('GET', usageRequest)
        .respond({ items: usageDataResponse });

      var availabilityRequest = urlBase + '/1234/reports/device/data_availability?interval=day&from=2010-10-25&to=2016-10-28';
      $httpBackend
        .when('GET', availabilityRequest)
        .respond({ items: availableDataResponse });

      var expectedResultWith0Day = _.cloneDeep(expectedResult);
      var emptyDay = {
        callCount: 0,
        totalDuration: 0,
        totalDurationY: '0.00',
        time: '2016-10-26',
      };
      expectedResultWith0Day.splice(1, 0, emptyDay);
      var dataResponse;

      testGetDataForRangeWithTZ('America/Toronto')
        .then(function (result) {
          dataResponse = result;
        })
        .catch(fail);
      $httpBackend.flush();
      expect(dataResponse.reportItems).toEqual(expectedResultWith0Day);
      expect(dataResponse.missingDays).toEqual({ missingDays: true, count: 1 });

      testGetDataForRangeWithTZ('America/Los_Angeles')
        .then(function (result) {
          dataResponse = result;
        })
        .catch(fail);
      $httpBackend.flush();

      expect(dataResponse.reportItems).toEqual(expectedResultWith0Day);
      expect(dataResponse.missingDays).toEqual({ missingDays: true, count: 1 });
    });
  });

  describe('get usage data', function () {
    it('calls backend to get least and most used', function () {
      var usageData1 =
        {
          date: '2016-10-25T00:00:00.000Z',
          accountId: '*',
          category: 'ce',
          model: 'SX20',
          countryCode: '*',
          //"callCount": 2,         //missing
          //"callDuration": 500,    //missing
        };
      var usageData2 =
        {
          date: '2016-10-26T00:00:00.000Z',
          accountId: '*',
          category: 'SparkBoard',
          model: 'SparkBoard 55',
          countryCode: '*',
          callCount: 4,
          callDuration: 500,
        };
      var usageData3 =
        {
          date: '2016-10-27T00:00:00.000Z',
          accountId: '*',
          category: 'ce',
          model: 'SX20',
          countryCode: '*',
          callCount: 6,
          callDuration: 500,
        };

      var usageData = [
        usageData1,
        usageData2,
        usageData3,
      ];

      var peopleCount1 =
        {
          accountId: '2c179dba-75fc-48e5-8cdb-73cc78fc7fd3',
          callCount: 10,
          callDurationAvg: 1865,
          callDurationTotal: 19700,
          callMaxJoinedAvg: 1.25,
          callMxJoinedPeak: 3,
          CallTotalJoinedAvg: 1.25,
          category: 'ce',
          countryCode: '*',
          date: '2016-10-27T00:00:00.000Z',
          model: 'Room Kit',
          peopleCountAvg: 1.25,
          peopleCountPeak: 2,
          peopleCountTotal: 11,
        };

      var peopleCount2 =
        {
          accountId: '2c179dba-75fc-48e5-8cdb-73cc78fc7fd3',
          callCount: 10,
          callDurationAvg: 1865,
          callDurationTotal: 19700,
          callMaxJoinedAvg: 1.25,
          callMxJoinedPeak: 3,
          CallTotalJoinedAvg: 1.25,
          category: 'ce',
          countryCode: '*',
          date: '2016-10-27T00:00:00.000Z',
          model: 'Room Kit',
          peopleCountAvg: 1.25,
          peopleCountPeak: 2,
          peopleCountTotal: 11,
        };

      var peopleData = [
        peopleCount1,
        peopleCount2,
      ];

      spyOn(Authinfo, 'getOrgId');
      Authinfo.getOrgId.and.returnValue('1234');
      var least = urlBase + '/1234/reports/device/usage/aggregate?interval=day&from=2010-10-25&to=2016-10-28&countryCodes=aggregate&models=__&orderBy=callDuration&descending=false&limit=20';
      $httpBackend
        .when('GET', least)
        .respond({ items: usageData });

      var most = urlBase + '/1234/reports/device/usage/aggregate?interval=day&from=2010-10-25&to=2016-10-28&countryCodes=aggregate&models=__&orderBy=callDuration&descending=true&limit=20';
      $httpBackend
        .when('GET', most)
        .respond({ items: usageData });

      var count = urlBase + '/1234/reports/device/usage/count?interval=day&from=2010-10-25&to=2016-10-28&models=__&excludeUnused=true';
      $httpBackend
        .when('GET', count)
        .respond({ items: [{ date: '*', count: 42 }] });

      var peopleCount = urlBase + '/1234/reports/device/people_count/aggregate?interval=day&from=2010-10-25&to=2016-10-28&categories=aggregate';
      $httpBackend
        .when('GET', peopleCount)
        .respond({ items: peopleData });

      var dataResponse;

      usageData1.callCount = 0;
      usageData1.callDuration = 0;

      var extectedResult = _.clone([
        usageData1,
        usageData2,
        usageData3,
      ]);

      DeviceUsageService.extractStats(usageData, '2010-10-25', '2016-10-28').then(function (result) {
        dataResponse = result;
      });

      $httpBackend.flush();

      expect(dataResponse.most).toEqual(extectedResult);
      expect(dataResponse.least).toEqual(extectedResult);
    });

    it('resolves name from accoundIds and returns result in same sequence as listed in devices request', function () {
      spyOn(Authinfo, 'getOrgId');
      Authinfo.getOrgId.and.returnValue('1234');
      var devicesRequest = urlBase + '/1234/reports/devices?accountIds=1111,2222,3333,4444,5555';
      $httpBackend
        .when('GET', devicesRequest)
        .respond([
          { displayName: 'two', id: '2222', whatever: 'whatever' },
          { displayName: 'four', id: '4444', whatever: 'whatever' },
          { displayName: 'three', id: '3333', whatever: 'whatever' },
          { displayName: 'one', id: '1111', whatever: 'whatever' },
        ]);

      var result;

      var deviceIdsToResolve = [
        { accountId: '1111' },
        { accountId: '2222' },
        { accountId: '3333' },
        { accountId: '4444' },
        { accountId: '5555' },
      ];
      DeviceUsageService.resolveDeviceData(deviceIdsToResolve).then(function (data) {
        result = data;
      });
      $httpBackend.flush();

      expect(result).toEqual([
        { id: '1111', displayName: 'one' },
        { id: '2222', displayName: 'two' },
        { id: '3333', displayName: 'three' },
        { id: '4444', displayName: 'four' },
        { id: '5555', displayName: 'reportsPage.usageReports.nameNotResolvedFor id=5555', info: 'reportsPage.usageReports.nameNotFoundFor device id=5555' },

      ]);
    });
  });
});
