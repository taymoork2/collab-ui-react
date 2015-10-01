(function () {
  'use strict';

  angular
    .module('Core')
    .factory('BrandService', BrandService);

  /* @ngInject */
  function BrandService($http, $q, $translate, Authinfo, Config, Log, Notification, Orgservice, Upload) {

    var service = {
      'getSettings': getSettings,
      'usePartnerLogo': usePartnerLogo,
      'useCustomLogo': useCustomLogo,
      'enableCustomerLogos': enableCustomerLogos,
      'disableCustomerLogos': disableCustomerLogos,
      'resetCdnLogo': resetCdnLogo,
      'upload': upload
    };
    return service;

    ////////////////

    function getSettings(orgId) {
      return $q(function (resolve, reject) {
        Orgservice.getOrg(function (data, status) {
          if (data.success) {
            if (data.orgSettings && data.orgSettings.length > 0) {
              var length = data.orgSettings.length;
              var orgSettings = JSON.parse(data.orgSettings[length - 1]);
              resolve({
                'usePartnerLogo': orgSettings.usePartnerLogo,
                'allowCustomerLogos': orgSettings.allowCustomerLogos,
                'logoUrl': orgSettings.logoUrl
              });
            } else {
              Log.debug('No orgSettings found for org: ' + data.id);
              reject();
            }
          } else {
            Log.debug('Get existing org failed. Status: ' + status);
            reject();
          }
        }, orgId);
      });
    }

    function usePartnerLogo(orgId) {
      var settings = {
        'usePartnerLogo': true
      };

      Orgservice.setOrgSettings(orgId, settings, notify);
    }

    function useCustomLogo(orgId) {
      var settings = {
        'usePartnerLogo': false
      };

      Orgservice.setOrgSettings(orgId, settings, notify);
    }

    function enableCustomerLogos(orgId) {
      var settings = {
        'allowCustomerLogos': true
      };

      // Temporary, when enabling customer logos always start with partnerLogo
      // TODO: Fix admin-service PATCH issues dealing with orgSettings
      _.extend(settings, {
        'usePartnerLogo': true
      });

      Orgservice.setOrgSettings(orgId, settings, notify);
    }

    function disableCustomerLogos(orgId) {
      var settings = {
        'allowCustomerLogos': false
      };

      // Temporary, when disabling customer logos always switch to partnerLogo
      // TODO: Fix admin-service PATCH issues dealing with orgSettings
      _.extend(settings, {
        'usePartnerLogo': true
      });

      Orgservice.setOrgSettings(orgId, settings, notify);
    }

    function notify(data, status) {
      if (data.success) {
        Notification.notify([$translate.instant('partnerProfile.processing')], 'success');
      } else {
        var error = $translate.instant('errors.statusError', {
          status: status
        });

        Notification.notify(error, 'error');
      }
    }

    function resetCdnLogo(orgId) {
      var purgeCDNUrl = Config.getAdminServiceUrl() + 'organizations/' + orgId + '/logo/purgeFromCDN';

      return $http.post(purgeCDNUrl);
    }

    function upload(orgId, file) {
      var uploadUrl = Config.getAdminServiceUrl() + 'organizations/' + orgId + '/logo/uploadUrl';

      return $http.get(uploadUrl).then(function (response) {
        return Upload.http({
          url: response.data.tempURL,
          method: 'PUT',
          headers: {
            'Content-Type': 'image/png'
          },
          data: file
        });
      });
    }
  }
})();
