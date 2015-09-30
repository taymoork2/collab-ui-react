(function () {
  'use strict';

  angular
    .module('Core')
    .factory('BrandService', BrandService);

  /* @ngInject */
  function BrandService($http, $q, Authinfo, Config, Log, Orgservice, Upload) {

    var service = {
      'getSettings': getSettings,
      'usePartnerLogo': usePartnerLogo,
      'useCustomLogo': useCustomLogo,
      'enableCustomerLogos': enableCustomerLogos,
      'disableCustomerLogos': disableCustomerLogos,
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

      // Temporary, don't let Partner org set global allowCustomerLogos
      // TODO: Fix admin-service PATCH issues dealing with orgSettings
      if (orgId === Authinfo.getOrgId()) {
        _.extend(settings, {
          'allowCustomerLogos': false
        });
      }

      Orgservice.setOrgSettings(orgId, settings, function (data, status) {
        return data;
      });
    }

    function useCustomLogo(orgId) {
      var settings = {
        'usePartnerLogo': false
      };
      //
      // Temporary, don't let Partner org set global allowCustomerLogos
      // TODO: Fix admin-service PATCH issues dealing with orgSettings
      if (orgId === Authinfo.getOrgId()) {
        _.extend(settings, {
          'allowCustomerLogos': false
        });
      }

      Orgservice.setOrgSettings(orgId, settings, function (data, status) {
        return data;
      });
    }

    function enableCustomerLogos(orgId) {
      var settings = {
        'allowCustomerLogos': true
      };

      Orgservice.setOrgSettings(orgId, settings, function (data, status) {
        return data;
      });
    }

    function disableCustomerLogos(orgId) {
      var settings = {
        'allowCustomerLogos': false
      };

      Orgservice.setOrgSettings(orgId, settings, function (data, status) {
        return data;
      });
    }

    function upload(orgId, file) {
      var uploadUrl = Config.getAdminServiceUrl() + 'organizations/' + orgId + '/logo/uploadUrl';
      return $http.get(uploadUrl).then(function (response) {
        return Upload.upload({
          url: response.data.tempURL,
          method: 'PUT',
          file: file
        });
      });
    }
  }
})();
