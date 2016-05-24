(function () {
  'use strict';

  angular
    .module('Core')
    .service('AccountOrgService', AccountOrgService);

  /* @ngInject */
  function AccountOrgService($http, $q, $rootScope, Config, Auth, UrlConfig) {
    var accountUrl = UrlConfig.getAdminServiceUrl();

    var service = {
      getAccount: getAccount,
      getServices: getServices,
      addMessengerInterop: addMessengerInterop,
      deleteMessengerInterop: deleteMessengerInterop,
      addOrgCloudSipUri: addOrgCloudSipUri,
      addOrgDataRetentionPeriodDays: addOrgDataRetentionPeriodDays,
      modifyOrgDataRetentionPeriodDays: modifyOrgDataRetentionPeriodDays,
      deleteOrgSettings: deleteOrgSettings,
      getOrgSettings: getOrgSettings,
      getAppSecurity: getAppSecurity,
      setAppSecurity: setAppSecurity
    };

    return service;

    //Url returns
    function getDeviceSettingUrl(org) {
      var url = accountUrl + 'organizations/' + org + '/settings';

      return url;
    }

    function getServiceUrl(org) {
      var url = accountUrl + 'organizations/' + org + '/services';

      return url;
    }

    function getAccountSettingUrl(org) {
      var url = accountUrl + 'organization/' + org + '/settings';

      return url;
    }

    function getAccount(org) {
      var url = accountUrl + 'organization/' + org + '/accounts';

      return $http.get(url);
    }

    function getServices(org, filter) {
      var url = getServiceUrl(org);
      if (!_.isUndefined(filter) && !_.isNull(filter)) {
        url += '?filter=' + filter;
      }

      return $http.get(url);
    }

    function addMessengerInterop(org) {
      var url = getServiceUrl(org) + '/messengerInterop';
      var request = {};

      return $http.post(url, request);
    }

    function deleteMessengerInterop(org) {
      var url = getServiceUrl(org) + '/messengerInterop';

      return $http.delete(url);
    }

    function addOrgCloudSipUri(org, cloudSipUri) {
      var url = getAccountSettingUrl(org);
      var request = {
        'id': org,
        'settings': [{
          'key': 'orgCloudSipUri',
          'value': cloudSipUri + '.ciscospark.com'
        }]
      };

      return $http.put(url, request);
    }

    function addOrgDataRetentionPeriodDays(org, dataRetentionPeriodDays) {
      var url = getAccountSettingUrl(org);
      var request = {
        'id': org,
        'settings': [{
          'key': 'dataRetentionPeriodDays',
          'value': dataRetentionPeriodDays
        }]
      };

      return $http.put(url, request);
    }

    function modifyOrgDataRetentionPeriodDays(org, dataRetentionPeriodDays) {
      var url = getAccountSettingUrl(org);
      var request = {
        'id': org,
        'settings': [{
          'key': 'dataRetentionPeriodDays',
          'value': dataRetentionPeriodDays
        }]
      };

      return $http.patch(url, request);
    }

    function deleteOrgSettings(org) {
      var url = getAccountSettingUrl(org) + '/' + org;

      return $http.delete(url);
    }

    function getOrgSettings(org) {
      var url = getAccountSettingUrl(org) + '/' + org;

      return $http.get(url);
    }

    // Get the account App Security Status from the enforceClientSecurity API(boolean)
    function getAppSecurity(org) {
      if (!org || org === '') {
        return $q.reject('A Valid organization ID must be Entered');
      } else {
        var url = getDeviceSettingUrl(org) + '/enforceClientSecurity';

        return $http({
          method: 'GET',
          url: url
        });
      }
    }

    // Sets the updated App Security Status to enforceClientSecurity API on Save button event
    function setAppSecurity(org, appSecurityStatus) {
      if (!org || org === '') {
        return $q.reject('A Valid organization ID must be Entered');
      } else {
        var url = getDeviceSettingUrl(org) + '/enforceClientSecurity';

        return $http({
          method: 'PUT',
          url: url,
          data: {
            enforceClientSecurity: appSecurityStatus
          }
        });
      }
    }
  }
})();
