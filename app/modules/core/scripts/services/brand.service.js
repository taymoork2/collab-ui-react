(function () {
  'use strict';

  module.exports = angular.module('core.service.brand', [
    require('angular-cache'),
    require('ng-file-upload'),
    require('@collabui/collab-ui-ng').default,
    require('modules/core/scripts/services/org.service'),
    require('modules/core/notifications').default,
    require('modules/core/config/urlConfig'),
  ])
    .factory('BrandService', BrandService)
    .name;

  /* @ngInject */
  function BrandService($http, $q, Log, Notification, Orgservice, Upload, UrlConfig) {
    var service = {
      getSettings: getSettings,
      getLogoUrl: getLogoUrl,
      usePartnerLogo: usePartnerLogo,
      useCustomLogo: useCustomLogo,
      enableCustomerLogos: enableCustomerLogos,
      disableCustomerLogos: disableCustomerLogos,
      resetCdnLogo: resetCdnLogo,
      upload: upload,
    };
    return service;

    ////////////////

    function getSettings(orgId) {
      return $q(function (resolve, reject) {
        var params = {
          disableCache: true,
          basicInfo: true,
        };
        Orgservice.getOrg(function (data, status) {
          if (data.success) {
            var settings = data.orgSettings;
            if (!_.isEmpty(settings)) {
              resolve({
                usePartnerLogo: settings.usePartnerLogo,
                allowCustomerLogos: settings.allowCustomerLogos,
                logoUrl: settings.logoUrl,
              });
            } else {
              reject();
            }
          } else {
            Log.debug('Get existing org failed. Status: ' + status);
            reject();
          }
        }, orgId, params);
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
        usePartnerLogo: true,
      };

      return setOrgSetting(orgId, settings);
    }

    function useCustomLogo(orgId) {
      var settings = {
        usePartnerLogo: false,
      };

      return setOrgSetting(orgId, settings);
    }

    function enableCustomerLogos(orgId) {
      var settings = {
        allowCustomerLogos: true,
      };

      return setOrgSetting(orgId, settings);
    }

    function disableCustomerLogos(orgId) {
      var settings = {
        allowCustomerLogos: false,
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
            'Content-Type': 'image/png',
          },
          data: file,
        });
      });
    }

    function notifySuccess() {
      Notification.success('partnerProfile.processing');
    }

    function notifyError(response) {
      Notification.errorResponse(response, 'errors.statusError', {
        status: response.status,
      });
    }
  }
})();
