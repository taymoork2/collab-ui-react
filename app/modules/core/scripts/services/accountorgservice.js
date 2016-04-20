'use strict';

angular
  .module('Core')
  .service('AccountOrgService', AccountOrgService);

/* @ngInject */
function AccountOrgService($http, $rootScope, Config, Auth, UrlConfig) {
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
    getOrgSettings: getOrgSettings
  };

  return service;

  function getAccount(org) {
    var url = accountUrl + 'organization/' + org + '/accounts';

    return $http.get(url);
  }

  function getServices(org, filter) {
    var url = accountUrl + 'organizations/' + org + '/services';
    if (!_.isUndefined(filter) && !_.isNull(filter)) {
      url += '?filter=' + filter;
    }

    return $http.get(url);
  }

  function addMessengerInterop(org) {
    var url = accountUrl + 'organizations/' + org + '/services/messengerInterop';
    var request = {};

    return $http.post(url, request);
  }

  function deleteMessengerInterop(org) {
    var url = accountUrl + 'organizations/' + org + '/services/messengerInterop';

    return $http.delete(url);
  }

  function addOrgCloudSipUri(org, cloudSipUri) {
    var url = accountUrl + 'organization/' + org + '/settings';
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
    var url = accountUrl + 'organization/' + org + '/settings';
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
    var url = accountUrl + 'organization/' + org + '/settings';
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
    var url = accountUrl + 'organization/' + org + '/settings/' + org;

    return $http.delete(url);
  }

  function getOrgSettings(org) {
    var url = accountUrl + 'organization/' + org + '/settings/' + org;

    return $http.get(url);
  }
}
