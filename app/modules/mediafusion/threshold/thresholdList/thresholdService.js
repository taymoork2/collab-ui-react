(function () {
  'use strict';

  //Defining a utilizationService.
  angular.module('Mediafusion')
    .service('ThresholdService', ThresholdService);

  /* @ngInject */
  function ThresholdService($http, $rootScope, Config, Authinfo, Log, Utils, Auth, UrlConfig) {

    //Fetching the Base url form config.js file.
    var searchfilter = 'filter=%s';
    var baseUrl = UrlConfig.getMetricsServiceUrl();

    var thresholdService = {

      queryThresholdList: function (pgNo, parentId, callback) {

        var queryParams = "?parentId=" + parentId;
        var thresholdListUrl = Utils.sprintf(baseUrl + '/threshold/allThreshold', [Authinfo.getOrgId()]);
        thresholdListUrl = thresholdListUrl + queryParams;

        //Actual rest call to get meeting info from server and also error case is handeled.
        $http.get(thresholdListUrl)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            data.status = status;
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
            var description = null;
            var errors = data.Errors;
            if (errors) {
              description = errors[0].description;
            }
          });
      },

      listMetricTypes: function (callback) {

        var metricTypesListUrl = Utils.sprintf(baseUrl + '/threshold/metricType', [Authinfo.getOrgId()]);

        $http.get(metricTypesListUrl)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            data.status = status;
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
            var description = null;
            var errors = data.Errors;
            if (errors) {
              description = errors[0].description;
            }
          });
      },

      listMetricCounters: function (metricType, callback) {

        var queryParams = "?metricType=" + metricType;

        var metricCountersListUrl = Utils.sprintf(baseUrl + '/threshold/metricCounter', [Authinfo.getOrgId()]);
        metricCountersListUrl = metricCountersListUrl + queryParams;

        $http.get(metricCountersListUrl)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            data.status = status;
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
            var description = null;
            var errors = data.Errors;
            if (errors) {
              description = errors[0].description;
            }
          });
      },

      listMetricInsCounters: function (metricType, metricCounter, callback) {

        var queryParams = "?metricType=" + metricType + "&counter=" + metricCounter;

        var metricCountersListUrl = Utils.sprintf(baseUrl + '/threshold/metricCounterInstance', [Authinfo.getOrgId()]);
        metricCountersListUrl = metricCountersListUrl + queryParams;

        $http.get(metricCountersListUrl)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            data.status = status;
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
            var description = null;
            var errors = data.Errors;
            if (errors) {
              description = errors[0].description;
            }
          });
      },

      listEvents: function (callback) {

        //var eventNamesListUrl = Utils.sprintf(baseUrl + '/threshold/eventNames', [Authinfo.getOrgId()]);

        var eventNamesListUrl = Utils.sprintf("http://10.104.121.51:8080/faultrest/mediafusion/v1/eventcatalog/all", [Authinfo.getOrgId()]);

        $http.get(eventNamesListUrl)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            data.status = status;
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
            var description = null;
            var errors = data.Errors;
            if (errors) {
              description = errors[0].description;
            }
          });
      },

      listSystemTypes: function (callback) {

        var sysTypesListUrl = Utils.sprintf(baseUrl + '/threshold/allSystemTypes', [Authinfo.getOrgId()]);

        $http.get(sysTypesListUrl)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            data.status = status;
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
            var description = null;
            var errors = data.Errors;
            if (errors) {
              description = errors[0].description;
            }
          });
      },

      listSystems: function (systemType, callback) {

        var queryParams = "?type=" + systemType;

        var sysNamesListUrl = Utils.sprintf(baseUrl + '/threshold/system', [Authinfo.getOrgId()]);
        sysNamesListUrl = sysNamesListUrl + queryParams;

        $http.get(sysNamesListUrl)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            data.status = status;
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
            var description = null;
            var errors = data.Errors;
            if (errors) {
              description = errors[0].description;
            }
          });
      },

      addThreshold: function (threshold, callback) {

        var addThresholdUrl = Utils.sprintf(baseUrl + '/threshold/add', [Authinfo.getOrgId()]);

        $http.post(addThresholdUrl, threshold)
          .success(function (data, status) {
            //data = data || {};
            //data.success = true;
            callback(data, status);
          })
          .error(function (data, status) {
            //data = data || {};
            //data.success = false;
            //data.status = status;
            callback(data, status);
          });
      },

      addEvents: function (events, callback) {

        var addEventsUrl = Utils.sprintf('http://10.104.121.51:8080/faultrest/mediafusion/v1/eventcatalog/create', [Authinfo.getOrgId()]);

        $http.post(addEventsUrl, events)
          .success(function (data, status) {
            //data = data || {};
            //data.success = true;
            callback(data, status);
          })
          .error(function (data, status) {
            //data = data || {};
            //data.success = false;
            //data.status = status;

            callback(data, status);
          });
      },

      deleteThreshold: function (thresholdId, callback) {

        var queryParams = "?id=" + thresholdId;

        var deleteThresholdUrl = Utils.sprintf(baseUrl + '/threshold/deleteThreshold', [Authinfo.getOrgId()]);
        deleteThresholdUrl = deleteThresholdUrl + queryParams;

        $http.get(deleteThresholdUrl)
          .success(function (data, status) {
            //data = data || {};
            //data.success = true;
            callback(data, status);
          })
          .error(function (data, status) {
            //data = data || {};
            //data.success = false;
            //data.status = status;
            callback(data, status);
          });
      },

    };

    return thresholdService;

  }
})();
