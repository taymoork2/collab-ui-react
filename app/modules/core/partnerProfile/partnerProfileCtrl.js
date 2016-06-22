(function () {
  'use strict';

  angular.module('Core')
    .controller('PartnerProfileCtrl', PartnerProfileCtrl);

  /* @ngInject */
  function PartnerProfileCtrl($scope, Authinfo, Notification, UserListService, Orgservice, Log, $window, Utils, FeedbackService, $translate) {
    var orgId = Authinfo.getOrgId();

    // toggles api calls, show/hides divs based on customer or partner profile
    $scope.isPartner = Authinfo.isPartner();
    $scope.appType = 'Squared';

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
    //For now restrict to one user (who is a partner)
    //$scope.showClientVersions = Authinfo.getPrimaryEmail() === 'marvelpartners@gmail.com';
    $scope.showCrashLogUpload = false;

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

      $scope.companyName = Authinfo.getOrgName();
      $scope.problemSiteRadioValue = 0;
      $scope.helpSiteRadioValue = 0;

      $scope.supportUrl = '';
      $scope.supportText = '';
      $scope.helpUrl = '';
      $scope.isManaged = false;
      $scope.isCiscoSupport = false;
      $scope.isCiscoHelp = false;

      $scope.brandingTpl = '';

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

          resetForm();
        } else {
          Log.debug('Get existing org failed. Status: ' + status);
        }
      }, orgId, true);
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
          reportingSiteUrl: $scope.supportUrl || null,
          reportingSiteDesc: $scope.supportText || null,
          helpUrl: $scope.helpUrl || null,
          isCiscoHelp: isCiscoHelp,
          isCiscoSupport: isCiscoSupport,
        };

        updateOrgSettings(orgId, settings);
      } else {
        Notification.error('partnerProfile.orgSettingsError');
      }
    };

    $scope.setProblemRadio = function (value) {
      if (value === $scope.problemSiteInfo.cisco) {
        $scope.supportUrl = '';
        $scope.supportText = '';
      }
      $scope.problemSiteRadioValue = value;
      touchForm();
    };

    $scope.setHelpRadio = function (value) {
      if (value === $scope.helpSiteInfo.cisco) {
        $scope.helpUrl = '';
      }
      $scope.helpSiteRadioValue = value;
      touchForm();
    };

    function updateOrgSettings(orgId, settings) {
      $scope.orgProfileSaveLoad = true;
      Orgservice.setOrgSettings(orgId, settings)
        .then(notifySuccess)
        .then(resetForm)
        .catch(notifyError)
        .finally(stopLoading);
    }

    function stopLoading() {
      $scope.orgProfileSaveLoad = false;
    }

    function notifySuccess() {
      Notification.success('partnerProfile.processing');
    }

    function notifyError(response) {
      Notification.errorResponse(response, 'errors.statusError', {
        status: response.status
      });
    }

    function resetForm() {
      if ($scope.partnerProfileForm) {
        $scope.partnerProfileForm.$setPristine();
        $scope.partnerProfileForm.$setUntouched();
      }
    }

    function touchForm() {
      if ($scope.partnerProfileForm) {
        $scope.partnerProfileForm.$setDirty();
      }
    }
  }
})();
