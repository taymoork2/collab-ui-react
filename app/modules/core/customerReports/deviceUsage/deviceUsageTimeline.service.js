(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageTimelineService', DeviceUsageTimelineService);

  /* @ngInject */
  function DeviceUsageTimelineService($http, chartColors, DeviceUsageMockService, UrlConfig, Authinfo) {

    var localUrlBase = 'http://localhost:8080/atlas-server/admin/api/v1/organization';
    var urlBase = UrlConfig.getAdminServiceUrl() + 'organizations';

    function getDataForLastWeek(api) {
      return getDataForPeriod('week', 1, 'day', api);
    }

    function getDataForLastMonth(api) {
      return getDataForPeriod('month', 1, 'day', api);
    }

    function getDataForLastMonths(count, granularity, api) {
      return getDataForPeriod('month', count, granularity, api);
    }

    function getDataForPeriod(period, count, granularity, api) {
      return loadPeriodCallData(period, count, granularity, api);
    }

    function getDataForRange(start, end, granularity, api) {
      var startDate = moment(start);
      var endDate = moment(end);
      var now = moment();

      if (startDate.isValid() && endDate.isValid() && startDate.isBefore(endDate) && endDate.isBefore(now)) {
        if (api === 'mock') {
          return DeviceUsageMockService.getData(start, end).then(function (data) {
            return reduceAllData(data);
          });
        } else if (api === 'local') {
          var url = localUrlBase + '/1eb65fdf-9643-417f-9974-ad72cae0e10f/reports/device/call?';
          url = url + 'intervalType=' + granularity;
          url = url + '&rangeStart=' + start + '&rangeEnd=' + end;
          url = url + '&deviceCategories=ce,darling';
          return $http.get(url).then(function (response) {
            return reduceAllData(response.data.items);
          });
        } else {
          url = urlBase + '/' + Authinfo.getOrgId() + '/reports/device/call?';
          url = url + 'intervalType=' + granularity;
          url = url + '&rangeStart=' + startDate.format('YYYY-MM-DD') + '&rangeEnd=' + endDate.format('YYYY-MM-DD');
          url = url + '&deviceCategories=ce,darling';
          return $http.get(url).then(function (response) {
            return reduceAllData(response.data.items);
          });
        }
      }

    }

    function loadPeriodCallData(period, count, granularity, api) {
      var start = moment().startOf(period).subtract(count, period + 's').format('YYYY-MM-DD');
      var end = moment().startOf(period).format('YYYY-MM-DD');
      if (api === 'mock') {
        return DeviceUsageMockService.getData(start, end).then(function (data) {
          return reduceAllData(data);
        });
      } else if (api === 'local') {
        var url = localUrlBase + '/1eb65fdf-9643-417f-9974-ad72cae0e10f/reports/device/call?';
        url = url + 'intervalType=' + granularity;
        url = url + '&rangeStart=' + start + '&rangeEnd=' + end;
        url = url + '&deviceCategories=ce,darling';
        return $http.get(url).then(function (response) {
          return reduceAllData(response.data.items);
        });
      } else {
        url = urlBase + '/' + Authinfo.getOrgId() + '/reports/device/call?';
        url = url + 'intervalType=' + granularity;
        url = url + '&rangeStart=' + start + '&rangeEnd=' + end;
        url = url + '&deviceCategories=ce,darling';
        return $http.get(url).then(function (response) {
          return reduceAllData(response.data.items);
        });
      }
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
            'bullet': 'round',
            'id': 'video',
            'title': 'Call Duration',
            'valueField': 'totalDuration',
            'lineThickness': 2,
            'bulletSize': 10,
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
            'text': 'Usage Timeline (mock data)'
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
