(function () {
  'use strict';

  angular.module('Core')
    .service('AccountService', AccountService);

  /* @ngInject */
  function AccountService($http, LogMetricsService, Log, UrlConfig) {
    return {
      createAccount: function (customerOrgName, customerAdminEmail, partnerAdminEmail, isPartner, beId, begeoId, duration, licenseCount, offersList, startDate) {
        var accountUrl = UrlConfig.getAdminServiceUrl() + 'accounts';
        var accountRequest = {
          'offers': []
        };

        for (var i in offersList) {
          accountRequest.offers.push({
            'id': offersList[i],
            'licenseCount': licenseCount
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
            .success(function (data, status) {
              LogMetricsService.logMetrics('Start Organization', LogMetricsService.getEventType('organizationCreated'), LogMetricsService.getEventAction('buttonClick'), status, moment(), 1, null);
            })
            .error(function (data, status) {
              LogMetricsService.logMetrics('Start Organization', LogMetricsService.getEventType('organizationCreated'), LogMetricsService.getEventAction('buttonClick'), status, moment(), 1, null);
            });
        }
      },

      getAccount: function (accountId, callback) {
        var accountUrl = UrlConfig.getAdminServiceUrl() + 'accounts/' + accountId;

        $http.get(accountUrl)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
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
          data: payload
        })
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            Log.debug('Posted orgDataForAccount: ' + payload);
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
          });
      }
    };
  }
})();
