(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OverviewCtrl', OverviewCtrl);

  /* @ngInject */
  function OverviewCtrl($scope, $rootScope, $state, Log, Authinfo, $translate, ReportsService, Orgservice, ServiceDescriptor, Config, OverviewCardFactory, UrlConfig, Notification) {
    var vm = this;

    vm.pageTitle = $translate.instant('overview.pageTitle');
    vm.isCSB = Authinfo.isCSB();
    vm.cards = [
      OverviewCardFactory.createMessageCard(),
      OverviewCardFactory.createMeetingCard(),
      OverviewCardFactory.createCallCard(),
      OverviewCardFactory.createRoomSystemsCard(),
      OverviewCardFactory.createHybridServicesCard(),
      OverviewCardFactory.createUsersCard()
    ];

    function init() {
      removeCardUserTitle();
      setSipUriNotification();
    }

    function removeCardUserTitle() {
      if (vm.isCSB) {
        _.remove(vm.cards, {
          name: 'overview.cards.users.title'
        });
      }
    }

    function forwardEvent(handlerName) {
      var eventArgs = [].slice.call(arguments, 1);
      _.each(vm.cards, function (card) {
        if (typeof (card[handlerName]) === 'function') {
          card[handlerName].apply(card, eventArgs);
        }
      });
    }

    forwardEvent('licenseEventHandler', Authinfo.getLicenses());

    vm.statusPageUrl = UrlConfig.getStatusPageUrl();

    _.each(['oneOnOneCallsLoaded', 'groupCallsLoaded', 'conversationsLoaded', 'activeRoomsLoaded'], function (eventType) {
      $scope.$on(eventType, _.partial(forwardEvent, 'reportDataEventHandler'));
    });

    ReportsService.getOverviewMetrics(true);

    Orgservice.getAdminOrg(_.partial(forwardEvent, 'orgEventHandler'), false, true);

    Orgservice.getUnlicensedUsers(_.partial(forwardEvent, 'unlicensedUsersHandler'));

    ReportsService.healthMonitor(_.partial(forwardEvent, 'healthStatusUpdatedHandler'));

    ServiceDescriptor.services(_.partial(forwardEvent, 'hybridStatusEventHandler'), true);

    vm.isCalendarAcknowledged = true;
    vm.isCallAwareAcknowledged = true;
    vm.isCallConnectAcknowledged = true;
    vm.isCloudSipUriSet = false;
    vm.isSipUriAcknowledged = false;
    init();
    vm.setSipUriNotification = setSipUriNotification;

    Orgservice.getHybridServiceAcknowledged().then(function (response) {
      if (response.status === 200) {
        angular.forEach(response.data.items, function (items) {
          if (items.id === Config.entitlements.fusion_cal) {
            vm.isCalendarAcknowledged = items.acknowledged;
          } else if (items.id === Config.entitlements.fusion_uc) {
            vm.isCallAwareAcknowledged = items.acknowledged;
          } else if (items.id === Config.entitlements.fusion_ec) {
            vm.isCallConnectAcknowledged = items.acknowledged;
          }
        });
      } else {
        Log.error("Error in GET service acknowledged status");
      }
    });

    function setSipUriNotification() {
      Orgservice.getOrg(function (data, status) {
        if (status === 200) {
          vm.isCloudSipUriSet = !!data.orgSettings.sipCloudDomain;
        } else {
          Log.debug('Get existing org failed. Status: ' + status);
          Notification.error('firstTimeWizard.sparkDomainManagementServiceErrorMessage');
        }
      });
    }

    vm.setHybridAcknowledged = function (serviceName) {
      if (serviceName === 'calendar-service') {
        vm.isCalendarAcknowledged = true;
      } else if (serviceName === 'call-aware-service') {
        vm.isCallAwareAcknowledged = true;
      } else if (serviceName === 'call-connect-service') {
        vm.isCallConnectAcknowledged = true;
      }
      Orgservice.setHybridServiceAcknowledged(serviceName);
    };

    vm.setSipUriNotificationAcknowledged = function () {
      vm.isSipUriAcknowledged = true;
    };

    $scope.$on('DISMISS_SIP_NOTIFICATION', vm.setSipUriNotificationAcknowledged);

    $rootScope.$watch('ssoEnabled', function () {
      Orgservice.getAdminOrg(_.partial(forwardEvent, 'orgEventHandler'), false, true);
    });

    vm.showServiceActivationPage = function (serviceName) {
      if (serviceName === 'calendar-service') {
        $state.go('calendar-service.list');
      } else if (serviceName === 'call-aware-service') {
        $state.go('call-service.list');
      } else if (serviceName === 'call-connect-service') {
        $state.go('call-service.list');
      }
      vm.setHybridAcknowledged(serviceName);
    };

    vm.showEnterpriseSettings = function () {
      $state.go('setupwizardmodal', {
        currentTab: 'enterpriseSettings'
      });
    };

    vm.showSSOSettings = function () {
      $state.go('setupwizardmodal', {
        currentTab: 'enterpriseSettings',
        currentStep: 'init'
      });
    };

    vm.setupNotDone = function () {
      return !!(!Authinfo.isSetupDone() && Authinfo.isCustomerAdmin());
    };

    vm.openFirstTimeSetupWiz = function () {
      $state.go('firsttimewizard');
    };

    vm.displayNotifications = function () {
      return (vm.setupNotDone() || !(vm.isCalendarAcknowledged && vm.isCallAwareAcknowledged && vm.isCallConnectAcknowledged && (vm.isSipUriAcknowledged || vm.isCloudSipUriSet)));
    };
  }
})();
