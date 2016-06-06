(function () {
  'use strict';

  angular.module('Core')
    .controller('BrandingCtrl', BrandingCtrl);

  function BrandingCtrl($scope, $translate, $timeout, $modal, Authinfo, Notification, Log, Utils, WebexClientVersion, BrandService, Orgservice) {

    var orgId = Authinfo.getOrgId();

    this.isPartner = Authinfo.isPartner();
    this.usePartnerLogo = true;
    this.allowCustomerLogos = false;
    this.allowCustomerLogos = false;
    this.progress = 0;

    this.logoCriteria = {
      'pattern': '.png',
      'width': {
        min: '100'
      }
    };

    this.useLatestWbxVersion = false;
    this.wbxclientversionselected = '';
    this.wbxclientversions = ['testversion1.0', 'testversion2.0'];
    this.wbxNoClientSelected = true;
    this.wbxclientversionplaceholder = $translate.instant('partnerProfile.selectAWbxClientVersion');
    this.wbxclientversionplaceholder = 'Select webex client version';
    this.showClientVersions = true;

    this.init = function () {

      this.logoUrl = '';
      this.logoError = null;

      Orgservice.getOrg(function (data, status) {
        if (data.success) {
          var settings = data.orgSettings;
          if (!_.isUndefined(settings.usePartnerLogo)) {
            this.usePartnerLogo = settings.usePartnerLogo;
          }

          if (!_.isUndefined(settings.allowCustomerLogos)) {
            this.allowCustomerLogos = settings.allowCustomerLogos;
          }

          if (!_.isUndefined(settings.logoUrl)) {
            this.logoUrl = settings.logoUrl;
          }

        } else {
          Log.debug('Get existing org failed. Status: ' + status);
        }

      }, orgId, true);

      BrandService.getLogoUrl(orgId).then(function (logoUrl) {
        this.tempLogoUrl = logoUrl;
      });

      this.initWbxClientVersions();
    };

    // TODO webex team clean this up and add unit tests
    this.initWbxClientVersions = function () {

      //wbxclientversionselected
      //this.wbxclientversions = "";
      var succ = function (data) {
        this.wbxclientversions = data;
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
          this.wbxNoClientSelected = true;
          this.wbxclientversionselected = this.wbxclientversionplaceholder;
        } else {
          this.wbxNoClientSelected = false;
          this.wbxclientversionselected = clientVersion;
        }

        this.useLatestWbxVersion = _.get(json, 'data.useLatest');

      });
    };

    this.init();

    function toggleWebexSelectLatestVersionAlways(useLatest) {
      Log.info("webex use latest version toggle");
      var selected = this.wbxclientversionselected;
      this.useLatestWbxVersion = useLatest;
      var alwaysSelectLatest = this.useLatestWbxVersion;
      //WebexClientVersion.toggleWebexSelectLatestVersionAlways(orgId, this.allowCustomerWbxClientVersions);
      var p = WebexClientVersion.getPartnerIdGivenOrgId(orgId).then(function (resp) {
        return resp.data.partnerId; //this is the pid
      }).then(function (pid) {
        return WebexClientVersion.postOrPutTemplate(pid, selected, this.useLatestWbxVersion);
      });
      //var p = WebexClientVersion.postOrPutTemplate(orgId, selected, this.useLatestWbxVersion);
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
      this.wbxclientversionselected = wbxclientversionselected;
      var versionSelected = this.wbxclientversionselected;

      var p = WebexClientVersion.getPartnerIdGivenOrgId(orgId).then(function (resp) {
        return resp.data.partnerId; //this is the pid
      }).then(function (pid) {
        return WebexClientVersion.postOrPutTemplate(pid, versionSelected, this.useLatestWbxVersion);
      });

      //var p = WebexClientVersion.postOrPutTemplate(orgId, versionSelected, this.useLatestWbxVersion);

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

    this.wbxclientversionselectchanged = _.debounce(
      wbxclientversionselectchanged,
      2000, {
        'leading': true,
        'trailing': false
      });

    this.toggleWebexSelectLatestVersionAlways = _.debounce(
      toggleWebexSelectLatestVersionAlways,
      100, {
        'leading': true,
        'trailing': false
      });

    this.upload = function (file, event) {
      openModal('sm');
      if (validateLogo(file)) {
        this.progress = 0;
        BrandService.upload(orgId, file)
          .then(uploadSuccess, uploadError, uploadProgress);
      }
    };

    // TODO: Refactor to use appconfig states
    function openModal(size) {
      this.uploadModal = $modal.open({
        scope: this,
        templateUrl: 'modules/core/partnerProfile/brandingUpload.tpl.html',
        size: size
      });
    }

    this.toggleLogo = _.debounce(function (value) {
      if (value) {
        BrandService.usePartnerLogo(orgId);
      } else {
        BrandService.useCustomLogo(orgId);
      }
    }, 2000, {
      'leading': true,
      'trailing': false
    });

    this.toggleAllowCustomerLogos = _.debounce(function (value) {
      if (value) {
        BrandService.enableCustomerLogos(orgId);
      } else {
        BrandService.disableCustomerLogos(orgId);
      }
    }, 2000, {
      'leading': true,
      'trailing': false
    });

    this.upload = function (file, event) {
      openModal('sm');
      if (validateLogo(file)) {
        this.progress = 0;
        BrandService.upload(orgId, file)
          .then(uploadSuccess, uploadError, uploadProgress);
      }
    };
    // Add branding example static page
    this.showBrandingExample = function (type) {
      this.type = type;
      $modal.open({
        scope: this,
        templateUrl: 'modules/core/partnerProfile/branding/brandingExample.tpl.html',
        size: 'lg'
      });
    };

    // TODO: Refactor to use appconfig states
    function openModal(size) {
      this.uploadModal = $modal.open({
        scope: this,
        templateUrl: 'modules/core/partnerProfile/branding/brandingUpload.tpl.html',
        size: size
      });
    }

    function validateLogo(logo) {
      var error = logo.$error;
      if (error === 'maxWidth' || error === 'minWidth') {
        this.logoError = 'dimensions';
      } else {
        this.logoError = logo.$error;
      }

      if (logo && !logo.$error) {
        return true;
      }
    }

    function uploadSuccess(response) {
      $timeout(function () {
        if (this.uploadModal) {
          this.uploadModal.close();
        }
      }, 3000);
      // Automatically start using the custom logo
      BrandService.resetCdnLogo(Authinfo.getOrgId());
      this.usePartnerLogo = false;
      this.toggleLogo(false);
    }

    function uploadError(error) {
      this.logoError = 'unknown';
    }

    function uploadProgress(evt) {
      this.progress = parseInt(100.0 * evt.loaded / evt.total);
    }
  }

})();
