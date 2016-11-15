(function () {
  'use strict';

  angular
    .module('Gemini')
    .service('cbgService', cbgService);

  /* @ngInject */
  function cbgService($http, $translate, UrlConfig) {
    var URL = {
      coutries: UrlConfig.getGeminiUrl() + 'countries',
      callbackGroup: UrlConfig.getGeminiUrl() + 'callbackgroup/customerId/'
    };
    var service = {
      postRequest: postRequest,
      getCountries: getCountries,
      cbgsExportCSV: cbgsExportCSV,
      getCallbackGroups: getCallbackGroups
    };
    return service;

    function getCallbackGroups(customerId) {
      return $http.get(URL.callbackGroup + customerId).then(extractData);
    }

    function getCountries() {
      return $http.get(URL.coutries).then(extractData);
    }

    function postRequest(customerId, data) {
      return $http.post(URL.callbackGroup + customerId, data).then(extractData);
    }

    function extractData(response) {
      return response.data;
    }

    function cbgsExportCSV(customerId) {
      var lines = [];
      var exportedLines = [];
      return getCallbackGroups(customerId).then(function (res) {
        lines = res.content.data.body;
        if (!lines.length) return [];
        var headerLine = {
          groupName: $translate.instant('gemini.cbgs.field.cbgName'),
          totalSites: $translate.instant('gemini.cbgs.field.totalSites'),
          status: $translate.instant('gemini.cbgs.field.status_'),
          customerAttribute: $translate.instant('gemini.cbgs.field.alias'),
          sites: $translate.instant('gemini.cbgs.field.sites')
        };
        exportedLines.push(headerLine);
        _.forEach(lines, function (line) {
          exportedLines = exportedLines.concat(formateCsvData(line));
        });
        return exportedLines;
      });
    }

    function formateCsvData(data) {
      var newData = [];
      var oneLine = {};
      if (!data.callbackGroupSites.length) {
        oneLine.groupName = (data.groupName ? data.groupName : data.customerName);
        oneLine.totalSites = data.totalSites;
        oneLine.status = (data.status ? $translate.instant('gemini.cbgs.field.status.' + data.status) : '');
        oneLine.customerAttribute = data.customerAttribute;
        oneLine.sites = '';
        newData.push(oneLine);
        return newData;
      }

      _.forEach(data.callbackGroupSites, function (row, key) {
        oneLine = {};
        if (!key) {
          var groupName = data.groupName ? data.groupName : data.customerName;
          groupName = (_.isNumber(groupName) ? '="' + groupName + '"' : groupName);
          oneLine.groupName = groupName;
          oneLine.totalSites = data.totalSites;
          oneLine.status = (data.status ? $translate.instant('gemini.cbgs.field.status.' + data.status) : '');
          oneLine.customerAttribute = data.customerAttribute;
        } else {
          oneLine.groupName = '';
          oneLine.totalSites = '';
          oneLine.status = '';
          oneLine.customerAttribute = '';
        }
        oneLine.sites = row.siteUrl;
        newData.push(oneLine);
      });
      return newData;
    }
  }
})();
