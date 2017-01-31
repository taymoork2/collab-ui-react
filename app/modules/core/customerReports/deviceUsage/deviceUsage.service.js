(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageService', DeviceUsageService);

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

    // Preliminary support both local and "prod" urls
    function getBaseOrgUrl(api) {
      if (_.isUndefined(api)) {
        return localUrlBase + '/' + Authinfo.getOrgId() + "/";
      } else {
        return urlBase + '/' + Authinfo.getOrgId() + "/";
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
          //missingDays = checkIfMissingDays(response.data.items, start, end, missingDaysDeferred);
          missingDays = checkMissingDays2(missingDaysDeferred, start, end);
        }
        if (missingDays) {
          fillEmptyDays(response.data.items, start, end);
        }
        return reduceAllData(response.data.items, granularity);
      }, function (reject) {
        return $q.reject(analyseReject(reject));
      });
    }

    function checkMissingDays2(missingDaysDeferred, start, end) {
      var url = getBaseOrgUrl + "reports/device/data_availability?interval=day&from=" + start + "&to=" + end;
      return $http.get(url).then(function (response) {
        var items = response.data.items; // .available
        var missingDays = _.filter(items, (function (item) {
          return (item.available === false);
        }));
        $log.warn("AVAILABILITY", items);
        $log.warn("Missing days", missingDays);
        missingDaysDeferred.resolve({
          missingDays: 42
        });
        return missingDays.length > 0;
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

    // function checkIfMissingDays(items, start, end, missingDaysDeferred) {
    //   //var first = moment(start);
    //   var last = moment(end);
    //   var current = moment(start);
    //
    //   //getDataAvailability();
    //
    //   var correctDays = [];
    //   while (current.isBefore(last)) {
    //     correctDays.push(current.format('YYYYMMDD'));
    //     current.add(1, 'days');
    //   }
    //   correctDays.push(last.format('YYYYMMDD'));
    //   //$log.info('correctDays', correctDays);
    //
    //   //$log.info('checkIfMissingDays', first.format('YYYYMMDD') + ' - ' + last.format('YYYYMMDD'));
    //   //current = first;
    //   var reducedDays = _.chain(items).reduce(function (result, item) {
    //     if (!result[item.date]) {
    //       //$log.info('reduce_day', item.date);
    //       result[item.date] = item.date;
    //     }
    //     return result;
    //   }, {})
    //   .map(function (value) {
    //     return value.toString();
    //   }).value();
    //   var diff = _.differenceWith(correctDays, reducedDays, _.isEqual);
    //   //$log.info('diff', diff);
    //   if (diff.length > 0) {
    //     missingDaysDeferred.resolve({
    //       missingDays: diff
    //     });
    //     return true;
    //   } else {
    //     return false;
    //   }
    // }

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
        var timeFormatted = key.substr(0, 4) + '-' + key.substr(4, 2) + '-' + key.substr(6, 2);
        value.time = timeFormatted;
        return value;
      }).value();
      $log.warn('reduceAll', reduced);
      return reduced;
    }

    function extractStats(reduced, start, end) {

      var accounts = reduced; // old V1 API compatibility
      $log.info("extractStats, reduced=", reduced);
      $log.info("extractStats, accounts=", accounts);

      var deferredAll = $q.defer();

      var stats = {
        most: [],
        least: [],
        noOfDevices: "???",
        noOfCalls: calculateTotalNoOfCalls(reduced),
        totalDuration: calculateTotalDuration(reduced)
      };

      $q.all([getLeast(start, end), getMost(start, end)]).then(function (leastMost) {
        stats.least = leastMost[0];
        stats.most = leastMost[1];

        // Preliminary compatibility with V1
        _.each(stats.least, function (item) {
          item.totalDuration = item.callDuration;
        });

        // Preliminary compatibility with V1
        _.each(stats.most, function (item) {
          item.totalDuration = item.callDuration;
        });

        deferredAll.resolve(stats);
      });

      return deferredAll.promise;
    }

    function calculateTotalNoOfCalls(data) {
      return _.sumBy(data, function (item) {
        return item.callCount;
      });
    }

    function calculateTotalDuration(data) {
      return _.sumBy(data, function (item) {
        return item.totalDuration;
      });
    }

    function getLeast(start, end) {
      var url = getBaseOrgUrl() + "reports/device/usage?interval=day&from=" + start + "&to=" + end + "&accounts=__&categories=aggregate&models=aggregate&orderBy=callDuration&sortAsc=true&limit=5";
      return $http.get(url).then(function (response) {
        return response.data.items;
      });
    }

    function getMost(start, end) {
      var url = getBaseOrgUrl() + "reports/device/usage?interval=day&from=" + start + "&to=" + end + "&accounts=__&categories=aggregate&models=aggregate&orderBy=callDuration&sortAsc=false&limit=5";
      return $http.get(url).then(function (response) {
        return response.data.items;
      });
    }

    function pickDateBucket(item, granularity) {
      //var day = item.date.toString();
      // var formattedDate = day.substr(0, 4) + '-' + day.substr(4, 2) + '-' + day.substr(6, 2);
      //$log.info('pickDateBucket', formattedDate);
      //var date = moment(formattedDate).startOf(granularity);
      var date = moment(item.date).startOf(granularity);
      switch (granularity) {
        case 'day':
          return date.format('YYYYMMDD');
        case 'week':
          //return moment(formattedDate).startOf('isoWeek').format('YYYYMMDD');
          return moment(item.date).startOf('isoWeek').format('YYYYMMDD');
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
