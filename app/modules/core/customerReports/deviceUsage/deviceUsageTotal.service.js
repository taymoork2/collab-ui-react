(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageTotalService', DeviceUsageTotalService);

  /* @ngInject */
  function DeviceUsageTotalService($log, $q, $timeout, $http, chartColors, DeviceUsageRawService, UrlConfig, Authinfo) {

    var localUrlBase = 'http://localhost:8080/atlas-server/admin/api/v1/organization';
    var urlBase = UrlConfig.getAdminServiceUrl() + 'organizations';

    var timeoutInMillis = 10000;

    function getDataForLastWeek(deviceCategories, api) {
      $log.info("dataForLastWeek", api);
      return getDataForPeriod('week', 1, 'day', deviceCategories, api);
    }

    function getDataForLastMonth(deviceCategories, api) {
      return getDataForPeriod('month', 1, 'day', deviceCategories, api);
    }

    function getDataForLastMonths(count, granularity, deviceCategories, api) {
      return getDataForPeriod('month', count, granularity, deviceCategories, api);
    }

    function getDataForPeriod(period, count, granularity, deviceCategories, api) {
      return loadPeriodCallData(period, count, granularity, deviceCategories, api);
    }

    function getDataForRange(start, end, granularity, deviceCategories, api) {
      var startDate = moment(start);
      var endDate = moment(end);
      var now = moment();

      if (startDate.isValid() && endDate.isValid() && startDate.isBefore(endDate) && endDate.isBefore(now)) {
        if (api === 'mock') {
          return DeviceUsageRawService.getData(start, end).then(function (data) {
            return reduceAllData(data);
          });
        } else if (api === 'local') {
          var url = localUrlBase + '/1eb65fdf-9643-417f-9974-ad72cae0e10f/reports/device/call?';
          url = url + 'intervalType=' + granularity;
          url = url + '&rangeStart=' + start + '&rangeEnd=' + end;
          url = url + '&deviceCategories=' + deviceCategories.join();
          url = url + '&sendMockData=false';
          return doRequest(url);
        } else {
          url = urlBase + '/' + Authinfo.getOrgId() + '/reports/device/call?';
          url = url + 'intervalType=' + granularity;
          url = url + '&rangeStart=' + startDate.format('YYYY-MM-DD') + '&rangeEnd=' + endDate.format('YYYY-MM-DD');
          url = url + '&deviceCategories=ce,darling';
          return doRequest(url);
        }
      }

    }

    function loadPeriodCallData(period, count, granularity, deviceCategories, api) {
      var start = moment().startOf(period).subtract(count, period + 's').format('YYYY-MM-DD');
      var end = moment().startOf(period).format('YYYY-MM-DD');
      if (api === 'mock') {
        return DeviceUsageRawService.getData(start, end).then(function (data) {
          return reduceAllData(data);
        });
      } else if (api === 'local') {
        var url = localUrlBase + '/' + Authinfo.getOrgId() + '/reports/device/call?';
        url = url + 'intervalType=' + granularity;
        url = url + '&rangeStart=' + start + '&rangeEnd=' + end;
        url = url + '&deviceCategories=' + deviceCategories.join();
        //url = url + '&accounts=__';
        url = url + '&sendMockData=false';
        return doRequest(url);
      } else {
        url = urlBase + '/' + Authinfo.getOrgId() + '/reports/device/call?';
        url = url + 'intervalType=' + granularity;
        url = url + '&rangeStart=' + start + '&rangeEnd=' + end;
        url = url + '&deviceCategories=' + deviceCategories.join();
        //url = url + '&accounts=__';

        return doRequest(url);
      }
    }

    function doRequest(url) {
      var deferred = $q.defer();
      var timeout = {
        timeout: deferred.promise
      };
      $timeout(function () {
        deferred.resolve();
      }, timeoutInMillis);

      return $http.get(url, timeout).then(function (response) {
        return reduceAllData(response.data.items);
      }, function (reject) {
        return $q.reject(analyseReject(reject));
      });
    }

    function analyseReject(reject) {
      $log.info("Argh! Problems rejectinh", reject);
      if (reject.status === -1) {
        reject.statusText = 'Operation timed Out';
        reject.data = {
          message: 'Operation timed out'
        };
      }
      return reject;
    }


    function reduceAllData(items) {
      return _.chain(items).reduce(function (result, item) {
        if (typeof result[item.date] === 'undefined') {
          result[item.date] = {
            callCount: 0,
            totalDuration: 0,
            pairedCount: 0,
            deviceCategories: []
          };
        }
        result[item.date].callCount += item.callCount;
        result[item.date].totalDuration += item.totalDuration;
        result[item.date].pairedCount += item.pairedCount;
        if (!result[item.date].deviceCategories[item.deviceCategory]) {
          result[item.date].deviceCategories.push({
            deviceCategory: item.deviceCategory,
            totalDuration: item.totalDuration,
            callCount: item.callCount,
            pairedCount: item.pairedCount
          });
        } else {
          result[item.date].deviceCategories[item.deviceCategory].totalDuration += item.totalDuration;
          result[item.date].deviceCategories[item.deviceCategory].callCount += item.callCount;
          result[item.date].deviceCategories[item.deviceCategory].pairedCount += item.pairedCount;
        }
        return result;
      }, {}).map(function (value, key) {
        value.totalDuration = (value.totalDuration / 60).toFixed(2);
        value.time = key.substr(0, 4) + '-' + key.substr(4, 2) + '-' + key.substr(6, 2);
        return value;
      }).value();
    }


    function getLineChart() {
      return {
        'type': 'serial',
        'categoryField': 'time',
        'dataDateFormat': 'YYYY-MM-DD',
        'categoryAxis': {
          'minPeriod': 'DD',
          'parseDates': true,
          'autoGridCount': true
        },
        'listeners': [],
        'export': {
          'enabled': true
        },
        'chartCursor': {
          'enabled': true,
          'categoryBalloonDateFormat': 'YYYY-MM-DD',
          'valueLineEnabled': true,
          'valueLineBalloonEnabled': true,
          'cursorColor': chartColors.primaryColorDarker,
          'cursorAlpha': 0.5,
          'valueLineAlpha': 0.5
        },
        'chartScrollbar': {
          'scrollbarHeight': 2,
          'offset': -1,
          'backgroundAlpha': 0.1,
          'backgroundColor': '#888888',
          'selectedBackgroundColor': '#67b7dc',
          'selectedBackgroundAlpha': 1
        },
        'trendLines': [

        ],
        'graphs': [
          {
            'type': 'column', //line', //smoothedLine', //column',

            //'bullet': 'round',
            'id': 'video',
            'title': 'Call Duration',
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
            'title': 'Call Minutes'
          }
        ],
        'allLabels': [

        ],
        'balloon': {
          'cornerRadius': 4
        },
        'legend': {
          'enabled': true,
          'useGraphSettings': true,
          'valueWidth': 100
        },
        'titles': [
          {
            'id': 'Title-1',
            'size': 15,
            'text': 'Device Usage'
          }
        ]
      };
    }

    return {
      getDataForPeriod: getDataForPeriod,
      getDataForLastWeek: getDataForLastWeek,
      getDataForLastMonth: getDataForLastMonth,
      getDataForLastMonths: getDataForLastMonths,
      getDataForRange: getDataForRange,
      getLineChart: getLineChart
    };
  }
}());
