'use strict';

angular.module('Core')
  .service('AccountService', ['$http', '$rootScope', '$location',
    function ($http, $rootScope, $location) {
      return {
        createAccount: function (customerOrgName, customerAdminEmail, partnerAdminEmail, isPartner, beId, begeoId, duration, licenseCount, offers, startDate) {
          var accountUrl = Config.getAdminServiceUrl() + 'accounts';
          var accountRequest = {
            'offers': []
          };

          for (var i = 0; i < offers.length; i++) {
            var id = offers[i].id;
            var count = offers[i].licenseCount;
            var offer = {
              'id': id,
              'licenseCount': licenseCount
            };
            if (id !== '') {
              accountRequest.offers.push(offer);
            }
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

          if (customerOrgName.length > 0 && customerAdminEmail.length > 0 && offers.length > 0) {
            $http.post(accountUrl, accountRequest)
              .success(function (data, status) {
                LogMetricsService.logMetrics('Start Organization', LogMetricsService.getEventType('organizationCreated'), LogMetricsService.getEventAction('buttonClick'), status, moment(), 1);
              })
              .error(function (data, status) {
                LogMetricsService.logMetrics('Start Organization', LogMetricsService.getEventType('organizationCreated'), LogMetricsService.getEventAction('buttonClick'), status, moment(), 1);
              });
          }
        },

        getAccount: function (accountId, callback) {
          var accountUrl = Config.getAdminServiceUrl() + 'accounts/' + accountId;

          $http.get(accountUrl)
            .success(function (data, status) {
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },

        setOrgDataForAccount: function (accountId, orgId, partnerOrgId, customerErpId, partnerAdminEmail, customerName, callback) {
          var accountUrl = Config.getAdminServiceUrl() + 'accounts/' + accountId + '/organization/' + orgId;

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
              data.success = true;
              Log.debug('Posted orgDataForAccount: ' + payload);
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        }
      }
    }
  ]);
