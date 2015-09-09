'use strict';

angular.module('Core')
  .controller('PartnerProfileCtrl', ['$scope', 'Authinfo', 'Notification', '$stateParams', 'UserListService', 'Orgservice', 'Log', 'Config', '$window', 'Utils', 'FeedbackService', '$translate',
    function ($scope, Authinfo, Notification, $stateParams, UserListService, Orgservice, Log, Config, $window, Utils, FeedbackService, $translate) {

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
        $scope.partner = null;
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

        UserListService.listPartners(Authinfo.getOrgId(), function (data) {
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
            if (data.orgSettings && data.orgSettings.length > 0) {
              var length = data.orgSettings.length;
              var orgSettingsObj = JSON.parse(data.orgSettings[length - 1]);

              if (typeof (orgSettingsObj.reportingSiteUrl) !== 'undefined') {
                if (orgSettingsObj.reportingSiteUrl && orgSettingsObj.reportingSiteUrl.length) {
                  $scope.problemSiteRadioValue = 1;
                  $scope.supportUrl = orgSettingsObj.reportingSiteUrl;
                  $scope.oldSupportUrl = $scope.supportUrl;
                }
              }
              if (typeof (orgSettingsObj.reportingSiteDesc) !== 'undefined') {
                if (orgSettingsObj.reportingSiteDesc && orgSettingsObj.reportingSiteDesc.length) {
                  $scope.problemSiteRadioValue = 1;
                  $scope.supportText = orgSettingsObj.reportingSiteDesc;
                  $scope.oldSupportText = $scope.supportText;
                }
              }
              if (typeof (orgSettingsObj.helpUrl) !== 'undefined') {
                if (orgSettingsObj.helpUrl && orgSettingsObj.helpUrl.length) {
                  $scope.helpSiteRadioValue = 1;
                  $scope.helpUrl = orgSettingsObj.helpUrl;
                  $scope.oldHelpUrl = $scope.helpUrl;
                }
              }
              if (typeof (orgSettingsObj.isCiscoSupport) !== 'undefined') {
                $scope.isCiscoSupport = orgSettingsObj.isCiscoSupport;
              }
              if (typeof (orgSettingsObj.isCiscoHelp) !== 'undefined') {
                $scope.isCiscoHelp = orgSettingsObj.isCiscoHelp;
              }
            } else {
              Log.debug('No orgSettings found for org: ' + data.id);
            }

          } else {
            Log.debug('Get existing org failed. Status: ' + status);
          }
        }, Authinfo.getOrgId());
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

          updateOrgSettings(Authinfo.getOrgId(), $scope.supportUrl,
            $scope.supportText, $scope.helpUrl,
            isCiscoHelp, isCiscoSupport);
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

      function updateOrgSettings(orgId, supportUrl, supportText, helpUrl, isCiscoHelp, isCiscoSupport) {
        angular.element('#orgProfileSaveBtn').button('loading');
        Orgservice.setOrgSettings(orgId, supportUrl, supportText, helpUrl, isCiscoHelp, isCiscoSupport, function (data, status) {
          if (data.success) {
            angular.element('#orgProfileSaveBtn').button('reset');
            Notification.notify([$translate.instant('partnerProfile.processing')], 'success');
          } else {
            var error = $translate.instant('errors.statusError', {
              status: status
            });

            Notification.notify(error, 'error');
            angular.element('#orgProfileSaveBtn').button('reset');
          }
        });
      }
    }
  ]);
