'use strict';

//Defining a FaultRuleService.
angular.module('Mediafusion')
  .service('FaultRuleService', ['$http', '$rootScope', 'Config', 'Authinfo', 'Log', 'Utils', 'Auth', 'UrlConfig',
    function ($http, $rootScope, Config, Authinfo, Log, Utils, Auth, UrlConfig) {

      //Fetching the Base url form config.js file.
      var baseUrl = UrlConfig.getFaultServiceUrl();

      var listFaultServices = {

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

        listMetricTypes: function (systemName, callback) {

          var queryParams = "?system=" + systemName;

          var metricTypesListUrl = Utils.sprintf(baseUrl + '/threshold/metricType', [Authinfo.getOrgId()]);
          metricTypesListUrl = metricTypesListUrl + queryParams;

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

        listMetricCounters: function (systemName, metricType, callback) {

          var queryParams = "?system=" + systemName + "&metricType=" + metricType;

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

        addThreshold: function (threshold, callback) {

          var addThresholdUrl = Utils.sprintf(baseUrl + '/threshold/add', [Authinfo.getOrgId()]);

          $http.post(addThresholdUrl, threshold)
            .success(function (data, status) {
              //data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              //data.success = false;
              //data.status = status;

              callback(data, status);
            });
        }

      };

      return listFaultServices;

    }
  ]);
