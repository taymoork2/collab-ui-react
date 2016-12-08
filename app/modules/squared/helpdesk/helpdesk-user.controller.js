(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('HelpdeskUserController', HelpdeskUserController);

  /* @ngInject */
  function HelpdeskUserController($modal, $stateParams, $translate, $window, Authinfo, Config, FeatureToggleService, HelpdeskCardsUserService, HelpdeskHuronService, HelpdeskLogService, HelpdeskService, LicenseService, Notification, USSService, WindowLocation) {
    $('body').css('background', 'white');
    var vm = this;
    if ($stateParams.user) {
      vm.userId = $stateParams.user.id;
      vm.orgId = $stateParams.user.organization.id;
      vm.org = $stateParams.user.organization;
    } else {
      vm.userId = $stateParams.id;
      vm.orgId = $stateParams.orgId;
      vm.org = {
        id: $stateParams.orgId
      };
    }
    vm.resendInviteEmail = resendInviteEmail;
    vm.user = $stateParams.user;
    vm.userStatusesAsString = '';
    vm.resendInviteEnabled = false;
    vm.messageCard = {};
    vm.meetingCard = {};
    vm.callCard = {};
    vm.hybridServicesCard = {};
    vm.keyPressHandler = keyPressHandler;
    vm.sendCode = sendCode;
    vm.downloadLog = downloadLog;
    vm.isAuthorizedForLog = isAuthorizedForLog;
    vm.openExtendedInformation = openExtendedInformation;
    vm.openHybridServicesModal = openHybridServicesModal;
    vm.supportsExtendedInformation = false;
    vm.cardsAvailable = false;
    vm._helpers = {
      notifyError: notifyError
    };

    FeatureToggleService.supports(FeatureToggleService.features.atlasHelpDeskExt).then(function (result) {
      vm.supportsExtendedInformation = result;
    });

    HelpdeskService.getUser(vm.orgId, vm.userId).then(initUserView, vm._helpers.notifyError);

    function resendInviteEmail() {
      var trimmedUserData = {
        displayName: vm.user.displayName,
        email: vm.user.userName,
        onlineOrderIds: _.get(vm.user, 'onlineOrderIds', [])
      };
      HelpdeskService.resendInviteEmail(trimmedUserData)
        .then(function () {
          Notification.success('helpdesk.resendSuccess');
        })
        .then(function () {
          var prefix = 'helpdesk.userStatuses.';
          for (var i = 0; i < vm.user.statuses.length; i++) {
            var status = vm.user.statuses[i];
            if (_.includes(prefix + 'rejected', status)) {
              vm.user.statuses[i] = prefix + 'resent';
            }
          }
        })
        .catch(vm._helpers.notifyError);
    }

    function sendCode() {
      HelpdeskService.sendVerificationCode(vm.user.displayName, vm.user.userName).then(function (code) {
        vm.verificationCode = code;
        vm.sendingVerificationCode = false;
      }, vm._helpers.notifyError);
    }

    function openExtendedInformation() {
      if (vm.supportsExtendedInformation) {
        $modal.open({
          templateUrl: "modules/squared/helpdesk/helpdesk-extended-information.html",
          controller: 'HelpdeskExtendedInfoDialogController as modal',
          modalId: "HelpdeskExtendedInfoDialog",
          resolve: {
            title: function () {
              return 'helpdesk.userDetails';
            },
            data: function () {
              return vm.user;
            }
          }
        });
      }
    }

    function initUserView(user) {
      vm.user = user;
      vm.resendInviteEnabled = _.some(user.statuses, function (_status) {
        return /helpdesk.userStatuses..*-pending$/.test(_status);
      });

      FeatureToggleService.supports(FeatureToggleService.features.atlasEmailStatus)
        .then(function (isSupported) {
          if (!isSupported) {
            return;
          }

          // TODO: investigate who owns this feature now and determine what the correct behavior should be now
          HelpdeskService.isEmailBlocked(user.userName)
            .then(function () {
              vm.resendInviteEnabled = true;
              var prefix = 'helpdesk.userStatuses.';
              var statusToReplace = [prefix + 'active', prefix + 'inactive', prefix + 'invite-pending', prefix + 'resent'];
              var i;
              for (i = 0; i < vm.user.statuses.length; i++) {
                var status = vm.user.statuses[i];
                if (_.includes(statusToReplace, status)) {
                  vm.user.statuses[i] = prefix + 'rejected';
                }
              }
            });
        });

      vm.userStatusesAsString = getUserStatusesAsString(vm);

      vm.messageCard = HelpdeskCardsUserService.getMessageCardForUser(user);
      vm.meetingCard = HelpdeskCardsUserService.getMeetingCardForUser(user);
      vm.callCard = HelpdeskCardsUserService.getCallCardForUser(user);
      vm.hybridServicesCard = HelpdeskCardsUserService.getHybridServicesCardForUser(user);

      if (vm.hybridServicesCard.entitled) {
        HelpdeskService.getHybridStatusesForUser(vm.userId, vm.orgId).then(function (statuses) {
          _.each(statuses, function (status) {
            status.collapsedState = USSService.decorateWithStatus(status);
            switch (status.serviceId) {
              case 'squared-fusion-cal':
                vm.hybridServicesCard.cal.status = status;
                break;
              case 'squared-fusion-gcal':
                vm.hybridServicesCard.gcal.status = status;
                break;
              case 'squared-fusion-uc':
                vm.hybridServicesCard.uc.status = status;
                break;
              case 'squared-fusion-ec':
                vm.hybridServicesCard.ec.status = status;
                break;
            }
            if (status.lastStateChange) {
              status.lastStateChangeText = moment(status.lastStateChange).fromNow(true);
            }
          });
        }, vm._helpers.notifyError);
      }

      if (!vm.org.displayName && vm.org.id !== Config.consumerOrgId) {
        // Only if there is no displayName. If set, the org name has already been read (on the search page)
        HelpdeskService.getOrgDisplayName(vm.orgId).then(function (displayName) {
          vm.org.displayName = displayName;
        }, vm._helpers.notifyError);
      }

      if (LicenseService.userIsEntitledTo(user, Config.entitlements.huron)) {
        HelpdeskHuronService.getDevices(vm.userId, vm.orgId).then(function (devices) {
          vm.huronDevices = devices;
        }, handleHuronError);
        HelpdeskHuronService.getUserNumbers(vm.userId, vm.orgId).then(function (numbers) {
          vm.callCard.huronNumbers = numbers;
        }, handleHuronError);
      }

      if (isAuthorizedForLog()) {
        HelpdeskLogService.searchForLastPushedLog(vm.userId).then(function (log) {
          vm.lastPushedLog = log;
        }, _.noop);
      }

      vm.cardsAvailable = true;
      angular.element(".helpdesk-details").focus();
    }

    function getUserStatusesAsString(vm) {
      var statuses = _.map(vm.user.statuses, function (_status) {
        return $translate.instant(_status);
      });
      return statuses.join(',');
    }

    function isAuthorizedForLog() {
      return Authinfo.isCisco() && (Authinfo.isSupportUser() || Authinfo.isAdmin() || Authinfo.isAppAdmin() || Authinfo.isReadOnlyAdmin());
    }

    function downloadLog(filename) {
      HelpdeskLogService.downloadLog(filename).then(function (tempURL) {
        WindowLocation.set(tempURL);
      });
    }

    function handleHuronError(err) {
      if (err.status !== 404) {
        vm._helpers.notifyError(err);
      }
    }

    function modalVisible() {
      return $('#HelpdeskExtendedInfoDialog').is(':visible');
    }

    function keyPressHandler(event) {
      if (!modalVisible()) {
        if (event.keyCode === 27) { // Esc
          $window.history.back();
        }
      }
    }

    function notifyError(response) {
      Notification.errorWithTrackingId(response, 'helpdesk.unexpectedError');
    }

    function openHybridServicesModal() {
      vm.loadingHSData = true;
      USSService.getUserJournal(vm.userId, vm.orgId, 20)
        .then(function (hsData) {
          $modal.open({
            templateUrl: 'modules/squared/helpdesk/helpdesk-extended-information.html',
            controller: 'HelpdeskExtendedInfoDialogController as modal',
            resolve: {
              title: function () {
                return 'helpdesk.userStatusEventLog';
              },
              data: function () {
                return hsData;
              }
            }
          });
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        })
        .finally(function () {
          vm.loadingHSData = false;
        });
    }
  }

}());
