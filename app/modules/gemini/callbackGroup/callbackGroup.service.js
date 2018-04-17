(function () {
  'use strict';

  angular
    .module('Gemini')
    .service('cbgService', cbgService);

  /* @ngInject */
  function cbgService($http, $translate, UrlConfig) {
    var URL = UrlConfig.getGeminiUrl() + 'callbackgroup';
    var service = {
      postNote: postNote,
      moveSite: moveSite,
      postRequest: postRequest,
      getCountries: getCountries,
      getHistories: getHistories,
      cbgsExportCSV: cbgsExportCSV,
      getCallbackGroups: getCallbackGroups,
      getOneCallbackGroup: getOneCallbackGroup,
      updateCallbackGroup: updateCallbackGroup,
      getDownloadCountryUrl: getDownloadCountryUrl,
      cancelCBSubmission: cancelCBSubmission,
    };
    return service;

    function getCallbackGroups(customerId) {
      var url = URL + '/customerId/' + customerId;
      return $http.get(url).then(extractData);
    }

    function getOneCallbackGroup(customerId, groupId) {
      var url = URL + '/customerId/' + customerId + '/groupId/' + groupId;
      return $http.get(url).then(extractData);
    }

    function updateCallbackGroup(data) {
      return $http.put(URL, data).then(extractData);
    }

    function cancelCBSubmission(customerId, ccaGroupId) {
      var url = URL + '/customerId/' + customerId + '/groupId/' + ccaGroupId + '/cancel';
      return $http.put(url, null).then(extractData);
    }

    function getCountries() {
      var url = UrlConfig.getGeminiUrl() + 'countries';
      return $http.get(url).then(extractData);
    }

    function postRequest(customerId, data) {
      var url = URL + '/customerId/' + customerId;
      return $http.post(url, data).then(extractData);
    }

    function moveSite(data) {
      var url = URL + '/movesite';
      return $http.put(url, data).then(extractData);
    }

    function postNote(data) {
      var url = UrlConfig.getGeminiUrl() + 'notes';
      return $http.post(url, data).then(extractData);
    }

    function getHistories(data) {
      var url = UrlConfig.getGeminiUrl() + 'activityLogs';
      return $http.put(url, data).then(extractData);
    }

    function getDownloadCountryUrl() {
      return UrlConfig.getGeminiUrl() + 'files/templates/country_regions_template';
    }

    function extractData(response) {
      return response.data;
    }

    function cbgsExportCSV(customerId) {
      var exportedLines = [];
      return getCallbackGroups(customerId).then(function (res) {
        var headerLine = {
          customerName: $translate.instant('gemini.cbgs.field.cbgName'),
          totalSites: $translate.instant('gemini.cbgs.field.totalSites'),
          status: $translate.instant('gemini.cbgs.field.status_'),
          customerAttribute: $translate.instant('gemini.cbgs.field.alias'),
          sites: $translate.instant('gemini.cbgs.field.sites'),
        };

        exportedLines.push(headerLine);
        if (!_.size(res)) {
          return exportedLines; // only export the header when is empty
        }
        _.forEach(res, function (line) {
          exportedLines = exportedLines.concat(formateCsvData(line));
        });
        return exportedLines;
      });
    }

    function formateCsvData(data) {
      var newData = [];
      var oneLine = {};
      var status = (data.status ? $translate.instant('gemini.cbgs.field.status.' + data.status) : '');

      if (!_.size(data.callbackGroupSites)) {
        oneLine.customerName = number2CsvString(data.groupName ? data.groupName : data.customerName);
        oneLine.totalSites = _.size(data.callbackGroupSites);
        oneLine.status = status;
        oneLine.customerAttribute = number2CsvString(data.customerAttribute);
        oneLine.sites = '';
        newData.push(oneLine);
        return newData;
      }

      _.forEach(data.callbackGroupSites, function (row, key) {
        oneLine = {};
        if (!key) { // the first
          oneLine.customerName = number2CsvString(data.groupName ? data.groupName : data.customerName);
          oneLine.totalSites = _.size(data.callbackGroupSites);
          oneLine.status = status;
          oneLine.customerAttribute = number2CsvString(data.customerAttribute);
        } else {
          oneLine.customerName = '';
          oneLine.totalSites = '';
          oneLine.status = '';
          oneLine.customerAttribute = '';
        }
        oneLine.sites = row.siteUrl;
        newData.push(oneLine);
      });
      return newData;
    }

    function number2CsvString(data) {
      var reg = /^[\d]+$/;
      return reg.test(data) ? '\t' + data + '\t' : data;
    }
  }
})();
