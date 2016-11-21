(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageTotalService', DeviceUsageTotalService);

  /* @ngInject */
  function DeviceUsageTotalService($translate, $document, $window, $log, $q, $timeout, $http, chartColors, DeviceUsageMockData, UrlConfig, Authinfo) {
    var localUrlBase = 'http://localhost:8080/atlas-server/admin/api/v1/organization';
    var urlBase = UrlConfig.getAdminServiceUrl() + 'organization';

    var csdmUrlBase = UrlConfig.getCsdmServiceUrl() + '/organization';
    var csdmUrl = csdmUrlBase + '/' + Authinfo.getOrgId() + '/places/';

    var timeoutInMillis = 10000;
    var intervalType = 'day'; // Used as long as week and month is not implemented

    function getDataForLastWeek(deviceCategories, api, missingDaysDeferred) {
      //$log.info("dataForLastWeek", api);
      return getDataForPeriod('week', 1, 'day', deviceCategories, api, missingDaysDeferred);
    }

    function getDateRangeForLastNTimeUnits(count, granularity) {
      var start, end;
      if (granularity === 'day') {
        start = moment().subtract(count, granularity + 's').format('YYYY-MM-DD');
        end = moment().subtract(1, granularity + 's').format('YYYY-MM-DD');
      } else if (granularity === 'week') {
        //start = moment().startOf('isoWeek').subtract(count, granularity + 's').format('YYYY-MM-DD');
        start = moment().isoWeekday(1).subtract(count, granularity + 's').format("YYYY-MM-DD");
        //end = moment().subtract(1, granularity + 's').format('YYYY-MM-DD');
        end = moment().isoWeekday(7).subtract(1, granularity + 's').format("YYYY-MM-DD");
      }
      return { start: start, end: end };
    }
    function getDataForLastNTimeUnits(count, granularity, deviceCategories, api, missingDaysDeferred) {
      var dateRange = getDateRangeForLastNTimeUnits(count, granularity);
      return getDataForRange(dateRange.start, dateRange.end, granularity, deviceCategories, api, missingDaysDeferred);
    }

    function getDataForLastMonth(deviceCategories, api, missingDaysDeferred) {
      return getDataForPeriod('month', 1, 'week', deviceCategories, api, missingDaysDeferred);
    }

    function getDataForLastMonths(count, granularity, deviceCategories, api, missingDaysDeferred) {
      return getDataForPeriod('month', count, granularity, deviceCategories, api, missingDaysDeferred);
    }

    function getDataForPeriod(period, count, granularity, deviceCategories, api, missingDaysDeferred) {
      return loadPeriodCallData(period, count, granularity, deviceCategories, api, missingDaysDeferred);
    }

    function getDatesForLastWeek() {
      var start = moment().startOf('week').subtract(1, 'weeks').format('YYYY-MM-DD');
      var end = moment().startOf('week').subtract(1, 'days').format('YYYY-MM-DD');
      //$log.info("Returning dates for last week, dates:" + start + "," + end);
      return { start: start, end: end };
    }

    function getDatesForLastMonths(n) {
      var start = moment().startOf('month').subtract(n, 'months').format('YYYY-MM-DD');
      var end = moment().startOf('month').subtract(1, 'days').format('YYYY-MM-DD');
      //$log.info("Returning dates for " + n + " month(s), dates:" + start + "," + end);
      return { start: start, end: end };
    }

    function getDataForRange(start, end, granularity, deviceCategories, api, missingDaysDeferred) {
      var startDate = moment(start);
      var endDate = moment(end);
      var now = moment();

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
          url = url + '&accounts=__';
          url = url + '&sendMockData=false';
          return doRequest(url, granularity, start, end, missingDaysDeferred);
        } else {
          url = urlBase + '/' + Authinfo.getOrgId() + '/reports/device/call?';
          url = url + 'intervalType=' + intervalType; // As long week and month is not implemented
          url = url + '&rangeStart=' + start + '&rangeEnd=' + end;
          url = url + '&deviceCategories=' + deviceCategories.join();
          url = url + '&accounts=__';
          return doRequest(url, granularity, start, end, missingDaysDeferred);
        }
      }

    }

    function getDateRangeForPeriod(count, period) {
      var start = moment().startOf(period).subtract(count, period + 's').format('YYYY-MM-DD');
      var end = moment().startOf(period).subtract(1, 'days').format('YYYY-MM-DD');
      return { start: start, end: end };
    }

    function loadPeriodCallData(period, count, granularity, deviceCategories, api, missingDaysDeferred) {
      var dateRange = getDateRangeForPeriod(count, period);
      var start = dateRange.start;
      var end = dateRange.end;

      if (api === 'mock') {
        return DeviceUsageMockData.getRawDataPromise(start, end).then(function (data) {
          return reduceAllData(data, granularity);
        });
      } else if (api === 'local') {
        var url = localUrlBase + '/' + Authinfo.getOrgId() + '/reports/device/call?';
        url = url + 'intervalType=' + intervalType; // As long week and month is not implemented
        url = url + '&rangeStart=' + start + '&rangeEnd=' + end;
        url = url + '&deviceCategories=' + deviceCategories.join();
        url = url + '&accounts=__';
        url = url + '&sendMockData=false';
        return doRequest(url, granularity, start, end, missingDaysDeferred);
      } else {
        url = urlBase + '/' + Authinfo.getOrgId() + '/reports/device/call?';
        url = url + 'intervalType=' + intervalType; // As long week and month is not implemented
        url = url + '&rangeStart=' + start + '&rangeEnd=' + end;
        url = url + '&deviceCategories=' + deviceCategories.join();
        url = url + '&accounts=__';
        return doRequest(url, granularity, start, end, missingDaysDeferred);
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
            totalDuration: 0,
            pairedCount: 0,
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
            pairedCount: 0,
            deviceCategories: {},
            accountIds: {}
          };
        }
        result[date].callCount += item.callCount;
        result[date].totalDuration += item.totalDuration;
        result[date].pairedCount += item.pairedCount;
        if (!result[date].deviceCategories[item.deviceCategory]) {
          result[date].deviceCategories[item.deviceCategory] = {
            deviceCategory: item.deviceCategory,
            totalDuration: item.totalDuration,
            callCount: item.callCount,
            pairedCount: item.pairedCount
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
            pairedCount: item.pairedCount
          };
        } else if (item.accountId) {
          result[date].accountIds[item.accountId].totalDuration += item.totalDuration;
          result[date].accountIds[item.accountId].callCount += item.callCount;
          result[date].accountIds[item.accountId].pairedCount += item.pairedCount;
        }
        return result;
      }, {}).map(function (value, key) {
        value.totalDuration = (value.totalDuration / 3600).toFixed(2);
        var timeFormatted = key.substr(0, 4) + '-' + key.substr(4, 2) + '-' + key.substr(6, 2);
        value.time = timeFormatted;
        return value;
      }).value();
      return reduced;
    }

    function extractAndSortAccounts(reduced) {
      $log.info("sequence before sorting", reduced);
      var sequence = _.chain(reduced).map(function (value) {
        return value.accountIds;
      })
        .reduce(function (result, value) {
          _.each(value, function (item) {
            if (!result[item.accountId]) {
              result[item.accountId] = {
                callCount: item.callCount,
                pairedCount: item.pairedCount,
                totalDuration: item.totalDuration
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

      $log.info('sequence after sorting', sequence);
      return sequence;
    }

    function extractStats(reduced, count) {
      var accounts = extractAndSortAccounts(reduced);
      var n = count || 5;
      var stats = {
        most: _.take(accounts, n),
        least: _.takeRight(accounts, n).reverse(),
        noOfDevices: accounts.length,
        noOfCalls: calculateTotal(accounts).noOfCalls,
        totalDuration: calculateTotal(accounts).totalDuration
      };
      $log.info('Extracted stats:', stats);
      return stats;
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

    function getLineChart() {
      return {
        'type': 'serial',
        'categoryField': 'time',
        'dataDateFormat': 'YYYY-MM-DD',
        'addClassNames': true,
        'categoryAxis': {
          'minPeriod': 'DD',
          'parseDates': true,
          'autoGridCount': true,
          'title': 'Last 7 Days',
          'centerLabels': true,
          'equalSpacing': true
        },
        'listeners': [],
        'export': {
          'enabled': true
        },
        'chartCursor': {
          'enabled': true,
          'categoryBalloonDateFormat': 'YYYY-MM-DD',
          //'valueLineEnabled': true,
          //'valueLineBalloonEnabled': true,
          'cursorColor': chartColors.primaryColorDarker,
          'cursorAlpha': 0.5,
          'valueLineAlpha': 0.5
        },
        // 'chartScrollbar': {
        //   'scrollbarHeight': 2,
        //   'offset': -1,
        //   'backgroundAlpha': 0.1,
        //   'backgroundColor': '#888888',
        //   'selectedBackgroundColor': '#67b7dc',
        //   'selectedBackgroundAlpha': 1
        // },
        'trendLines': [

        ],
        'graphs': [
          {
            'type': 'column', //line', //smoothedLine', //column',
            'labelText': '[[value]]',
            'labelPosition': 'top',
            //'bullet': 'round',
            'id': 'video',
            'title': $translate.instant('reportsPage.usageReports.callDuration'),
            'valueField': 'totalDuration',
            'lineThickness': 2,
            'fillAlphas': 0.6,
            'lineAlpha': 0.0,
            //'bulletSize': 10,
            'lineColor': chartColors.primaryColorDarker,
            'bulletColor': '#ffffff',
            'bulletBorderAlpha': 1,
            'useLineColorForBulletBorder': true
          }
          /*
          {
            'bullet': 'diamond',
            'id': 'whiteboarding',
            'title': 'Whiteboarding',
            'valueField': 'whiteboarding',
            'lineThickness': 2,
            'bulletSize': 6,
            'lineColor': chartColors.primaryColorLight
          }
          */
        ],
        'guides': [

        ],
        'valueAxes': [
          {
            'id': 'ValueAxis-1',
            'title': $translate.instant('reportsPage.usageReports.callHours')
          }
        ],
        'allLabels': [

        ],
        'balloon': {
          'cornerRadius': 4
        },
        'legend': {
          'enabled': false,
          'useGraphSettings': true,
          'valueWidth': 100
        },
        'titles': [
          {
            'id': 'Title-1',
            'size': 15,
            'text': $translate.instant('reportsPage.usageReports.deviceUsage')
          }
        ]
      };
    }

    function exportRawData(startDate, endDate, api) {
      var granularity = "day";
      var deviceCategories = ['ce', 'sparkboard'];
      var baseUrl = '';
      if (api === 'mock') {
        return;
      }
      if (api === 'local') {
        baseUrl = localUrlBase;
      } else {
        baseUrl = urlBase;
      }
      var url = baseUrl + '/' + Authinfo.getOrgId() + '/reports/device/call/export?';
      url = url + 'intervalType=' + granularity;
      url = url + '&rangeStart=' + startDate + '&rangeEnd' + endDate;
      //url = url + '&rangeStart=' + dateRange.start + '&rangeEnd=' + dateRange.end;
      url = url + '&deviceCategories=' + deviceCategories.join();
      url = url + '&accounts=__';
      url = url + '&sendMockData=false';

      $log.info("Trying to export data using url:", url);
      return downloadReport(url);
    }

    // Mainly copied from Helpdesk's downloadReport
    // TODO: Find a better way ?
    function downloadReport(url) {
      return $http.get(url, {
        responseType: 'arraybuffer'
      }).success(function (data) {
        var fileName = 'device-usage.csv';
        var file = new $window.Blob([data], {
          type: 'application/json'
        });
        if ($window.navigator.msSaveOrOpenBlob) {
          // IE
          $window.navigator.msSaveOrOpenBlob(file, fileName);
        } else if (!('download' in $window.document.createElement('a'))) {
          // Safari…
          $window.location.href = $window.URL.createObjectURL(file);
        } else {
          var downloadContainer = angular.element('<div data-tap-disabled="true"><a></a></div>');
          var downloadLink = angular.element(downloadContainer.children()[0]);
          downloadLink.attr({
            'href': $window.URL.createObjectURL(file),
            'download': fileName,
            'target': '_blank'
          });
          $document.find('body').append(downloadContainer);
          $timeout(function () {
            downloadLink[0].click();
            downloadLink.remove();
          }, 100);
        }
      });
    }

    function resolveDeviceData(devices) {
      var promises = [];
      _.each(devices, function (device) {
        promises.push($http.get(csdmUrl + device.accountId)
          .then(function (res) {
            $log.info("resolving", res);
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
      getDataForPeriod: getDataForPeriod,
      getDataForLastWeek: getDataForLastWeek,
      getDataForLastMonth: getDataForLastMonth,
      getDataForLastMonths: getDataForLastMonths,
      getDataForRange: getDataForRange,
      getLineChart: getLineChart,
      getDatesForLastWeek: getDatesForLastWeek,
      getDatesForLastMonths: getDatesForLastMonths,
      exportRawData: exportRawData,
      extractStats: extractStats,
      resolveDeviceData: resolveDeviceData,
      getDataForLastNTimeUnits: getDataForLastNTimeUnits,
      getDateRangeForPeriod: getDateRangeForPeriod,
      getDateRangeForLastNTimeUnits: getDateRangeForLastNTimeUnits,
      reduceAllData: reduceAllData
    };
  }
}());
