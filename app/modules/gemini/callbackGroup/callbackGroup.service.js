(function () {
  'use strict';

  angular
    .module('Gemini')
    .service('cbgService', cbgService);

  /* @ngInject */
  function cbgService($http, $translate, UrlConfig) {
    var geminURL = UrlConfig.getGeminiUrl();
    var URL = {
      coutries: geminURL + 'countries',
      downloadCountryUrl: 'https://hfccap12.qa.webex.com/ccaportal/resources/excel/countries_regions_template.xls', // TODO the backend will provid another link
      updateCallbackGroup: geminURL + 'callbackgroup/',
      callbackGroup: geminURL + 'callbackgroup/customerId/',
      activityLogs: geminURL + 'activityLogs'
    };
    var service = {
      moveSite: moveSite,
      postRequest: postRequest,
      getCountries: getCountries,
      cbgsExportCSV: cbgsExportCSV,
      getCallbackGroups: getCallbackGroups,
      getOneCallbackGroup: getOneCallbackGroup,
      updateCallbackGroup: updateCallbackGroup,
      downloadCountryUrl: URL.downloadCountryUrl,
      postNote: postNote,
      listNotes: listNotes,
      listActivityLog: listActivityLog
    };
    return service;

    function getCallbackGroups(customerId) {
      return $http.get(URL.callbackGroup + customerId).then(extractData);
    }

    function getOneCallbackGroup(customerId, groupId) {
      return $http.get(URL.callbackGroup + customerId + '/groupId/' + groupId).then(extractData);
    }

    function updateCallbackGroup(data) {
      return $http.put(URL.updateCallbackGroup, data).then(extractData);
    }

    function getCountries() {
      return $http.get(URL.coutries).then(extractData);
    }

    function postRequest(customerId, data) {
      return $http.post(URL.callbackGroup + customerId, data).then(extractData);
    }

    function moveSite(customerId, data) {
      return $http.put(URL.callbackGroup + customerId + '/movesite', data).then(extractData);
    }

    function postNote(data) {
      var url = URL.activityLogs;
      return $http.post(url, data).then(extractData);
    }

    function listNotes(customerId, ccaGroupId) {
      var url = URL.activityLogs + '/' + customerId + '/' + ccaGroupId + '/add_note';
      return $http.get(url).then(extractData);
    }

    function listActivityLog(customerId) {
      var url = URL.activityLogs + '/' + customerId + '/Callback%20Group';
      return $http.get(url).then(extractData);
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
