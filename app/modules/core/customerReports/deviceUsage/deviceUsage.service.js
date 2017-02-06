(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageService', DeviceUsageService);

  /* @ngInject */
  function DeviceUsageService($log, $q, $timeout, $http, UrlConfig, Authinfo) {
    var localUrlBase = 'http://berserk.rd.cisco.com:8080/atlas-server/admin/api/v1/organization';
    var urlBase = UrlConfig.getAdminServiceUrl() + 'organization';

    var csdmUrlBase = UrlConfig.getCsdmServiceUrl() + '/organization';
    var csdmUrl = csdmUrlBase + '/' + Authinfo.getOrgId() + '/places/';

    var timeoutInMillis = 20000;

    function getDataForRange(start, end, granularity, deviceCategories, api) {

      var startDate = moment(start);
      var endDate = moment(end);
      var now = moment();

      if (startDate.isValid() && endDate.isValid() && startDate.isBefore(endDate) && endDate.isBefore(now)) {
        if (api === 'local') {
          var url = localUrlBase + '/' + Authinfo.getOrgId() + '/reports/device/usage?';
          url = url + 'interval=day'; // As long week and month is not implemented
          url = url + '&from=' + start + '&to=' + end;
          url = url + '&categories=' + deviceCategories.join();
          //url = url + '&accounts=aggregate';
          url = url + '&models=__';
          return getUsageData(url, granularity)
            .then(function (res) {
              return addMissingDaysInfo(res, start, end);
            })
            .then(function (res) {
              res.reportItems = reduceAllData(res.reportItems, granularity);
              return res;
            });
        } else {
          url = urlBase + '/' + Authinfo.getOrgId() + '/reports/device/usage?';
          url = url + 'interval=day'; // As long week and month is not implemented
          url = url + '&from=' + start + '&to=' + end;
          url = url + '&categories=' + deviceCategories.join();
          //url = url + '&accounts=aggregate';
          url = url + '&models=__';
          return getUsageData(url, granularity)
            .then(function (res) {
              return addMissingDaysInfo(res, start, end);
            })
            .then(function (res) {
              res.reportItems = reduceAllData(res.reportItems, granularity);
              return res;
            });
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

    function getUsageData(url) {
      var deferred = $q.defer();
      var timeout = {
        timeout: deferred.promise
      };
      $timeout(function () {
        deferred.resolve();
      }, timeoutInMillis);

      return $http.get(url, timeout).then(function (response) {
        if (!response.data.items) {
          response.data.items = [];
        }
        return response.data.items;
      }, function (reject) {
        return $q.reject(analyseReject(reject));
      });
    }

    function addMissingDaysInfo(usageData, start, end) {
      return getMissingDays(start, end).then(function (missingDays) {
        var current = moment(start);
        var final = moment(end);
        while (current.isSameOrBefore(final)) {
          var day = current.format('YYYY-MM-DD');
          if (isDayMissing(missingDays, day)) {
            //$log.warn("Adding missing day", day);
            usageData.push({
              time: day,
              totalDuration: 0,
              callCount: 0
            });
          }
          current.add(1, 'days');
        }
        if (missingDays.length > 0) {
          return { reportItems: usageData, missingDays: { missingDays: true, count: missingDays.length } };
        } else {
          return { reportItems: usageData, missingDays: { missingDays: false } };
        }
      });

    }

    function isDayMissing(missingDays, currentDay) {
      var dateMissing = _.find(missingDays, function (missingDay) {
        return (moment(missingDay.date).format("YYYYMMDD") == (moment(currentDay).format("YYYYMMDD")));
      });
      return dateMissing != undefined;
    }

    function getMissingDays(start, end) {
      var url = getBaseOrgUrl() + "reports/device/data_availability?interval=day&from=" + start + "&to=" + end;
      return $http.get(url).then(function (response) {
        var items = response.data.items; // .available
        var missingDays = _.filter(items, (function (item) {
          return (item.available === false);
        }));
        return missingDays;
      });
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
            totalDuration: 0
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
        result[date].totalDuration += item.callDuration;
        return result;
      }, {}).map(function (value, key) {
        value.totalDurationY = (value.totalDuration / 3600).toFixed(2);
        var timeFormatted = key.substr(0, 4) + '-' + key.substr(4, 2) + '-' + key.substr(6, 2);
        value.time = timeFormatted;
        return value;
      }).value();
      return reduced;
    }

    function extractStats(reduced, start, end) {
      var deferredAll = $q.defer();
      var stats = {
        most: [],
        least: [],
        noOfDevices: "???",
        noOfCalls: calculateTotalNoOfCalls(reduced),
        totalDuration: calculateTotalDuration(reduced)
      };
      var limit = 20;
      $q.all([getLeast(start, end, limit), getMost(start, end, limit)]).then(function (leastMost) {
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

    function getLeast(start, end, limit) {
      var url = getBaseOrgUrl() + "reports/device/usage/aggregate?interval=day&from=" + start + "&to=" + end + "&accounts=__&orderBy=callDuration&sortAsc=true&excludeUnused=true&limit=" + limit;
      return $http.get(url).then(function (response) {
        return response.data.items;
      });
    }

    function getMost(start, end, limit) {
      var url = getBaseOrgUrl() + "reports/device/usage/aggregate?interval=day&from=" + start + "&to=" + end + "&accounts=__&orderBy=callDuration&sortAsc=false&limit=" + limit;
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
