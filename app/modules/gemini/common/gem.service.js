(function () {
  'use strict';

  angular
    .module('Gemini')
    .service('gemService', gemService);

  /* @ngInject */
  function gemService($http, $translate, UrlConfig, Authinfo) {
    var URL = {
      spData: UrlConfig.getGeminiUrl() + 'servicepartner',
      remedyTicket: UrlConfig.getGeminiUrl() + 'customers/',
      getCountries: UrlConfig.getGeminiUrl() + 'countries',
    };
    var data = {};
    var service = {
      isAvops: isAvops,
      showError: showError,
      getSpData: getSpData,
      setStorage: setStorage,
      getStorage: getStorage,
      getRemedyTicket: getRemedyTicket,
      isServicePartner: isServicePartner,
      getByteLength: getByteLength,
      getNumberStatus: getNumberStatus,
      getTdStatus: getTdStatus,
    };
    initCountries();

    return service;

    function getSpData() {
      return $http.get(URL.spData).then(extractData);
    }

    function getRemedyTicket(customerId, entityId, type) {
      var url = URL.remedyTicket + customerId + '/type/' + type + '/entities/' + entityId + '/remedy-ticket';
      return $http.get(url).then(extractData);
    }

    function showError(errorCode) {
      var errors = $translate.instant('gemini.errorCode.' + errorCode);
      if (errors === 'gemini.errorCode.' + errorCode) {
        return $translate.instant('gemini.errorCode.genericError');
      }
      return errors;
    }

    function getByteLength(str) {
      var totalLength = 0;
      var charCode;
      for (var i = 0; i < str.length; i++) {
        charCode = str.charCodeAt(i);
        if (charCode < 0x007f) {
          totalLength = totalLength + 1;
        } else if ((0x0080 <= charCode) && (charCode <= 0x07ff)) {
          totalLength += 2;
        } else if ((0x0800 <= charCode) && (charCode <= 0xffff)) {
          totalLength += 3;
        }
      }
      return totalLength;
    }

    function isAvops() {
      return Authinfo.hasRole('Full_Admin');
    }

    function isServicePartner() {
      return Authinfo.hasRole('PARTNER_ADMIN');
    }

    function getNumberStatus() {
      var number_status = getStorage('NUMBER_STATUS');
      if (!number_status) {
        number_status = {
          NEW: 1, UPDATED: 2, DELETED: 3, NO_CHANGE: 4,
        };
        setStorage('NUMBER_STATUS', number_status);
      }

      return number_status;
    }

    function getTdStatus() {
      var td_status = getStorage('TD_STATUS');
      if (!td_status) {
        td_status = {
          EDITED: 'E', SUBMITTED: 'S', CANCELED: 'C', REJECTED: 'R', APPROVED: 'A', PROVISIONED: 'P', FAILED: 'L',
        };
        setStorage('TD_STATUS', td_status);
      }

      return td_status;
    }

    function initCountries() {
      var gmCountry = getStorage('gmCountry');
      if (!gmCountry) {
        $http.get(URL.getCountries).then(function (res) {
          var countryName2IdMapping = {};
          var countryId2NameMapping = {};
          var countryOptions = [];

          _.forEach(_.get(res, 'data'), function (item) {
            var nameKey = item.name.replace(/,/g, '#@#');
            countryName2IdMapping[nameKey] = item.id;
            countryId2NameMapping[item.id] = item.name;
            countryOptions.push({ label: item.name, value: item.id });
          });

          gmCountry = { countryName2IdMapping: countryName2IdMapping, countryId2NameMapping: countryId2NameMapping, countryOptions: countryOptions };
          setStorage('gmCountry', gmCountry);
        });
      }
    }

    function setStorage(key, val) {
      _.set(data, key, val);
      return data[key];
    }

    function getStorage(key) {
      return _.get(data, key);
    }

    function extractData(response) {
      return response.data;
    }
  }
})();
