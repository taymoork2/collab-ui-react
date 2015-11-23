(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskUserController($stateParams, HelpdeskService, XhrNotificationService, $translate, USSService2) {
    var vm = this;
    var userId = null;
    var orgId = null;
    if ($stateParams.user) {
      userId = $stateParams.user.id;
      orgId = $stateParams.user.organization.id;
    } else {
      userId = $stateParams.id;
      orgId = $stateParams.orgId;
    }

    vm.resendInviteEmail = resendInviteEmail;
    vm.user = $stateParams.user;
    vm.resendInviteEnabled = false;
    vm.messaging = {
      entitled: false,
      entitlements: []
    };
    vm.meeting = {
      entitled: false,
      entitlements: []
    };
    vm.call = {
      entitled: false,
      entitlements: []
    };
    vm.hybrid = {
      entitled: false,
      cal: {
        entitled: false
      },
      uc: {
        entitled: false
      },
      ec: {
        entitled: false
      }
    };

    HelpdeskService.getUser(orgId, userId).then(function (res) {
      vm.user = res;
      reviewEntitlementsAndLicenses();
      vm.resendInviteEnabled = _.includes(vm.user.statuses, 'pending');
    }, function (err) {
      XhrNotificationService.notify(err);
    });

    HelpdeskService.getOrg(orgId).then(function (res) {
      vm.org = res;
    }, function (err) {
      XhrNotificationService.notify(err);
    });

    function resendInviteEmail() {
      HelpdeskService.resendInviteEmail(vm.user.displayName, vm.user.userName).then(function (res) {}, function (err) {
        XhrNotificationService.notify(err);
      });
    }

    function reviewEntitlementsAndLicenses() {
      // Messaging
      var paidOrFree;
      if (hasEntitlement('webex-squared')) {
        vm.messaging.entitled = true;
        if (hasEntitlement('squared-room-moderation')) {
          paidOrFree = isLicensedForService('MS') ? 'paid' : 'free';
          vm.messaging.entitlements.push($translate.instant('helpdesk.entitlements.squared-room-moderation.' + paidOrFree));
        } else {
          vm.messaging.entitlements.push($translate.instant('helpdesk.entitlements.webex-squared'));
        }
      }

      // Meeting
      if (hasEntitlement('squared-syncup')) {
        vm.meeting.entitled = true;
        paidOrFree = isLicensedForService('CF') ? 'paid' : 'free';
        vm.meeting.entitlements.push($translate.instant('helpdesk.entitlements.squared-syncup.' + paidOrFree));
      }

      // Call
      if (hasEntitlement('ciscouc')) {
        vm.call.entitled = true;
        paidOrFree = isLicensedForService('CO') ? 'paid' : 'free';
        vm.call.entitlements.push($translate.instant('helpdesk.entitlements.ciscouc.' + paidOrFree));
      }

      // Hybrid Services
      if (hasEntitlement('squared-fusion-cal')) {
        vm.hybrid.entitled = true;
        vm.hybrid.cal.entitled = true;
      }
      if (hasEntitlement('squared-fusion-uc')) {
        vm.hybrid.entitled = true;
        vm.hybrid.uc.entitled = true;
        vm.hybrid.ec.entitled = hasEntitlement('squared-fusion-uc');
      }
      if (vm.hybrid.entitled) {
        USSService2.getStatusesForUserInOrg(userId, orgId).then(function (statuses) {
          _.each(statuses, function (status) {
            status.collapsedState = USSService2.decorateWithStatus(status);
            switch (status.serviceId) {
            case 'squared-fusion-cal':
              vm.hybrid.cal.status = status;
              break;
            case 'squared-fusion-uc':
              vm.hybrid.uc.status = status;
              break;
            case 'squared-fusion-ec':
              vm.hybrid.ec.status = status;
              break;
            }
          });
        }, function (err) {
          XhrNotificationService.notify(err);
        });
      }
    }

    function hasEntitlement(entitlement) {
      if (vm.user && vm.user.entitlements) {
        return _.includes(vm.user.entitlements, entitlement);
      }
      return false;
    }

    function isLicensedForService(licPrefix) {
      if (vm.user && vm.user.entitlements) {
        var userLicenses = vm.user.licenseID;
        if (userLicenses) {
          for (var l = userLicenses.length - 1; l >= 0; l--) {
            var licensePrefix = userLicenses[l].substring(0, 2);
            if (licensePrefix === licPrefix) {
              return true;
            }
          }
        }
      }
      return false;
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskUserController', HelpdeskUserController);
}());
