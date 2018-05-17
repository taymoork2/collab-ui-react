(function () {
  'use strict';

  module.exports = angular.module('core.accountOrgService', [
    require('modules/core/config/urlConfig'),
    require('modules/core/scripts/services/authinfo'),
  ])
    .service('AccountOrgService', AccountOrgService)
    .name;

  /* @ngInject */
  function AccountOrgService($http, $q, UrlConfig) {
    var accountUrl = UrlConfig.getAdminServiceUrl();

    var FileShareControlType = {
      BLOCK_BOTH: 'BLOCK_BOTH',
      BLOCK_UPLOAD: 'BLOCK_UPLOAD',
      NONE: 'NONE',
    };

    var service = {
      getAccount: getAccount,
      getServices: getServices,
      addMessengerInterop: addMessengerInterop,
      deleteMessengerInterop: deleteMessengerInterop,
      getFileSharingControl: getFileSharingControl,
      setFileSharingControl: setFileSharingControl,
    };

    return service;

    //Url returns
    function getDeviceSettingsUrl(org) {
      var url = accountUrl + 'organizations/' + org + '/settings';

      return url;
    }

    function getServicesUrl(org) {
      var url = accountUrl + 'organizations/' + org + '/services';

      return url;
    }

    function getAccount(org) {
      var url = accountUrl + 'organization/' + org + '/accounts';

      return $http.get(url);
    }

    function getServices(org, filter) {
      var url = getServicesUrl(org);
      if (!_.isUndefined(filter) && !_.isNull(filter)) {
        url += '?filter=' + filter;
      }

      return $http.get(url);
    }

    function addMessengerInterop(org) {
      var url = getServicesUrl(org) + '/messengerInterop';
      var request = {};

      return $http.post(url, request);
    }

    function deleteMessengerInterop(org) {
      var url = getServicesUrl(org) + '/messengerInterop';

      return $http.delete(url);
    }

    // Get FileSharingControl from the FileSharingControl API(boolean)
    function getFileSharingControl(org) {
      if (!org || org === '') {
        return $q.reject('A Valid organization ID must be Entered');
      }
      // TODO using hardcode first, wait for backend code
      var url = getDeviceSettingsUrl(org);
      return $http.get(url).then(function (response) {
        var fileSharingControl = {
          blockDesktopAppDownload: false,
          blockDesktopAppUpload: false,
          blockMobileAppDownload: false,
          blockMobileAppUpload: false,
          blockWebAppDownload: false,
          blockWebAppUpload: false,
          blockBotsDownload: false,
          blockBotsUpload: false,
        };
        var orgSettings = JSON.parse(response.data.orgSettings[0]);
        if (_.has(orgSettings, 'desktopFileShareControl')) {
          if (_.get(orgSettings, 'desktopFileShareControl') === FileShareControlType.BLOCK_BOTH) {
            fileSharingControl.blockDesktopAppDownload = true;
            fileSharingControl.blockDesktopAppUpload = true;
          } else if (_.get(orgSettings, 'desktopFileShareControl') === FileShareControlType.BLOCK_UPLOAD) {
            fileSharingControl.blockDesktopAppUpload = true;
          }
        }
        if (_.has(orgSettings, 'mobileFileShareControl')) {
          if (_.get(orgSettings, 'mobileFileShareControl') === FileShareControlType.BLOCK_BOTH) {
            fileSharingControl.blockMobileAppDownload = true;
            fileSharingControl.blockMobileAppUpload = true;
          } else if (_.get(orgSettings, 'mobileFileShareControl') === FileShareControlType.BLOCK_UPLOAD) {
            fileSharingControl.blockMobileAppUpload = true;
          }
        }
        if (_.has(orgSettings, 'webFileShareControl')) {
          if (_.get(orgSettings, 'webFileShareControl') === FileShareControlType.BLOCK_BOTH) {
            fileSharingControl.blockWebAppDownload = true;
            fileSharingControl.blockWebAppUpload = true;
          } else if (_.get(orgSettings, 'webFileShareControl') === FileShareControlType.BLOCK_UPLOAD) {
            fileSharingControl.blockWebAppUpload = true;
          }
        }
        if (_.has(orgSettings, 'botFileShareControl')) {
          if (_.get(orgSettings, 'botFileShareControl') === FileShareControlType.BLOCK_BOTH) {
            fileSharingControl.blockBotsDownload = true;
            fileSharingControl.blockBotsUpload = true;
          } else if (_.get(orgSettings, 'botFileShareControl') === FileShareControlType.BLOCK_UPLOAD) {
            fileSharingControl.blockBotsUpload = true;
          }
        }
        return fileSharingControl;
      });
    }

    // Sets FileSharingControl to fileSharingControl API
    function setFileSharingControl(org, fileSharingControl) {
      if (!org || org === '') {
        return $q.reject('A Valid organization ID must be Entered');
      }

      var url = getDeviceSettingsUrl(org);
      return $http.get(url).then(function (response) {
        var orgSettings = JSON.parse(response.data.orgSettings[0]); // get the latest orgSettings before patching

        if (fileSharingControl.blockDesktopAppDownload && fileSharingControl.blockDesktopAppUpload) {
          orgSettings.desktopFileShareControl = FileShareControlType.BLOCK_BOTH;
        } else if (fileSharingControl.blockDesktopAppUpload) {
          orgSettings.desktopFileShareControl = FileShareControlType.BLOCK_UPLOAD;
        } else {
          orgSettings.desktopFileShareControl = FileShareControlType.NONE;
        }

        if (fileSharingControl.blockMobileAppDownload && fileSharingControl.blockMobileAppUpload) {
          orgSettings.mobileFileShareControl = FileShareControlType.BLOCK_BOTH;
        } else if (fileSharingControl.blockMobileAppUpload) {
          orgSettings.mobileFileShareControl = FileShareControlType.BLOCK_UPLOAD;
        } else {
          orgSettings.mobileFileShareControl = FileShareControlType.NONE;
        }

        if (fileSharingControl.blockWebAppDownload && fileSharingControl.blockWebAppUpload) {
          orgSettings.webFileShareControl = FileShareControlType.BLOCK_BOTH;
        } else if (fileSharingControl.blockWebAppUpload) {
          orgSettings.webFileShareControl = FileShareControlType.BLOCK_UPLOAD;
        } else {
          orgSettings.webFileShareControl = FileShareControlType.NONE;
        }

        if (fileSharingControl.blockBotsDownload && fileSharingControl.blockBotsUpload) {
          orgSettings.botFileShareControl = FileShareControlType.BLOCK_BOTH;
        } else if (fileSharingControl.blockBotsUpload) {
          orgSettings.botFileShareControl = FileShareControlType.BLOCK_UPLOAD;
        } else {
          orgSettings.botFileShareControl = FileShareControlType.NONE;
        }

        return $http.patch(url, orgSettings);
      });
    }
  }
})();
