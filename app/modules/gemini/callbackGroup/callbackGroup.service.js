(function () {
  'use strict';

  angular
    .module('Gemini')
    .service('cbgService', cbgService);

  /* @ngInject */
  function cbgService($http, $translate, UrlConfig) {
    var URL = UrlConfig.getGeminiUrl() + 'callbackgroup/';
    var service = {
      getNotes: getNotes,
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
      updateCallbackGroupStatus: updateCallbackGroupStatus,
    };
    return service;

    function getCallbackGroups(customerId) {
      var url = URL + 'customerId/' + customerId;
      return $http.get(url).then(extractData);
    }

    function getOneCallbackGroup(customerId, groupId) {
      var url = URL + 'customerId/' + customerId + '/groupId/' + groupId;
      return $http.get(url).then(extractData);
    }

    function updateCallbackGroup(data) {
      return $http.put(URL, data).then(extractData);
    }

    function updateCallbackGroupStatus(customerId, ccaGroupId, operation, data) {
      if (!data) {
        data = {};
      }
      var url = URL + 'customerId/' + customerId + '/groupId/' + ccaGroupId + '/status/' + operation;
      if (operation === 'cancel' || operation === 'decline') {
        url = URL + 'customerId/' + customerId + '/groupId/' + ccaGroupId + '/' + operation;
      }
      return $http.put(url, data).then(extractData);
    }

    function getCountries() {
      var url = UrlConfig.getGeminiUrl() + 'countries';
      return $http.get(url).then(extractData);
    }

    function postRequest(customerId, data) {
      var url = URL + 'customerId/' + customerId;
      return $http.post(url, data).then(extractData);
    }

    function moveSite(data) {
      var url = URL + 'movesite';
      return $http.put(url, data).then(extractData);
    }

    function postNote(data) {
      var url = UrlConfig.getGeminiUrl() + 'activityLogs';
      return $http.post(url, data).then(extractData);
    }

    function getNotes(customerId, ccaGroupId) {
      var url = UrlConfig.getGeminiUrl() + 'activityLogs' + '/' + customerId + '/' + ccaGroupId + '/add_notes_cg';
      return $http.get(url).then(extractData);
    }

    function getHistories(customerId, ccaGroupId, groupName) {
      var url = UrlConfig.getGeminiUrl() + 'activityLogs' + '/' + customerId + '/' + ccaGroupId + '/Callback%20Group/' + groupName;
      return $http.get(url).then(extractData);
    }

    function getDownloadCountryUrl() {
      return UrlConfig.getGeminiUrl() + 'files/templates/country_regions_template';
    }

    function extractData(response) {
      return response.data;
    }

    function cbgsExportCSV(customerId) {
      var lines = [];
      var exportedLines = [];
      return getCallbackGroups(customerId).then(function (res) {
        lines = res.content.data.body;
        var headerLine = {
          groupName: $translate.instant('gemini.cbgs.field.cbgName'),
          totalSites: $translate.instant('gemini.cbgs.field.totalSites'),
          status: $translate.instant('gemini.cbgs.field.status_'),
          customerAttribute: $translate.instant('gemini.cbgs.field.alias'),
          sites: $translate.instant('gemini.cbgs.field.sites'),
        };

        exportedLines.push(headerLine);
        if (!lines.length) {
          return exportedLines; // only export the header when is empty
        }
        _.forEach(lines, function (line) {
          exportedLines = exportedLines.concat(formateCsvData(line));
        });
        return exportedLines;
      });
    }

    function formateCsvData(data) {
      var newData = [];
      var oneLine = {};
      var cabte = data.customerAttribute;
      var groupName = (data.groupName ? data.groupName : data.customerName);
      var status = (data.status ? $translate.instant('gemini.cbgs.field.status.' + data.status) : '');
      cabte = (_.isNumber(cabte) ? '="' + cabte + '"' : cabte);
      groupName = (_.isNumber(groupName) ? '="' + groupName + '"' : groupName);

      if (!data.callbackGroupSites.length) {
        oneLine.groupName = groupName;
        oneLine.totalSites = data.totalSites;
        oneLine.status = status;
        oneLine.customerAttribute = cabte;
        oneLine.sites = '';
        newData.push(oneLine);
        return newData;
      }

      _.forEach(data.callbackGroupSites, function (row, key) {
        oneLine = {};
        if (!key) { // the first
          oneLine.groupName = groupName;
          oneLine.totalSites = data.totalSites;
          oneLine.status = status;
          oneLine.customerAttribute = cabte;
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
