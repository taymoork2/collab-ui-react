(function () {
  'use strict';

  angular.module('Core')
    .controller('BrandingCtrl', BrandingCtrl);

  function BrandingCtrl($scope, $state, $translate, $timeout, $modal, Authinfo, Notification, Log, Utils, UserListService, WebexClientVersion, BrandService, Orgservice, FeatureToggleService) {
    var brand = this;
    var orgId = Authinfo.getOrgId();

    brand.isPartner = Authinfo.isPartner();
    brand.usePartnerLogo = true;
    brand.allowCustomerLogos = false;
    brand.allowCustomerLogos = false;
    brand.progress = 0;
    brand.modalType = $state.params.modalType;

    brand.logoCriteria = {
      'pattern': '.png',
      'width': {
        min: '100'
      }
    };

    brand.useLatestWbxVersion = false;
    brand.wbxclientversionselected = '';
    brand.wbxclientversions = ['testversion1.0', 'testversion2.0'];
    brand.wbxNoClientSelected = true;
    brand.wbxclientversionplaceholder = $translate.instant('partnerProfile.selectAWbxClientVersion');
    brand.showClientVersions = true;

    brand.init = function () {
      brand.rep = null; // cs admin rep
      brand.partner = {};

      brand.logoUrl = '';
      brand.logoError = null;

      UserListService.listPartners(orgId, function (data) {
        for (var partner in data.partners) {
          var currentPartner = data.partners[partner];
          if (!brand.isPartner && currentPartner.userName.indexOf('@cisco.com') === -1) {
            brand.partner = currentPartner;

          } else if (currentPartner.userName.indexOf('@cisco.com') > -1) {
            brand.rep = currentPartner;
          }
        }
      });

      Orgservice.getOrg(function (data, status) {
        if (data.success) {
          var settings = data.orgSettings;
          if (!_.isUndefined(settings.usePartnerLogo)) {
            brand.usePartnerLogo = settings.usePartnerLogo;
          }

          if (!_.isUndefined(settings.allowCustomerLogos)) {
            brand.allowCustomerLogos = settings.allowCustomerLogos;
          }

          if (!_.isUndefined(settings.logoUrl)) {
            brand.logoUrl = settings.logoUrl;
          }

        } else {
          Log.debug('Get existing org failed. Status: ' + status);
        }

      }, orgId, true);

      BrandService.getLogoUrl(orgId).then(function (logoUrl) {
        brand.tempLogoUrl = logoUrl;
      });

      FeatureToggleService.supports(FeatureToggleService.features.brandingWordingChange).then(function (toggle) {
        brand.isSupportAtlasBrand = toggle;
      });
      brand.initWbxClientVersions();
    };

    // TODO webex team clean bCtrl up and add unit tests
    brand.initWbxClientVersions = function () {

      //wbxclientversionselected
      //brand.wbxclientversions = "";
      var succ = function (data) {
        brand.wbxclientversions = data;
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
          brand.wbxNoClientSelected = true;
          brand.wbxclientversionselected = brand.wbxclientversionplaceholder;
        } else {
          brand.wbxNoClientSelected = false;
          brand.wbxclientversionselected = clientVersion;
        }

        brand.useLatestWbxVersion = _.get(json, 'data.useLatest');

      });
    };

    brand.init();

    function toggleWebexSelectLatestVersionAlways(useLatest) {
      Log.info("webex use latest version toggle");
      var selected = brand.wbxclientversionselected;
      brand.useLatestWbxVersion = useLatest;
      var alwaysSelectLatest = brand.useLatestWbxVersion;
      //WebexClientVersion.toggleWebexSelectLatestVersionAlways(orgId, brand.allowCustomerWbxClientVersions);
      var p = WebexClientVersion.getPartnerIdGivenOrgId(orgId).then(function (resp) {
        return resp.data.partnerId; //bCtrl is the pid
      }).then(function (pid) {
        return WebexClientVersion.postOrPutTemplate(pid, selected, brand.useLatestWbxVersion);
      });
      //var p = WebexClientVersion.postOrPutTemplate(orgId, selected, brand.useLatestWbxVersion);
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
      brand.wbxclientversionselected = wbxclientversionselected;
      var versionSelected = brand.wbxclientversionselected;

      var p = WebexClientVersion.getPartnerIdGivenOrgId(orgId).then(function (resp) {
        return resp.data.partnerId; //bCtrl is the pid
      }).then(function (pid) {
        return WebexClientVersion.postOrPutTemplate(pid, versionSelected, brand.useLatestWbxVersion);
      });

      //var p = WebexClientVersion.postOrPutTemplate(orgId, versionSelected, brand.useLatestWbxVersion);

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

    brand.wbxclientversionselectchanged = wbxclientversionselectchanged;

    brand.wbxclientversionselectchanged = _.debounce(
      wbxclientversionselectchanged,
      2000, {
        'leading': true,
        'trailing': false
      });

    brand.toggleWebexSelectLatestVersionAlways = _.debounce(
      toggleWebexSelectLatestVersionAlways,
      100, {
        'leading': true,
        'trailing': false
      });

    brand.upload = function (file, event) {
      openModal('sm');
      if (validateLogo(file)) {
        brand.progress = 0;
        BrandService.upload(orgId, file)
          .then(uploadSuccess, uploadError, uploadProgress);
      }
    };

    function openModal(size) {
      $state.go('brandingUpload').then(function () {});
      // brand.uploadModal = $modal.open({
      //   scope: bCtrl,
      //   templateUrl: 'modules/core/partnerProfile/brandingUpload.tpl.html',
      //   size: size
      // });
    }

    brand.toggleLogo = _.debounce(function (value) {
      if (value) {
        BrandService.usePartnerLogo(orgId);
      } else {
        BrandService.useCustomLogo(orgId);
      }
    }, 2000, {
      'leading': true,
      'trailing': false
    });

    brand.toggleAllowCustomerLogos = _.debounce(function (value) {
      if (value) {
        BrandService.enableCustomerLogos(orgId);
      } else {
        BrandService.disableCustomerLogos(orgId);
      }
    }, 2000, {
      'leading': true,
      'trailing': false
    });

    brand.upload = function (file, event) {
      openModal('sm');
      if (validateLogo(file)) {
        brand.progress = 0;
        BrandService.upload(orgId, file)
          .then(uploadSuccess, uploadError, uploadProgress);
      }
    };
    // Add branding example static page
    brand.showBrandingExample = function (type) {
      $state.go('brandingExample', {
        modalType: type
      }).then(function () {});
      // brand.type = type;
      // $modal.open({
      //   scope: bCtrl,
      //   templateUrl: 'modules/core/partnerProfile/branding/brandingExample.tpl.html',
      //   size: 'lg'
      // });
    };

    function validateLogo(logo) {
      var error = logo.$error;
      if (error === 'maxWidth' || error === 'minWidth') {
        brand.logoError = 'dimensions';
      } else {
        brand.logoError = logo.$error;
      }

      if (logo && !logo.$error) {
        return true;
      }
    }

    function uploadSuccess(response) {
      $timeout(function () {
        if (brand.uploadModal) {
          brand.uploadModal.close();
        }
      }, 3000);
      // Automatically start using the custom logo
      BrandService.resetCdnLogo(Authinfo.getOrgId());
      brand.usePartnerLogo = false;
      brand.toggleLogo(false);
    }

    function uploadError(error) {
      brand.logoError = 'unknown';
    }

    function uploadProgress(evt) {
      brand.progress = parseInt(100.0 * evt.loaded / evt.total);
    }
  }

})();
