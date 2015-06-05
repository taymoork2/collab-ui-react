'use strict';

angular.module('Core')
  .service('AccountService', ['$http', '$rootScope', '$location',
    function ($http, $rootScope, $location) {
      return {
        createAccount: function (offers, customerOrgId, customerErpId, customerAdminEmail, isTrial, callback) {
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

          accountRequest.customerOrgId = customerOrgId;
          accountRequest.customerErpId = customerErpId;
          accountRequest.customerAdminEmail = customerAdminEmail;
          accountRequest.isTrial = isTrial;

          if (accountRequest.customerOrgId !== '' && accountRequest.customerAdminEmail !== '' && accountRequest.offers.length > 0) {
            $http.post(accountUrl, accountRequest)
              .success(function (data, status) {
                data.success = true;
                callback(data, status);
              })
              .error(function (data, status) {
                data.success = false;
                data.status = status;
                callback(data, status);
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

