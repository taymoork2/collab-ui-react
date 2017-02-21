(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageTotalService', DeviceUsageTotalService);

  /* @ngInject */
  function DeviceUsageTotalService($log, $q, $timeout, $http, DeviceUsageMockData, UrlConfig, Authinfo) {
    var localUrlBase = 'http://localhost:8080/atlas-server/admin/api/v1/organization';
    var urlBase = UrlConfig.getAdminServiceUrl() + 'organization';

    var csdmUrlBase = UrlConfig.getCsdmServiceUrl() + '/organization';
    var csdmUrl = csdmUrlBase + '/' + Authinfo.getOrgId() + '/places/';

    var timeoutInMillis = 20000;
    var intervalType = 'day'; // Used as long as week and month is not implemented

    function getDataForRange(start, end, granularity, deviceCategories, models, api) {
      var startDate = moment(start);
      var endDate = moment(end);
      var now = moment();

      models = 'na'; // just here for compatibility with V2

      if (startDate.isValid() && endDate.isValid() && startDate.isBefore(endDate) && endDate.isBefore(now)) {
        if (api === 'mock') {
          return DeviceUsageMockData.getRawDataPromise(start, end).then(function (data) {
            return reduceAllData(data, granularity);
          });
        } else if (api === 'local') {
          var url = localUrlBase + '/' + Authinfo.getOrgId() + '/reports/device/call?';
          url = url + 'intervalType=' + intervalType; // As long week and month is not implemented
          url = url + '&rangeStart=' + start + '&rangeEnd=' + end;
          url = url + '&deviceCategories=' + deviceCategories.join();
          url = url + '&models=' + models;
          url = url + '&accounts=__';
          url = url + '&sendMockData=false';
          return doRequest(url, granularity, start, end);
        } else {
          url = urlBase + '/' + Authinfo.getOrgId() + '/reports/device/call?';
          url = url + 'intervalType=' + intervalType; // As long week and month is not implemented
          url = url + '&rangeStart=' + start + '&rangeEnd=' + end;
          url = url + '&deviceCategories=' + deviceCategories.join();
          url = url + '&models=' + models;
          url = url + '&accounts=__';
          return doRequest(url, granularity, start, end);
        }
      }

    }

    function doRequest(url, granularity, start, end) {
      var deferred = $q.defer();
      var timeout = {
        timeout: deferred.promise,
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
          missingDays = checkIfMissingDays(response.data.items, start, end);
        }
        if (missingDays.missingDays) {
          fillEmptyDays(response.data.items, start, end);
        }
        var reduced = reduceAllData(response.data.items, granularity);
        return { reportItems: reduced, missingDays: missingDays };
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
            totalDuration: 0,
            pairedCount: 0,
            callCount: 0,
          });
        }
      });
    }

    function checkIfMissingDays(items, start, end) {
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
      if (diff.length > 0) {
        return { missingDays: true, count: diff.length };
      } else {
        return { missingDays: false, count: 0 };
      }
    }

    function analyseReject(reject) {
      if (reject.status === -1) {
        reject.statusText = 'Operation timed Out';
        reject.data = {
          message: 'Operation timed out',
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
            pairedCount: 0,
            deviceCategories: {},
            accountIds: {},
          };
        }
        if (_.isNil(item.callCount) || _.isNaN(item.callCount)) {
          $log.warn('Missing call count for', item);
          item.callCount = 0;
        }
        if (_.isNil(item.totalDuration) || _.isNaN(item.totalDuration)) {
          $log.warn('Missing total duration for', item);
          item.totalDuration = 0;
        }
        if (_.isNil(item.pairedCount) || _.isNaN(item.pairedCount)) {
          item.pairedCount = 0;
        }
        result[date].callCount += item.callCount;
        result[date].totalDuration += item.totalDuration;
        result[date].pairedCount += item.pairedCount;

        if (!result[date].deviceCategories[item.deviceCategory]) {
          result[date].deviceCategories[item.deviceCategory] = {
            deviceCategory: item.deviceCategory,
            totalDuration: item.totalDuration,
            callCount: item.callCount,
            pairedCount: item.pairedCount,
          };
        } else {
          result[date].deviceCategories[item.deviceCategory].totalDuration += item.totalDuration;
          result[date].deviceCategories[item.deviceCategory].callCount += item.callCount;
          result[date].deviceCategories[item.deviceCategory].pairedCount += item.pairedCount;
        }
        if (item.accountId && !result[date].accountIds[item.accountId]) {
          result[date].accountIds[item.accountId] = {
            accountId: item.accountId,
            totalDuration: item.totalDuration,
            callCount: item.callCount,
            pairedCount: item.pairedCount,
          };
        } else if (item.accountId) {
          result[date].accountIds[item.accountId].totalDuration += item.totalDuration;
          result[date].accountIds[item.accountId].callCount += item.callCount;
          result[date].accountIds[item.accountId].pairedCount += item.pairedCount;
        }
        return result;
      }, {}).map(function (value, key) {
        value.totalDurationY = (value.totalDuration / 3600).toFixed(2);
        var timeFormatted = key.substr(0, 4) + '-' + key.substr(4, 2) + '-' + key.substr(6, 2);
        value.time = timeFormatted;
        return value;
      }).value();
      //$log.info('reduceAll', reduced);
      return reduced;
    }

    function extractAndSortAccounts(reduced) {
      //$log.info("sequence before sorting", reduced);
      var sequence = _.chain(reduced).map(function (value) {
        return value.accountIds;
      })
        .reduce(function (result, value) {
          _.each(value, function (item) {
            if (!result[item.accountId]) {
              result[item.accountId] = {
                callCount: item.callCount,
                pairedCount: item.pairedCount,
                totalDuration: item.totalDuration,
              };
            } else {
              result[item.accountId].callCount += item.callCount;
              result[item.accountId].pairedCount += item.pairedCount;
              result[item.accountId].totalDuration += item.totalDuration;
            }
          });
          return result;
        }, {})
        .map(function (value, key) {
          value.accountId = key;
          return value;
        })
        .orderBy(['totalDuration'], ['desc'])
        .value();

      //$log.info('sequence after sorting', sequence);
      return sequence;
    }

    function extractStats(reduced) {
      var accounts = extractAndSortAccounts(reduced);
      var n = 20;
      var stats = {
        most: _.take(accounts, n),
        least: _.takeRight(accounts, n).reverse(),
        noOfDevices: accounts.length,
        noOfCalls: calculateTotal(accounts).noOfCalls,
        totalDuration: calculateTotal(accounts).totalDuration,
      };
      //$log.info('Extracted stats:', stats);
      return $q.resolve(stats);
    }

    function calculateTotal(accounts) {
      var duration = 0;
      var noOfCalls = 0;
      _.each(accounts, function (a) {
        duration += a.totalDuration;
        noOfCalls += a.callCount;
      });
      return { totalDuration: duration, noOfCalls: noOfCalls };
    }

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
              "displayName": "Unknown [id:" + device.accountId + "]",
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
      reduceAllData: reduceAllData,
    };
  }
}());
