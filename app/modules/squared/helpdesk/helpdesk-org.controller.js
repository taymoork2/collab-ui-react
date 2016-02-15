(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskOrgController($stateParams, HelpdeskService, XhrNotificationService, HelpdeskCardsOrgService, Config,
    $translate, LicenseService, $scope, $state, Authinfo, $window) {
    $('body').css('background', 'white');
    var vm = this;
    if ($stateParams.org) {
      vm.org = $stateParams.org;
      vm.orgId = vm.org.id;
    } else {
      vm.orgId = $stateParams.id;
    }
    vm.messageCard = {};
    vm.meetingCard = {};
    vm.callCard = {};
    vm.hybridServicesCard = {};
    vm.roomSystemsCard = {};
    vm.userCard = {};

    vm.initialAdminUserLimit = 3;
    vm.adminUserLimit = vm.initialAdminUserLimit;
    vm.licenseUsageReady = false;
    vm.showLicenseToggles = [];
    vm.statusPageUrl = Config.getStatusPageUrl();
    vm.showAllAdminUsers = showAllAdminUsers;
    vm.hideAllAdminUsers = hideAllAdminUsers;
    vm.keyPressHandler = keyPressHandler;
    vm.daysLeftText = daysLeftText;
    vm.gotoSearchUsersAndDevices = gotoSearchUsersAndDevices;
    vm.usageText = usageText;
    vm.launchAtlasReadonly = launchAtlasReadonly;
    vm.allowLaunchAtlas = vm.orgId != Authinfo.getOrgId() && Authinfo.getOrgId() === "ce8d17f8-1734-4a54-8510-fae65acc505e"; // Only show for help desk users in Marvel org (for testing)

    HelpdeskService.getOrg(vm.orgId).then(initOrgView, XhrNotificationService.notify);

    function initOrgView(org) {
      vm.org = org;
      vm.delegatedAdministration = org.delegatedAdministration ? $translate.instant('helpdesk.delegatedAdministration', {
        numManages: org.manages ? org.manages.length : 0
      }) : null;

      LicenseService.getLicensesInOrg(vm.orgId).then(function (licenses) {
        initCards(licenses);
        findLicenseUsage();
      }, XhrNotificationService.notify);

      findManagedByOrgs(org);
      findWebExSites(org);
      findAdminUsers(org);
      angular.element(".helpdesk-details").focus();
    }

    function initCards(licenses) {
      vm.messageCard = HelpdeskCardsOrgService.getMessageCardForOrg(vm.org, licenses);
      vm.meetingCard = HelpdeskCardsOrgService.getMeetingCardForOrg(vm.org, licenses);
      vm.callCard = HelpdeskCardsOrgService.getCallCardForOrg(vm.org, licenses);
      vm.hybridServicesCard = HelpdeskCardsOrgService.getHybridServicesCardForOrg(vm.org);
      vm.roomSystemsCard = HelpdeskCardsOrgService.getRoomSystemsCardForOrg(vm.org, licenses);
    }

    function findManagedByOrgs(org) {
      if (org.managedBy && org.managedBy.length > 0) {
        org.managedByOrgs = [];
        _.each(org.managedBy, function (managingOrg) {
          HelpdeskService.getOrgDisplayName(managingOrg.orgId).then(function (displayName) {
            if (displayName) {
              org.managedByOrgs.push({
                id: managingOrg.orgId,
                displayName: displayName
              });
            }
          }, angular.noop);
        });
      }
    }

    function findWebExSites(org) {
      if (LicenseService.orgIsEntitledTo(org, 'cloudMeetings')) {
        HelpdeskService.getWebExSites(vm.orgId).then(function (sites) {
          vm.org.webExSites = sites;
        }, XhrNotificationService.notify);
      }
    }

    function findAdminUsers(org) {
      HelpdeskService.searchUsers('', org.id, 100, 'id_full_admin').then(function (users) {
        vm.adminUsers = users;
        vm.showAllAdminUsersText = $translate.instant('helpdesk.showAllAdminUsers', {
          numUsers: users.length
        });
      }, XhrNotificationService.notify);
    }

    function findLicenseUsage() {
      if (vm.orgId != Config.ciscoOrgId) {
        LicenseService.getLicensesInOrg(vm.orgId, true).then(function (licenses) {
          // Update the relevant cards with licenses that includes usage
          vm.messageCard = HelpdeskCardsOrgService.getMessageCardForOrg(vm.org, licenses);
          vm.meetingCard = HelpdeskCardsOrgService.getMeetingCardForOrg(vm.org, licenses);
          vm.callCard = HelpdeskCardsOrgService.getCallCardForOrg(vm.org, licenses);
          vm.roomSystemsCard = HelpdeskCardsOrgService.getRoomSystemsCardForOrg(vm.org, licenses);
          vm.licenseUsageReady = true;
        }, angular.noop);
      }
    }

    function showAllAdminUsers() {
      vm.adminUserLimit = vm.adminUsers.length;
    }

    function hideAllAdminUsers() {
      vm.adminUserLimit = vm.initialAdminUserLimit;
    }

    function keyPressHandler(event) {
      switch (event.keyCode) {
      case 27: // Esc
        window.history.back();
        break;
      case 83: // S
        gotoSearchUsersAndDevices();
        break;
      }
    }

    function daysLeftText(license) {
      return $translate.instant('helpdesk.numDaysLeft', {
        days: license.trialExpiresInDays
      });
    }

    function usageText(usage, volume) {
      return $translate.instant('helpdesk.usage', {
        usage: usage,
        volume: volume
      });
    }

    function gotoSearchUsersAndDevices() {
      $scope.$parent.helpdeskCtrl.initSearchWithOrgFilter(vm.org);
      $state.go('helpdesk.search');
    }

    function launchAtlasReadonly() {
      vm.launchingAtlas = true;
      HelpdeskService.elevateToReadonlyAdmin(vm.orgId).then(function () {
          $window.open($state.href('login_swap', {
            customerOrgId: vm.orgId,
            customerOrgName: vm.org.displayName
          }));
        }, XhrNotificationService.notify)
        .finally(function () {
          vm.launchingAtlas = false;
        });
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskOrgController', HelpdeskOrgController);
}());
