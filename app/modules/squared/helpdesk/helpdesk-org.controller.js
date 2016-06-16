(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskOrgController($stateParams, HelpdeskService, XhrNotificationService, HelpdeskCardsOrgService, Config, $translate, LicenseService, $scope, $state, Authinfo, $window, UrlConfig) {
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
    vm.statusPageUrl = UrlConfig.getStatusPageUrl();
    vm.showAllAdminUsers = showAllAdminUsers;
    vm.hideAllAdminUsers = hideAllAdminUsers;
    vm.keyPressHandler = keyPressHandler;
    vm.daysLeftText = daysLeftText;
    vm.gotoSearchUsersAndDevices = gotoSearchUsersAndDevices;
    vm.usageText = usageText;
    vm.launchAtlasReadonly = launchAtlasReadonly;
    vm.isTrials = isTrials;
    vm.allowLaunchAtlas = false;
    HelpdeskService.getOrg(vm.orgId).then(initOrgView, XhrNotificationService.notify);
    
    function setReadOnlyLaunchButtonVisibility(orgData) {
      if (Authinfo.getOrgId() != "ce8d17f8-1734-4a54-8510-fae65acc505e" && Authinfo.getOrgId() != "d5235404-6637-4050-9978-e3d0f4338c36" && Authinfo.getOrgId() != "1eb65fdf-9643-417f-9974-ad72cae0e10f" && Authinfo.getOrgId() != "6f631c7b-04e5-4dfe-b359-47d5fa9f4837") {
        vm.allowLaunchAtlas = false;
      } else if (orgData.id == Authinfo.getOrgId()) {
        vm.allowLaunchAtlas = false;
      } else if (!orgData.orgSettings) {
        vm.allowLaunchAtlas = true;
      } else {
        var orgSettings = JSON.parse(_.last(orgData.orgSettings));
        vm.allowLaunchAtlas = orgSettings.allowReadOnlyAccess;
      }
    }

    function isTrials(orgSettings) {
      var eft = false;
      if (orgSettings) {
        var orgSettingsJson = JSON.parse(_.last(orgSettings));
        eft = orgSettingsJson.isEFT;
      }
      return eft;
    }

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
      vm.supportedBy = isTrials(org.orgSettings) ? $translate.instant('helpdesk.trials') : $translate.instant('helpdesk.ts');
      angular.element(".helpdesk-details").focus();
      setReadOnlyLaunchButtonVisibility(org);
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
      HelpdeskService.usersWithRole(org.id, 'id_full_admin', 100).then(function (users) {
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
        $window.history.back();
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
