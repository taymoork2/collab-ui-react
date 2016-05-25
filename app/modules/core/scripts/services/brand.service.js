(function () {
  'use strict';

  angular
    .module('Core')
    .factory('BrandService', BrandService);

  /* @ngInject */
  function BrandService($http, $q, $translate, Config, Log, Notification, Orgservice, Upload, UrlConfig) {

    var service = {
      'getSettings': getSettings,
      'getLogoUrl': getLogoUrl,
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
            var settings = data.orgSettings;
            if (!_.isEmpty(settings)) {
              resolve({
                'usePartnerLogo': settings.usePartnerLogo,
                'allowCustomerLogos': settings.allowCustomerLogos,
                'logoUrl': settings.logoUrl
              });
            } else {
              reject();
            }
          } else {
            Log.debug('Get existing org failed. Status: ' + status);
            reject();
          }
        }, orgId, true);
      });
    }

    function getLogoUrl(orgId) {
      var downloadUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + orgId + '/logo/downloadUrl';

      return $http.get(downloadUrl).then(function (response) {
        return response.data.tempURL;
      });
    }

    function usePartnerLogo(orgId) {
      var settings = {
        'usePartnerLogo': true
      };

      return setOrgSetting(orgId, settings);
    }

    function useCustomLogo(orgId) {
      var settings = {
        'usePartnerLogo': false
      };

      return setOrgSetting(orgId, settings);
    }

    function enableCustomerLogos(orgId) {
      var settings = {
        'allowCustomerLogos': true
      };

      return setOrgSetting(orgId, settings);
    }

    function disableCustomerLogos(orgId) {
      var settings = {
        'allowCustomerLogos': false
      };

      return setOrgSetting(orgId, settings);
    }

    function setOrgSetting(orgId, settings) {
      return Orgservice.setOrgSettings(orgId, settings)
        .then(notifySuccess)
        .catch(notifyError);
    }

    function resetCdnLogo(orgId) {
      var purgeCDNUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + orgId + '/logo/purgeFromCDN';

      return $http.post(purgeCDNUrl);
    }

    function upload(orgId, file) {
      var uploadUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + orgId + '/logo/uploadUrl';

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

    function notifySuccess() {
      Notification.success('partnerProfile.processing');
    }

    function notifyError(response) {
      Notification.errorResponse(response, 'errors.statusError', {
        status: response.status
      });
    }
  }
})();
