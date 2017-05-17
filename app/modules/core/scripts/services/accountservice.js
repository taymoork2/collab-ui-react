(function () {
  'use strict';

  angular.module('Core')
    .service('AccountService', AccountService);

  /* @ngInject */
  function AccountService($http, $q, LogMetricsService, Log, UrlConfig) {
    return {
      createAccount: function (customerOrgName, customerAdminEmail, partnerAdminEmail, isPartner, beId, begeoId, duration, licenseCount, offersList, startDate) {
        var accountUrl = UrlConfig.getAdminServiceUrl() + 'accounts';
        var accountRequest = {
          'offers': [],
        };

        for (var i in offersList) {
          accountRequest.offers.push({
            'id': offersList[i],
            'licenseCount': licenseCount,
          });
        }

        accountRequest.customerOrgName = customerOrgName;
        accountRequest.customerAdminEmail = customerAdminEmail;
        accountRequest.partnerAdminEmail = partnerAdminEmail;
        accountRequest.isTrial = true;
        accountRequest.isPartner = isPartner;
        accountRequest.beId = beId;
        accountRequest.begeoId = begeoId;
        accountRequest.duration = duration;
        accountRequest.startDate = startDate;

        if (customerOrgName.length > 0 && customerAdminEmail.length > 0 && offersList.length > 0) {
          return $http.post(accountUrl, accountRequest)
            .then(function (response) {
              LogMetricsService.logMetrics('Start Organization', LogMetricsService.getEventType('organizationCreated'), LogMetricsService.getEventAction('buttonClick'), response.status, moment(), 1, null);
              return response;
            })
            .catch(function (response) {
              LogMetricsService.logMetrics('Start Organization', LogMetricsService.getEventType('organizationCreated'), LogMetricsService.getEventAction('buttonClick'), response.status, moment(), 1, null);
              return $q.reject(response);
            });
        }
      },

      getAccount: function (accountId, callback) {
        var accountUrl = UrlConfig.getAdminServiceUrl() + 'accounts/' + accountId;

        $http.get(accountUrl)
          .then(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = true;
            callback(data, response.status);
          })
          .catch(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = false;
            data.status = response.status;
            callback(data, response.status);
          });
      },

      setOrgDataForAccount: function (accountId, orgId, partnerOrgId, customerErpId, partnerAdminEmail, customerName, callback) {
        var accountUrl = UrlConfig.getAdminServiceUrl() + 'accounts/' + accountId + '/organization/' + orgId;

        var payload = {};
        if (partnerOrgId !== '') {
          payload.partnerOrgId = partnerOrgId;
        }
        if (customerErpId !== '') {
          payload.customerErpId = customerErpId;
        }
        if (partnerAdminEmail !== '') {
          payload.partnerAdminEmail = partnerAdminEmail;
        }

        $http({
          method: 'PATCH',
          url: accountUrl,
          data: payload,
        })
          .then(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = true;
            Log.debug('Posted orgDataForAccount: ' + payload);
            callback(data, response.status);
          })
          .catch(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = false;
            data.status = response.status;
            callback(data, response.status);
          });
      },
    };
  }
})();
