'use strict';

angular.module('Core')
  .controller('PartnerProfileCtrl', ['$scope', 'Authinfo', 'Notification', '$stateParams', 'UserListService', 'Orgservice', 'Log', 'Config', '$window', 'Utils', 'FeedbackService', '$translate',

    function ($scope, Authinfo, Notification, $stateParams, UserListService, Orgservice, Log, Config, $window, Utils, FeedbackService, $translate) {

      // toggles api calls, show/hides divs based on customer or partner profile
      $scope.isPartner = Authinfo.isPartner();
      $scope.appType = 'Squared';

      $scope.profileHelpUrl = 'https://support.ciscospark.com';

      // hold partner admin object
      $scope.partner = null;

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

        FeedbackService.getFeedbackUrl(appType, feedbackId, function (data, status) {
          Log.debug('feedback status: ' + status);
          if (data.success) {
            $window.open(data.url, '_blank');
          } else {
            Log.debug('Cannot load feedback url: ' + status);
          }
        });
      };

      // strings to be translated as placeholders, need to be used as values
      $scope.grant = 'Grant support access to Cisco\'s Customer Success team.';
      $scope.troubleUrl = 'Your trouble reporting site URL';
      $scope.troubleText = 'Provide optional text to give people an idea of where the URL will take them and what they can expect to do there.';
      $scope.helpUrlText = 'Your help site URL';
      $scope.partnerProvidedText = 'Text provided by the partner.';

      // ci api calls will go in here
      $scope.init = function () {
        $scope.rep = null;
        $scope.radioModified = false;

        $scope.companyName = Authinfo.getOrgName();
        $scope.problemSiteRadioValue = 0;
        $scope.helpSiteRadioValue = 0;

        $scope.supportUrl = '';
        $scope.supportText = '';
        $scope.helpUrl = '';

        if (!$scope.isPartner) {
          UserListService.listPartners(Authinfo.getOrgId(), function (data) {
            $scope.partner = data.partners[0];
          });
        }

        /* UNCOMMENT ONCE CISCO IS A PARTNER */
        // UserListService.getCiscoRep(function(data, status){
        //   if(data.success){
        //   } else{
        //   }
        // });

        Orgservice.getOrg(function (data, status) {
          if (data.success) {
            if (data.orgSettings && data.orgSettings.length > 0) {
              var length = data.orgSettings.length;
              for (var i = 0; i < length; i++) {
                var orgSettingsObj;
                try {
                  orgSettingsObj = JSON.parse(data.orgSettings[i]);
                } catch (e) {
                  continue;
                }

                if (typeof (orgSettingsObj.reportingSiteUrl) !== 'undefined') {
                  $scope.problemSiteRadioValue = 1;
                  $scope.supportUrl = orgSettingsObj.reportingSiteUrl;
                  $scope.oldSupportUrl = $scope.supportUrl;
                }
                if (typeof (orgSettingsObj.reportingSiteDesc) !== 'undefined') {
                  $scope.problemSiteRadioValue = 1;
                  $scope.supportText = orgSettingsObj.reportingSiteDesc;
                  $scope.oldSupportText = $scope.supportText;
                }
                if (typeof (orgSettingsObj.helpUrl) !== 'undefined') {
                  $scope.helpSiteRadioValue = 1;
                  $scope.helpUrl = orgSettingsObj.helpUrl;
                  $scope.oldHelpUrl = $scope.helpUrl;
                }
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
        angular.element('#orgProfileSaveBtn').button('loading');
        updateOrgSettings(Authinfo.getOrgId(), $scope.supportUrl, $scope.supportText, $scope.helpUrl);
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

      var updateOrgSettings = function (orgId, supportUrl, supportText, helpUrl) {
        Orgservice.setOrgSettings(orgId, supportUrl, supportText, helpUrl, function (data, status) {
          if (data.success) {
            var orgs = [];
            var numOrgs = data.organizations.length;
            var numFailed = 0;
            var failedOrgs = [];
            for (var i = 0; i < numOrgs; i++) {
              if (!data.organizations[i].isSuccess) {
                numFailed++;
                failedOrgs.push('[orgId: ' + data.organizations[i].orgId + ', isPartnerOrg: ' + data.organizations[i].isPartnerOrg + '] <br/>');
              } else {
                orgs.push('[orgId: ' + data.organizations[i].orgId + ', isPartnerOrg: ' + data.organizations[i].isPartnerOrg + '] <br/>');
              }
            }

            if (numOrgs === 1) {
              if (numFailed === 0) {
                Notification.notify(['orgSettings updated successfully for organization: <br/>' + orgs.toString()], 'success');
              } else {
                Notification.notify(['update orgSettings failed for organization: <br/>' + failedOrgs.toString()], 'error');
              }
            } else {
              if (numFailed === 0) {
                Notification.notify(['orgSettings updated successfully for partner and his managedOrgs: <br/>' + orgs.toString()], 'success');
              } else {
                Notification.notify(['update orgSettings failed for partner and his managedOrgs: <br/>' + failedOrgs.toString()], 'error');
              }
            }
          } else {
            Notification.notify(['update orgSettings failed for organization: <br/>' + orgId], 'error');
          }
          angular.element('#orgProfileSaveBtn').button('reset');
        });
      };

    }
  ]);
