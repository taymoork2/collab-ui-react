(function () {
  'use strict';

  angular.module('Core')
    .controller('BrandingCtrl', BrandingCtrl);

  function BrandingCtrl($scope, $translate, $timeout, $modal, Authinfo, Notification, Log, Utils, WebexClientVersion, BrandService, Orgservice) {

    var orgId = Authinfo.getOrgId();

    $scope.isPartner = Authinfo.isPartner();
    $scope.usePartnerLogo = true;
    $scope.allowCustomerLogos = false;
    $scope.allowCustomerLogos = false;
    $scope.progress = 0;

    $scope.logoCriteria = {
      'pattern': '.png',
      'width': {
        min: '100'
      }
    };

    $scope.useLatestWbxVersion = false;
    $scope.wbxclientversionselected = '';
    $scope.wbxclientversions = ['testversion1.0', 'testversion2.0'];
    $scope.wbxNoClientSelected = true;
    $scope.wbxclientversionplaceholder = $translate.instant('partnerProfile.selectAWbxClientVersion');
    this.wbxclientversionplaceholder = 'Select webex client version';
    $scope.showClientVersions = true;

    $scope.init = function () {

      $scope.logoUrl = '';
      $scope.logoError = null;

      Orgservice.getOrg(function (data, status) {
        if (data.success) {
          var settings = data.orgSettings;
          if (!_.isUndefined(settings.usePartnerLogo)) {
            $scope.usePartnerLogo = settings.usePartnerLogo;
          }

          if (!_.isUndefined(settings.allowCustomerLogos)) {
            $scope.allowCustomerLogos = settings.allowCustomerLogos;
          }

          if (!_.isUndefined(settings.logoUrl)) {
            $scope.logoUrl = settings.logoUrl;
          }

        } else {
          Log.debug('Get existing org failed. Status: ' + status);
        }

      }, orgId, true);

      BrandService.getLogoUrl(orgId).then(function (logoUrl) {
        $scope.tempLogoUrl = logoUrl;
      });

      $scope.initWbxClientVersions();
    };

    // TODO webex team clean this up and add unit tests
    $scope.initWbxClientVersions = function () {

      //wbxclientversionselected
      //$scope.wbxclientversions = "";
      var succ = function (data) {
        $scope.wbxclientversions = data;
      };

      //nothing to do on error.
      WebexClientVersion.getWbxClientVersions().then(succ);
      //will need to do more stuff here. Init selected version as well.
      //disable drop down ... but maybe not.

      var p = WebexClientVersion.getPartnerIdGivenOrgId(orgId).then(function (resp) {
        return WebexClientVersion.getTemplate(_.get(resp, 'data.partnerId'));
      });

      //var p = WebexClientVersion.getTemplate(orgId)

      p.then(function (json) {
        var clientVersion = _.get(json, 'data.clientVersion');
        if (clientVersion === 'latest') {
          clientVersion = '';
        }
        if (clientVersion === '') {
          $scope.wbxNoClientSelected = true;
          $scope.wbxclientversionselected = $scope.wbxclientversionplaceholder;
        } else {
          $scope.wbxNoClientSelected = false;
          $scope.wbxclientversionselected = clientVersion;
        }

        $scope.useLatestWbxVersion = _.get(json, 'data.useLatest');

      });
    };

    $scope.init();

    function toggleWebexSelectLatestVersionAlways(useLatest) {
      Log.info("webex use latest version toggle");
      var selected = $scope.wbxclientversionselected;
      $scope.useLatestWbxVersion = useLatest;
      var alwaysSelectLatest = $scope.useLatestWbxVersion;
      //WebexClientVersion.toggleWebexSelectLatestVersionAlways(orgId, $scope.allowCustomerWbxClientVersions);
      var p = WebexClientVersion.getPartnerIdGivenOrgId(orgId).then(function (resp) {
        return resp.data.partnerId; //this is the pid
      }).then(function (pid) {
        return WebexClientVersion.postOrPutTemplate(pid, selected, $scope.useLatestWbxVersion);
      });
      //var p = WebexClientVersion.postOrPutTemplate(orgId, selected, $scope.useLatestWbxVersion);
      var successMessage = "";
      if (alwaysSelectLatest) {
        successMessage = $translate.instant('partnerProfile.webexVersionUseLatestTrue');
      } else {
        successMessage = $translate.instant('partnerProfile.webexVersionUseLatestFalse');
      }
      var failureMessage = $translate.instant('partnerProfile.webexVersionUseLatestUpdateFailed');
      p.then(function (s) {
        Notification.notify([successMessage], 'success');
      }).catch(function (e) {
        Notification.notify([failureMessage], 'success');
      });

      //Notification.notify([$translate.instant('partnerProfile.webexVersion')], 'success');
      //Notification.notify([$translate.instant('partnerProfile.orgSettingsError')], 'error');
    }

    function wbxclientversionselectchanged(wbxclientversionselected) {
      Log.info("Webex selected version changed");
      $scope.wbxclientversionselected = wbxclientversionselected;
      var versionSelected = $scope.wbxclientversionselected;

      var p = WebexClientVersion.getPartnerIdGivenOrgId(orgId).then(function (resp) {
        return resp.data.partnerId; //this is the pid
      }).then(function (pid) {
        return WebexClientVersion.postOrPutTemplate(pid, versionSelected, $scope.useLatestWbxVersion);
      });

      //var p = WebexClientVersion.postOrPutTemplate(orgId, versionSelected, $scope.useLatestWbxVersion);

      Log.info("New version selected is " + versionSelected);
      var successMessage = $translate.instant('partnerProfile.webexClientVersionUpdated');
      var failureMessage = $translate.instant('partnerProfile.webexClientVersionUpdatedFailed');

      p.then(function (s) {
        Notification.notify([successMessage], 'success');
      }).catch(function (e) {
        Notification.notify([failureMessage], 'success');
      });

      //Notification.notify([$translate.instant('partnerProfile.webexVersion')], 'success');
      //Notification.notify([$translate.instant('partnerProfile.orgSettingsError')], 'error');
    }

    this.wbxclientversionselectchanged = wbxclientversionselectchanged;

    $scope.wbxclientversionselectchanged = _.debounce(
      wbxclientversionselectchanged,
      2000, {
        'leading': true,
        'trailing': false
      });

    $scope.toggleWebexSelectLatestVersionAlways = _.debounce(
      toggleWebexSelectLatestVersionAlways,
      100, {
        'leading': true,
        'trailing': false
      });

    $scope.upload = function (file, event) {
      openModal('sm');
      if (validateLogo(file)) {
        $scope.progress = 0;
        BrandService.upload(orgId, file)
          .then(uploadSuccess, uploadError, uploadProgress);
      }
    };

    // TODO: Refactor to use appconfig states
    function openModal(size) {
      $scope.uploadModal = $modal.open({
        scope: $scope,
        templateUrl: 'modules/core/partnerProfile/brandingUpload.tpl.html',
        size: size
      });
    }

    $scope.toggleLogo = _.debounce(function (value) {
      if (value) {
        BrandService.usePartnerLogo(orgId);
      } else {
        BrandService.useCustomLogo(orgId);
      }
    }, 2000, {
      'leading': true,
      'trailing': false
    });

    $scope.toggleAllowCustomerLogos = _.debounce(function (value) {
      if (value) {
        BrandService.enableCustomerLogos(orgId);
      } else {
        BrandService.disableCustomerLogos(orgId);
      }
    }, 2000, {
      'leading': true,
      'trailing': false
    });

    $scope.upload = function (file, event) {
      openModal('sm');
      if (validateLogo(file)) {
        $scope.progress = 0;
        BrandService.upload(orgId, file)
          .then(uploadSuccess, uploadError, uploadProgress);
      }
    };
    // Add branding example static page
    $scope.showBrandingExample = function (type) {
      $scope.type = type;
      $modal.open({
        scope: $scope,
        templateUrl: 'modules/core/partnerProfile/branding/brandingExample.tpl.html',
        size: 'lg'
      });
    };

    // TODO: Refactor to use appconfig states
    function openModal(size) {
      $scope.uploadModal = $modal.open({
        scope: $scope,
        templateUrl: 'modules/core/partnerProfile/branding/brandingUpload.tpl.html',
        size: size
      });
    }

    function validateLogo(logo) {
      var error = logo.$error;
      if (error === 'maxWidth' || error === 'minWidth') {
        $scope.logoError = 'dimensions';
      } else {
        $scope.logoError = logo.$error;
      }

      if (logo && !logo.$error) {
        return true;
      }
    }

    function uploadSuccess(response) {
      $timeout(function () {
        if ($scope.uploadModal) {
          $scope.uploadModal.close();
        }
      }, 3000);
      // Automatically start using the custom logo
      BrandService.resetCdnLogo(Authinfo.getOrgId());
      $scope.usePartnerLogo = false;
      $scope.toggleLogo(false);
    }

    function uploadError(error) {
      $scope.logoError = 'unknown';
    }

    function uploadProgress(evt) {
      $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
    }
  }

})();
