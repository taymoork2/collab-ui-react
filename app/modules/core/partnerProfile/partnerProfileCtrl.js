'use strict';

angular.module('Core')
  .controller('PartnerProfileCtrl', ['$scope', '$modal', 'Authinfo', 'Notification', '$stateParams', 'UserListService', 'Orgservice', 'Log', 'Config', '$window', 'Utils', 'FeedbackService', '$translate', '$timeout', 'BrandService', 'WebexClientVersion', 'FeatureToggleService',
    function ($scope, $modal, Authinfo, Notification, $stateParams, UserListService, Orgservice, Log, Config, $window, Utils, FeedbackService, $translate, $timeout, BrandService, WebexClientVersion, FeatureToggleService) {
      var orgId = Authinfo.getOrgId();

      // toggles api calls, show/hides divs based on customer or partner profile
      $scope.isPartner = Authinfo.isPartner();
      $scope.appType = 'Squared';
      $scope.usePartnerLogo = true;
      $scope.allowCustomerLogos = false;
      $scope.progress = 0;

      $scope.profileHelpUrl = 'https://support.ciscospark.com';

      // radio button values
      $scope.problemSiteInfo = {
        cisco: 0,
        ext: 1
      };

      $scope.helpSiteInfo = {
        cisco: 0,
        ext: 1
      };

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
      //For now restrict to one user (who is a partner)
      //$scope.showClientVersions = Authinfo.getPrimaryEmail() === 'marvelpartners@gmail.com';
      $scope.showClientVersions = false;

      $scope.sendFeedback = function () {
        var appType = 'Atlas_' + $window.navigator.userAgent;
        var feedbackId = Utils.getUUID();

        FeedbackService.getFeedbackUrl(appType, feedbackId).then(function (res) {
          $window.open(res.data.url, '_blank');
        });
      };

      // strings to be translated as placeholders, need to be used as values
      $scope.grant = $translate.instant('partnerProfile.grant');
      $scope.troubleUrl = $translate.instant('partnerProfile.troubleUrl');
      $scope.troubleText = $translate.instant('partnerProfile.troubleText');
      $scope.helpUrlText = $translate.instant('partnerProfile.helpUrlText');
      $scope.partnerProvidedText = $translate.instant('partnerProfile.partnerProvidedText');

      // ci api calls will go in here
      $scope.init = function () {
        $scope.rep = null; // cs admin rep
        $scope.partner = {};
        $scope.radioModified = false;

        $scope.companyName = Authinfo.getOrgName();
        $scope.problemSiteRadioValue = 0;
        $scope.helpSiteRadioValue = 0;

        $scope.supportUrl = '';
        $scope.supportText = '';
        $scope.helpUrl = '';
        $scope.isManaged = false;
        $scope.isCiscoSupport = false;
        $scope.isCiscoHelp = false;

        $scope.logoError = null;
        $scope.logoUrl = '';

        UserListService.listPartners(orgId, function (data) {
          for (var partner in data.partners) {
            var currentPartner = data.partners[partner];
            if (!$scope.isPartner && currentPartner.userName.indexOf('@cisco.com') === -1) {
              $scope.partner = currentPartner;
              $scope.isManaged = true;
            } else if (currentPartner.userName.indexOf('@cisco.com') > -1) {
              $scope.rep = currentPartner;
              $scope.isManaged = true;
            }
          }
        });

        Orgservice.getOrg(function (data, status) {
          if (data.success) {
            var settings = data.orgSettings;

            if (!_.isEmpty(settings.reportingSiteUrl)) {
              $scope.problemSiteRadioValue = 1;
              $scope.supportUrl = settings.reportingSiteUrl;
              $scope.oldSupportUrl = $scope.supportUrl;
            }

            if (!_.isEmpty(settings.reportingSiteDesc)) {
              $scope.problemSiteRadioValue = 1;
              $scope.supportText = settings.reportingSiteDesc;
              $scope.oldSupportText = $scope.supportText;
            }

            if (!_.isEmpty(settings.helpUrl)) {
              $scope.helpSiteRadioValue = 1;
              $scope.helpUrl = settings.helpUrl;
              $scope.oldHelpUrl = $scope.helpUrl;
            }

            if (!_.isUndefined(settings.isCiscoSupport)) {
              $scope.isCiscoSupport = settings.isCiscoSupport;
            }

            if (!_.isUndefined(settings.isCiscoHelp)) {
              $scope.isCiscoHelp = settings.isCiscoHelp;
            }

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
          return resp.data.partnerId; //this is the pid
        }).then(function (pid) {
          return WebexClientVersion.getTemplate(pid);
        });

        //var p = WebexClientVersion.getTemplate(orgId)

        p.then(function (json) {
          var clientVersion = json.data.clientVersion;
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

          $scope.useLatestWbxVersion = json.data.useLatest;

        });

        FeatureToggleService.supports(FeatureToggleService.features.webexClientLockdown).then(function (toggle) {
          $scope.showClientVersions = toggle;
        });

      };

      $scope.init();

      $scope.validation = function () {
        var error = false;

        // if user is attempting to use a blank support url
        if ($scope.supportUrl === '' && $scope.problemSiteRadioValue !== $scope.problemSiteInfo.cisco) {
          error = true;
        }
        // if user is attempting to use a blank help url
        if ($scope.helpUrl === '' && $scope.helpSiteRadioValue !== $scope.helpSiteInfo.cisco) {
          error = true;
        }

        if (!error) {
          var isCiscoHelp = $scope.isManaged ? $scope.isCiscoHelp : ($scope.helpSiteRadioValue === 0);
          var isCiscoSupport = $scope.isManaged ? $scope.isCiscoSupport : ($scope.problemSiteRadioValue === 0);
          var settings = {
            'reportingSiteUrl': $scope.supportUrl || null,
            'reportingSiteDesc': $scope.supportText || null,
            'helpUrl': $scope.helpUrl || null,
            'isCiscoHelp': isCiscoHelp,
            'isCiscoSupport': isCiscoSupport
          };

          updateOrgSettings(orgId, settings);
        } else {
          Notification.notify([$translate.instant('partnerProfile.orgSettingsError')], 'error');
        }
      };

      $scope.setProblemRadio = function (value) {
        if (value === $scope.problemSiteInfo.cisco) {
          $scope.supportUrl = '';
          $scope.supportText = '';
        }
        $scope.radioModified = true;
        $scope.problemSiteRadioValue = value;
      };

      $scope.setHelpRadio = function (value) {
        if (value === $scope.helpSiteInfo.cisco) {
          $scope.helpUrl = '';
        }
        $scope.radioModified = true;
        $scope.helpSiteRadioValue = value;
      };

      $scope.isBtnDisabled = function () {
        return !($scope.radioModified || $scope.supportForm.$dirty);
      };

      function updateOrgSettings(orgId, settings) {
        $scope.orgProfileSaveLoad = true;
        Orgservice.setOrgSettings(orgId, settings, function (data, status) {
          if (data.success) {
            $scope.orgProfileSaveLoad = false;
            Notification.notify([$translate.instant('partnerProfile.processing')], 'success');
          } else {
            var error = $translate.instant('errors.statusError', {
              status: status
            });

            Notification.notify(error, 'error');
            $scope.orgProfileSaveLoad = false;
          }
        });
      }

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

      // TODO: Refactor to use appconfig states
      function openModal(size) {
        $scope.uploadModal = $modal.open({
          scope: $scope,
          templateUrl: 'modules/core/partnerProfile/brandingUpload.tpl.html',
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
  ]);
