(function () {
  'use strict';

  var DiagnosticKey = require('modules/core/metrics').DiagnosticKey;

  angular
    .module('Squared')
    .controller('HelpdeskUserController', HelpdeskUserController);

  var KeyCodes = require('modules/core/accessibility').KeyCodes;

  /* @ngInject */
  function HelpdeskUserController(MetricsService, $modal, $q, $stateParams, $translate, $window, AccessibilityService, Authinfo, Config, FeatureToggleService, HelpdeskCardsUserService, HelpdeskHuronService, HelpdeskLogService, HelpdeskService, LicenseService, Notification, USSService, WindowLocation, HybridServicesI18NService, HybridServicesClusterService, ResourceGroupService, UCCService) {
    var vm = this;
    var SUPPRESSED_STATE = {
      LOADING: 'loading',
      BOUNCED: 'bounced',
      UNSUBSCRIBED: 'unsubscribed',
      COMPLAINED: 'complained',
    };
    if ($stateParams.user) {
      vm.userId = $stateParams.user.id;
      if ($stateParams.user.organization) {
        vm.orgId = $stateParams.user.organization.id;
        vm.org = $stateParams.user.organization;
      } else {
        vm.orgId = $stateParams.user.orgId;
        vm.org = {
          id: $stateParams.user.orgId,
        };
      }
    } else {
      vm.userId = $stateParams.id;
      vm.orgId = $stateParams.orgId;
      vm.org = {
        id: $stateParams.orgId,
      };
    }
    vm.ignoreRole = ignoreRole;
    vm.resendInviteEmail = resendInviteEmail;
    vm.user = $stateParams.user;
    vm.userStatusesAsString = '';
    vm.resendInviteEnabled = false;
    vm.messageCard = {};
    vm.meetingCard = {};
    vm.callCard = {};
    vm.careCard = {};
    vm.hybridServicesCard = {};
    vm.keyPressHandler = keyPressHandler;
    vm.sendCode = sendCode;
    vm.confirmRequestForFullAdminAccessModal = confirmRequestForFullAdminAccessModal;
    vm.showSendRequestForFullAdminAccess = showSendRequestForFullAdminAccess;
    vm.sendRequestForFullAdminAccess = sendRequestForFullAdminAccess;
    vm.downloadLog = downloadLog;
    vm.isAuthorizedForLog = isAuthorizedForLog;
    vm.isCare = false;
    vm.openExtendedInformation = openExtendedInformation;
    vm.openHybridServicesModal = openHybridServicesModal;
    vm.supportsExtendedInformation = false;
    vm.cardsAvailable = false;
    vm.hasEmailStatus = hasEmailStatus;
    vm.hasEmailProblem = hasEmailProblem;
    vm.clear = clear;
    vm.logMetrics = logMetrics;
    vm._helpers = {
      notifyError: notifyError,
    };

    FeatureToggleService.supports(FeatureToggleService.features.atlasHelpDeskExt).then(function (result) {
      vm.supportsExtendedInformation = result;
    });

    HelpdeskService.getUser(vm.orgId, vm.userId)
      .then(initUserView)
      .catch(vm._helpers.notifyError);

    function ignoreRole(role) {
      // Device Admins will have 2 device roles assigned but should only display the rolename once
      return role === Config.backend_roles.ci_device_admin;
    }

    function resendInviteEmail() {
      var trimmedUserData = {
        displayName: vm.user.displayName,
        email: vm.user.userName,
        onlineOrderIds: _.get(vm.user, 'onlineOrderIds', []),
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

    function showSendRequestForFullAdminAccess() {
      if (vm.user !== undefined && vm.user.roles !== undefined) {
        return vm.user.roles.length > 0 && vm.user.roles.includes('id_full_admin') && vm.user.orgId !== Authinfo.getUserOrgId();
      }
      return false;
    }

    function confirmRequestForFullAdminAccessModal() {
      $modal.open({
        controller: function () {
          var ctrl = this;
          ctrl.customerDisplayName = vm.user.displayName;
        },
        controllerAs: 'ctrl',
        type: 'dialog',
        template: require('modules/squared/helpdesk/helpdesk-confirm-full-admin-elevation.html'),
      }).result.then(function () {
        sendRequestForFullAdminAccess();
      }, function () {
        logMetrics({ type: 'sendRequestForFullAdminAccess', status: 'cancel' });
      });
    }

    function sendRequestForFullAdminAccess() {
      HelpdeskService.sendRequestForFullAdminAccess(vm.user.id, vm.user.orgId).then(function () {
        logMetrics({ type: 'sendRequestForFullAdminAccess', status: 'success' });
        Notification.success('helpdesk.requestFullAdminSentSuccess', {
          customerUser: vm.user.displayName,
        });
        vm.sendRequestForFullAdminAccess = false;
      }).catch(function (err) {
        logMetrics({ type: 'sendRequestForFullAdminAccess', status: 'failed', details: err });
        vm._helpers.notifyError(err);
      });
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
          template: require('modules/squared/helpdesk/helpdesk-extended-information.html'),
          controller: 'HelpdeskExtendedInfoDialogController as modal',
          modalId: 'HelpdeskExtendedInfoDialog',
          resolve: {
            title: function () {
              return 'helpdesk.userDetails';
            },
            data: function () {
              return vm.user;
            },
          },
        });
      }
    }

    function translateMailgunFailureStatusByCode(emailEvent) {
      var CODE_BOUNCED = 605;
      var CODE_UNSUBSCRIBED = 606;
      var CODE_COMPLAINED = 607;

      // 'failed' email event with certain 'delivery-status.code' values can be better re-classified
      switch (_.get(emailEvent, 'delivery-status.code')) {
        // 605 => email has bounced
        case CODE_BOUNCED:
          return SUPPRESSED_STATE.BOUNCED;

        // 606 => user has unsubscribed
        case CODE_UNSUBSCRIBED:
          return SUPPRESSED_STATE.UNSUBSCRIBED;

        // 607 => user has complained
        case CODE_COMPLAINED:
          return SUPPRESSED_STATE.COMPLAINED;

        default:
          return 'failed';
      }
    }

    function mailgunEventTypeToL10nKey(emailEvent) {
      var eventType = _.get(emailEvent, 'event');
      var emailStatuses = ['unsubscribed', 'delivered', 'failed', 'accepted', 'rejected', 'opened', 'clicked', 'complained', 'stored'];
      if (!_.includes(emailStatuses, eventType)) {
        return 'common.unknown';
      }

      if (eventType === 'failed') {
        eventType = translateMailgunFailureStatusByCode(emailEvent);
      }

      return 'helpdesk.emailStatuses.' + eventType;
    }

    function getDeliveryText(emailEvent) {
      // sadly, the descriptive text might come from one of two properties that we know of so far:
      // - 'delivery-status.message'
      // - 'delivery-status.description'
      var deliveryMsg = _.get(emailEvent, 'delivery-status.message');
      var deliveryDescr = _.get(emailEvent, 'delivery-status.description');

      // return the non-falsey property value, but prefer the 'message' property if both are truthy
      // - note: this may change in the future
      return deliveryMsg || deliveryDescr;
    }

    function getDisplayStatus(emailEvent) {
      var l10nKey = mailgunEventTypeToL10nKey(emailEvent);
      return $translate.instant(l10nKey);
    }

    function mkDeliveryText(deliveryCode, deliveryText) {
      var result = deliveryText;
      result = result.split('\n');

      // delivery message may be multi-line, as a compromise on requirements, we settle for
      //   taking just the first line to display
      result = _.first(result);

      // delivery code is always provided explicitly, but what if delivery code is also contained as
      //   part of the message text? we remove it, if present
      result = _.replace(result, deliveryCode, '');

      // because we end up using the delivery code explicitly as a prefix in the final value anyways
      result = deliveryCode + ': ' + result;
      return result;
    }

    function mkTooltipBodyHtml(eventType, deliveryCode, deliveryText) {
      // notes:
      // - currently as of 2017-01-19 we predefine tooltip messages for certain Mailgun API statuses
      var eventTypeWithPredefinedMsg = ['accepted', 'delivered', 'unsubscribed'];
      var eventTypeToUseDeliveryProps = ['failed', 'rejected'];
      if (_.includes(eventTypeWithPredefinedMsg, eventType)) {
        return $translate.instant('helpdesk.emailStatuses.tooltips.' + eventType);
      }

      // - for others where we know delivery 'code' and 'message' properties contain something
      //   meaningful, we use those values instead
      if (_.includes(eventTypeToUseDeliveryProps, eventType)) {
        return mkDeliveryText(deliveryCode, deliveryText);
      }
    }

    function mkTooltipHtml(emailEvent) {
      var timestamp = _.get(emailEvent, 'timestamp');
      var eventType = _.get(emailEvent, 'event');
      if (!timestamp || !eventType) {
        return $translate.instant('common.notAvailable');
      }

      var deliveryCode = _.get(emailEvent, 'delivery-status.code');
      var deliveryText = getDeliveryText(emailEvent);
      var header, body;
      header = '<b>' + HelpdeskService.unixTimestampToUTC(timestamp) + '</b>';
      body = mkTooltipBodyHtml(eventType, deliveryCode, deliveryText);

      // if event type is one that is currently not handled yet, only return the timestamp
      return (body ? header + '<br />' + body : header);
    }

    function clear(email, origProblemState) {
      // determine which delete function to use
      // - currently as of 2016-12-15, we only support clearing 'bounced' state
      var clearFn;
      var successL10nKey;
      switch (origProblemState) {
        case SUPPRESSED_STATE.BOUNCED:
          clearFn = HelpdeskService.clearBounceDetails;
          successL10nKey = 'helpdesk.clearBounceSuccess';
          break;
        case SUPPRESSED_STATE.UNSUBSCRIBED:
          clearFn = HelpdeskService.clearUnsubscribeDetails;
          successL10nKey = 'helpdesk.clearUnsubscribeSuccess';
          break;
        case SUPPRESSED_STATE.COMPLAINED:
          clearFn = HelpdeskService.clearComplaintDetails;
          successL10nKey = 'helpdesk.clearComplaintSuccess';
          break;
        default:
          break;
      }

      // set to loading state
      vm.user.lastEmailStatus.problemState = SUPPRESSED_STATE.LOADING;

      // attempt delete, update the state, and notify
      return clearFn(email)
        .then(function () {
          vm.user.lastEmailStatus.problemState = null;
          Notification.success(successL10nKey);
        })
        .catch(function (response) {
          vm.user.lastEmailStatus.problemState = origProblemState;
          vm._helpers.notifyError(response);
        });
    }

    function hasEmailStatus() {
      return !!_.get(vm, 'user.lastEmailStatus');
    }

    function hasEmailProblem() {
      return !!_.get(vm, 'user.lastEmailStatus.problemState');
    }

    function checkAllMailgunSuppressionTypes(email, emailEvent) {
      var deferred = $q.defer();
      var numEndpointsChecked = 0;

      // three mailgun supression-types total
      // - bounces
      // - unsubscribes
      // - complaints
      var TOTAL_ENDPOINTS = 3;

      var wrappedEmailEvent = {
        emailEvent: emailEvent,
      };

      // notes:
      // - make three async calls (one for each endpoint)
      // - currently as of 2017-01-19, doesn't matter if user is on multiple suppression lists (this
      //   is an unlikely, but not impossible scenario)
      // - first http 200 response wins (and user is designated in that problem state)
      // - if all three 404, user is not on any suppression list, so we simply resolve

      function _resolveIfAllEndpointsChecked() {
        numEndpointsChecked = numEndpointsChecked + 1;
        if (numEndpointsChecked === TOTAL_ENDPOINTS) {
          deferred.resolve(wrappedEmailEvent);
        }
      }

      // bounces
      HelpdeskService.hasBounceDetails(email)
        .then(function () {
          wrappedEmailEvent.problemState = SUPPRESSED_STATE.BOUNCED;
          deferred.resolve(wrappedEmailEvent);
        })
        .catch(_resolveIfAllEndpointsChecked);

      // unsubscribes
      HelpdeskService.hasUnsubscribeDetails(email)
        .then(function () {
          wrappedEmailEvent.problemState = SUPPRESSED_STATE.UNSUBSCRIBED;
          deferred.resolve(wrappedEmailEvent);
        })
        .catch(_resolveIfAllEndpointsChecked);

      // complaints
      HelpdeskService.hasComplaintDetails(email)
        .then(function () {
          wrappedEmailEvent.problemState = SUPPRESSED_STATE.COMPLAINED;
          deferred.resolve(wrappedEmailEvent);
        })
        .catch(_resolveIfAllEndpointsChecked);

      return deferred.promise;
    }

    function resetEmailStatus() {
      // reset property to remove any previous display value
      vm.user.lastEmailStatus = null;
    }

    function refreshEmailStatus(email) {
      var lastEmailStatus = {};

      resetEmailStatus();

      // notes:
      // - even though we retrieve user details from 'getUser()', we fetch a user's email
      //   status separately (it's also managed by a separate end-point anyways)
      return HelpdeskService.getLatestEmailEvent(email)
        .then(function (emailEvent) {
          return checkAllMailgunSuppressionTypes(email, emailEvent);
        })
        .then(function (wrappedEmailEvent) {
          lastEmailStatus.problemState = wrappedEmailEvent.problemState;
          return wrappedEmailEvent.emailEvent;
        })
        .then(function (emailEvent) {
          var displayStatus = getDisplayStatus(emailEvent);
          var toolTipHtml = mkTooltipHtml(emailEvent);
          lastEmailStatus.displayStatus = displayStatus;
          lastEmailStatus.toolTipHtml = toolTipHtml;
        })
        .catch(vm._helpers.notifyError)
        .finally(function () {
          vm.user.lastEmailStatus = lastEmailStatus;
        });
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

      refreshEmailStatus(user.userName);

      vm.messageCard = HelpdeskCardsUserService.getMessageCardForUser(user);
      vm.meetingCard = HelpdeskCardsUserService.getMeetingCardForUser(user);
      vm.callCard = HelpdeskCardsUserService.getCallCardForUser(user);
      vm.careCard = HelpdeskCardsUserService.getCareCardForUser(user);
      vm.hybridServicesCard = HelpdeskCardsUserService.getHybridServicesCardForUser(user);
      vm.isCare = vm.careCard.entitled;

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
                vm.hybridServicesCard.uc.showUserNumbers = false;
                if (vm.hybridServicesCard.uc.status.state === 'error' || vm.hybridServicesCard.uc.status.state === 'activated') {
                  vm.hybridServicesCard.uc.showUserNumbers = true;
                  UCCService.getUserDiscovery(vm.userId, vm.orgId)
                    .then(function (userDiscovery) {
                      vm.hybridServicesCard.uc.directoryUri = userDiscovery.directoryURI;
                      vm.hybridServicesCard.uc.primaryDn = userDiscovery.primaryDn;
                      vm.hybridServicesCard.uc.telephoneNumber = userDiscovery.telephoneNumber;
                      vm.hybridServicesCard.uc.ucmCluster = userDiscovery.UCMInfo && userDiscovery.UCMInfo.ClusterFQDN;
                    });
                }
                break;
              case 'squared-fusion-ec':
                vm.hybridServicesCard.ec.status = status;
                break;
              case 'spark-hybrid-impinterop':
                vm.hybridServicesCard.imp.status = status;
                break;
            }
            if (status.lastStateChange) {
              status.lastStateChangeText = HybridServicesI18NService.getTimeSinceText(status.lastStateChange);
            }
            if (status.clusterId) {
              HybridServicesClusterService.get(status.clusterId, vm.orgId).then(function (cluster) {
                status.homedCluster = cluster;
                status.homedConnector = _.find(cluster.connectors, { id: status.connectorId });
              });
            }
            if (status.resourceGroupId) {
              ResourceGroupService.get(status.resourceGroupId, vm.orgId).then(function (resourceGroup) {
                status.resourceGroup = resourceGroup;
              });
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
        var searchLimit = vm.isCare ? 300 : 1;
        var searchOpts = {
          limit: searchLimit,
        };
        HelpdeskLogService.searchLogs(vm.userId, searchOpts).then(function (response) {
          var metadataList = _.get(response, 'data.metadataList');
          if (vm.isCare) {
            vm.lastPushedCareLog = filterLog(metadataList, function (metadata) {
              return _.get(metadata, 'meta.product') === 'sparkCare';
            });
            vm.lastPushedLog = filterLog(metadataList, function (metadata) {
              return _.get(metadata, 'meta.product') !== 'sparkCare';
            });
          } else {
            vm.lastPushedLog = HelpdeskLogService.cleanLogMetadata(_.head(metadataList));
          }
        }, _.noop);
      }

      vm.cardsAvailable = true;
    }

    function filterLog(metadataList, condnFn) {
      var filteredMetadata = _.find(metadataList, condnFn);
      if (filteredMetadata) {
        return HelpdeskLogService.cleanLogMetadata(filteredMetadata);
      }
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

    function keyPressHandler(event) {
      if (!AccessibilityService.isVisible(AccessibilityService.MODAL) && event.keyCode === KeyCodes.ESCAPE) {
        $window.history.back();
      }
    }

    function notifyError(response) {
      Notification.errorResponse(response, 'helpdesk.unexpectedError');
    }

    function openHybridServicesModal() {
      vm.loadingHSData = true;
      USSService.getUserJournal(vm.userId, vm.orgId, 20)
        .then(function (hsData) {
          $modal.open({
            template: require('modules/squared/helpdesk/helpdesk-extended-information.html'),
            controller: 'HelpdeskExtendedInfoDialogController as modal',
            resolve: {
              title: function () {
                return 'helpdesk.userStatusEventLog';
              },
              data: function () {
                return hsData;
              },
            },
          });
        })
        .catch(function (error) {
          Notification.errorResponse(error, 'hercules.genericFailure');
        })
        .finally(function () {
          vm.loadingHSData = false;
        });
    }

    function logMetrics(info) {
      MetricsService.trackDiagnosticMetric(DiagnosticKey.HELPDESK_ADMIN_ELEVATION, info);
    }
  }
}());
