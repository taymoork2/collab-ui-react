(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageService', DeviceUsageService);


/*
  Hente alle modeller gitt kategorier:
    api/v1/organization/{orgId}/reports/device/models?categories=ce,sparkboard
  {
    "items":[
    {
      "category":"sparkboard",
      "model":"SparkBoard 55"
    },
    {
      "category":"ce",
      "model":"Super Duper CE"
    }
    ...
  ]
  }


  Hente data til "Room Device Usage" graf:
    api/v1/organization/{orgId}/reports/device/usage?interval=day&from=2017-01-13&to=2017-01-19&categories=ce,sparkboard&models=SparkBoard%2055
  {
    "items":[
    {
      "date":"2017-01-13",
      "accountId":"*",
      "category":"ce",
      "model":"Super Duper CE",
      "countryCode":"NO",
      "callsTotal":11,
      "callsTotalDuration":123
    },
    ...
    {
      "date":"2017-01-19",
      "accountId":"*",
      "category":"sparkboard",
      "model":"SparkBoard 55",
      "countryCode":"US",
      "callsTotal":10,
      "callsTotalDuration":2123
    },
    ...
  ]
  }


  Hente data til 10 least eller most for en gitt månedsrange:
    api/v1/organization/{orgId}/reports/device/usage?interval=month&from=2017-01-01&to=2017-01-01&accounts=__&categories=ce,sparkboard&models=SparkBoard%2055&orderBy=callsTotalDuration&sortAsc=false&limit=5&excludeUnused=false
  {
    "items":[
    {
      "date":"2017-01-01",
      "accountId":"de5a2942-d5f5-40f4-a747-19f0ccfdd9cf",
      "category":"ce",
      "model":"Super Duper CE",
      "countryCode":"NO",
      "callsTotal":10,
      "callsTotalDuration":2123
    },
    {
      "date":"2017-01-01",
      "accountId":"ce681234-d5f5-40f4-a747-19f0ccfdd9aa",
      "category":"sparkboard",
      "model":"SparkBoard 55",
      "countryCode":"US",
      "callsTotal":11,
      "callsTotalDuration":123
    },
    ... 3 more
  ]
  }


  Hente informasjon om manglende data:
    api/v1/organization/{orgId}/reports/device/data_availability?interval=day&from=2017-01-01&to=2017-01-31
    {
      "items":[
        {
          "date":"2017-01-01",
          "available":true
        },
        {
          "date":"2017-01-02",
          "available":false
        },
        ... 29 more
      ]
    }


  Export:
    api/v1/organization/{orgId}/reports/device/usage/export?interval=day&from=2017-01-01&to=2017-01-31&accounts=__&categories=ce,sparkboard&models=__

  CSV:
    ...


  */


  /* @ngInject */
  function DeviceUsageService($log, $q, $timeout, $http, DeviceUsageMockData, UrlConfig, Authinfo) {
    var localUrlBase = 'http://berserk.rd.cisco.com:8080/atlas-server/admin/api/v1/organization';
    var urlBase = UrlConfig.getAdminServiceUrl() + 'organization';

    var csdmUrlBase = UrlConfig.getCsdmServiceUrl() + '/organization';
    var csdmUrl = csdmUrlBase + '/' + Authinfo.getOrgId() + '/places/';

    var timeoutInMillis = 20000;
    var intervalType = 'day'; // Used as long as week and month is not implemented

    // legg til models, fjerne missingDaysDeferred
    function getDataForRange(start, end, granularity, deviceCategories, api, missingDaysDeferred) {

      // TODO: Remove hardcoded dates when new backend has data
      start = '2017-01-09';
      end = '2017-01-12';

      var startDate = moment(start);
      var endDate = moment(end);
      var now = moment();

      if (startDate.isValid() && endDate.isValid() && startDate.isBefore(endDate) && endDate.isBefore(now)) {
        if (api === 'mock') {
          return DeviceUsageMockData.getRawDataPromise(start, end).then(function (data) {
            return reduceAllData(data, granularity);
          });
          //reports/device/usage?interval=day&from=2017-01-10&to=2017-01-11&categories=sparkboard
        } else if (api === 'local') {
          var url = localUrlBase + '/' + Authinfo.getOrgId() + '/reports/device/usage?';
          url = url + 'interval=' + intervalType; // As long week and month is not implemented
          url = url + '&from=' + start + '&to=' + end;
          url = url + '&categories=' + deviceCategories.join();
          //url = url + '&accounts=aggregate';
          url = url + '&models=__'; //&accounts=__&countryCodes=__';
          return doRequest(url, granularity, start, end, missingDaysDeferred);
        } else {
          url = urlBase + '/' + Authinfo.getOrgId() + '/reports/device/usage?';
          url = url + 'interval=' + intervalType; // As long week and month is not implemented
          url = url + '&from=' + start + '&to=' + end;
          url = url + '&categories=' + deviceCategories.join();
          //url = url + '&accounts=aggregate';
          url = url + '&models=__'; //&accounts=__&countryCodes=__';
          return doRequest(url, granularity, start, end, missingDaysDeferred);
        }
      }

    }

    function doRequest(url, granularity, start, end, missingDaysDeferred) {
      var deferred = $q.defer();
      var timeout = {
        timeout: deferred.promise
      };
      $timeout(function () {
        deferred.resolve();
      }, timeoutInMillis);

      return $http.get(url, timeout).then(function (response) {
        //$log.info('#items', response.data.items.length);
        var missingDays = false;
        if (!response.data.items) {
          response.data.items = [];
        }
        if (response.data.items.length > 0) {
          missingDays = checkIfMissingDays(response.data.items, start, end, missingDaysDeferred);
        }
        if (missingDays) {
          fillEmptyDays(response.data.items, start, end);
        }
        return reduceAllData(response.data.items, granularity);
      }, function (reject) {
        return $q.reject(analyseReject(reject));
      });
    }

    function fillEmptyDays(items, start, end) {
      //$log.info('fillEmptyDays', start + ' - ' + end);
      //$log.info('fillEmptyDays', items);
      var daysNeeded = {};
      var current = moment(start);
      var final = moment(end);
      while (current.isBefore(final)) {
        daysNeeded[current.format('YYYYMMDD')] = true;
        current.add(1, 'days');
      }
      daysNeeded[final.format('YYYYMMDD')] = true;
      //$log.info('daysNeeded', daysNeeded);
      _.each(items, function (day) {
        if (daysNeeded[day.date.toString()]) {
          daysNeeded[day.date.toString()] = false;
        }
      });
      //$log.info('daysNeeded', daysNeeded);
      _.each(daysNeeded, function (dn, day) {
        if (dn) {
          items.push({
            date: day,
            callDuration: 0,
            //pairedCount: 0,
            callCount: 0
          });
        }
      });
    }

    function checkIfMissingDays(items, start, end, missingDaysDeferred) {
      //var first = moment(start);
      var last = moment(end);
      var current = moment(start);

      var correctDays = [];
      while (current.isBefore(last)) {
        correctDays.push(current.format('YYYYMMDD'));
        current.add(1, 'days');
      }
      correctDays.push(last.format('YYYYMMDD'));
      //$log.info('correctDays', correctDays);

      //$log.info('checkIfMissingDays', first.format('YYYYMMDD') + ' - ' + last.format('YYYYMMDD'));
      //current = first;
      var reducedDays = _.chain(items).reduce(function (result, item) {
        if (!result[item.date]) {
          //$log.info('reduce_day', item.date);
          result[item.date] = item.date;
        }
        return result;
      }, {})
      .map(function (value) {
        return value.toString();
      }).value();
      var diff = _.differenceWith(correctDays, reducedDays, _.isEqual);
      //$log.info('diff', diff);
      if (diff.length > 0) {
        missingDaysDeferred.resolve({
          missingDays: diff
        });
        return true;
      } else {
        return false;
      }
    }

    function analyseReject(reject) {
      if (reject.status === -1) {
        reject.statusText = 'Operation timed Out';
        reject.data = {
          message: 'Operation timed out'
        };
      }
      return reject;
    }

    function reduceAllData(items, granularity) {
      var reduced = _.chain(items).reduce(function (result, item) {
        var date = pickDateBucket(item, granularity);
        if (typeof result[date] === 'undefined') {
          result[date] = {
            callCount: 0,
            totalDuration: 0,
            deviceCategories: {}
            //accountIds: {}
          };
        }
        if (_.isNil(item.callCount) || _.isNaN(item.callCount)) {
          $log.warn('Missing call count for', item);
          item.callCount = 0;
        }

        if (_.isNil(item.callDuration) || _.isNaN(item.callDuration)) {
          $log.warn('Missing total duration for', item);
          item.callDuration = 0;
        }

        result[date].callCount += item.callCount;
        result[date].totalDuration += item.callDuration; //totalDuration;

        // if (!result[date].deviceCategories[item.category]) {
        //   result[date].deviceCategories[item.category] = {
        //     deviceCategory: item.category,
        //     totalDuration: item.callDuration,
        //     callCount: item.callCount,
        //   };
        // } else {
        //   result[date].deviceCategories[item.category].totalDuration += item.callDuration;
        //   result[date].deviceCategories[item.category].callCount += item.callCount;
        //   //result[date].deviceCategories[item.category].pairedCount += item.pairedCount;
        // }

        // if (item.accountId && !result[date].accountIds[item.accountId]) {
        //   result[date].accountIds[item.accountId] = {
        //     accountId: item.accountId,
        //     totalDuration: item.callDuration,
        //     callCount: item.callCount,
        //     //pairedCount: item.pairedCount
        //   };
        // } else if (item.accountId) {
        //   result[date].accountIds[item.accountId].totalDuration += item.callDuration;
        //   result[date].accountIds[item.accountId].callCount += item.callCount;
        //   //result[date].accountIds[item.accountId].pairedCount += item.pairedCount;
        // }
        return result;
      }, {}).map(function (value, key) {
        //$log.warn("Anders:", value);
        //value.totalDuration = (value.totalDuration / 3600).toFixed(2);
        var timeFormatted = key.substr(0, 4) + '-' + key.substr(4, 2) + '-' + key.substr(6, 2);
        value.time = timeFormatted;
        return value;
      }).value();
      $log.warn('reduceAll', reduced);
      return reduced;
    }

    // function extractAndSortAccounts(reduced) {
    //   //$log.info("sequence before sorting", reduced);
    //   var sequence = _.chain(reduced).map(function (value) {
    //     return value.accountIds;
    //   })
    //     .reduce(function (result, value) {
    //       _.each(value, function (item) {
    //         if (!result[item.accountId]) {
    //           result[item.accountId] = {
    //             callCount: item.callCount,
    //             pairedCount: item.pairedCount,
    //             totalDuration: item.totalDuration
    //           };
    //         } else {
    //           result[item.accountId].callCount += item.callCount;
    //           result[item.accountId].pairedCount += item.pairedCount;
    //           result[item.accountId].totalDuration += item.totalDuration;
    //         }
    //       });
    //       return result;
    //     }, {})
    //     .map(function (value, key) {
    //       value.accountId = key;
    //       return value;
    //     })
    //     .orderBy(['totalDuration'], ['desc'])
    //     .value();
    //
    //   //$log.info('sequence after sorting', sequence);
    //   return sequence;
    // }

    function extractStats(reduced, count) {
      //var accounts = extractAndSortAccounts(reduced);
      var accounts = reduced;

      $log.warn("EXTRACT STARTS accounts", accounts);
      var n = count || 3;
      var stats = {
        most: _.take(accounts, n),
        least: _.takeRight(accounts, n).reverse(),
        noOfDevices: accounts.length,
        //noOfCalls: calculateTotal(accounts).noOfCalls,
        noOfCalls: calculateTotalNoOfCalls(reduced),
        //totalDuration: calculateTotal(accounts).totalDuration
        totalDuration: calculateTotalDuration(reduced)

      };
      $log.info('Extracted stats:', stats);
      return stats;
    }

    function calculateTotalNoOfCalls(data) {
      return _.sumBy(data, function (item) {
        return item.callCount;
      });
    }

    function calculateTotalDuration(data) {
      return _.sumBy(data, function (item) {
        return item.totalDuration;// / 3600;
      });
    }

    // function calculateTotal(accounts) {
    //   var duration = 0;
    //   var noOfCalls = 0;
    //   _.each(accounts, function (a) {
    //     $log.warn("calculateTotal", a);
    //     duration += a.totalDuration;
    //     noOfCalls += a.callCount;
    //   });
    //   return { totalDuration: duration, noOfCalls: noOfCalls };
    // }

    function pickDateBucket(item, granularity) {
      var day = item.date.toString();
      var formattedDate = day.substr(0, 4) + '-' + day.substr(4, 2) + '-' + day.substr(6, 2);
      //$log.info('pickDateBucket', formattedDate);
      var date = moment(formattedDate).startOf(granularity);
      switch (granularity) {
        case 'day':
          return date.format('YYYYMMDD');
        case 'week':
          return moment(formattedDate).startOf('isoWeek').format('YYYYMMDD');
        case 'month':
          return date.format('YYYYMMDD');
      }
    }

    function resolveDeviceData(devices) {
      var promises = [];
      _.each(devices, function (device) {
        promises.push($http.get(csdmUrl + device.accountId)
          .then(function (res) {
            //$log.info("resolving", res);
            return res.data;
          })
          .catch(function (err) {
            $log.info("Problems resolving device", err);
            return {
              "displayName": "Unknown [id:" + device.accountId + "]"
            };
          })
        );
      });
      return $q.all(promises);
    }

    return {
      getDataForRange: getDataForRange,
      extractStats: extractStats,
      resolveDeviceData: resolveDeviceData,
      reduceAllData: reduceAllData
    };
  }
}());
