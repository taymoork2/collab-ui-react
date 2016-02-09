(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OverviewCtrl', OverviewCtrl);

  /* @ngInject */
  function OverviewCtrl($scope, $state, Log, Authinfo, $translate, ReportsService, Orgservice, ServiceDescriptor, Config, OverviewCardFactory, FeatureToggleService) {
    var vm = this;

    vm.pageTitle = $translate.instant('overview.pageTitle');

    vm.cards = [
      OverviewCardFactory.createMessageCard(),
      OverviewCardFactory.createMeetingCard(),
      OverviewCardFactory.createCallCard(),
      OverviewCardFactory.createRoomSystemsCard(),
      OverviewCardFactory.createHybridServicesCard(),
      OverviewCardFactory.createUsersCard()
    ];

    function forwardEvent(handlerName) {
      var eventArgs = [].slice.call(arguments, 1);
      _.each(vm.cards, function (card) {
        if (typeof (card[handlerName]) === 'function') {
          card[handlerName].apply(card, eventArgs);
        }
      });
    }

    forwardEvent('licenseEventHandler', Authinfo.getLicenses());

    vm.statusPageUrl = Config.getStatusPageUrl();

    _.each(['oneOnOneCallsLoaded', 'groupCallsLoaded', 'conversationsLoaded', 'activeRoomsLoaded'], function (eventType) {
      $scope.$on(eventType, _.partial(forwardEvent, 'reportDataEventHandler'));
    });

    ReportsService.getOverviewMetrics(true);

    Orgservice.getAdminOrg(_.partial(forwardEvent, 'orgEventHandler'));

    Orgservice.getUnlicensedUsers(_.partial(forwardEvent, 'unlicensedUsersHandler'));

    ReportsService.healthMonitor(_.partial(forwardEvent, 'healthStatusUpdatedHandler'));

    ServiceDescriptor.services(_.partial(forwardEvent, 'hybridStatusEventHandler'), true);

    vm.isCalendarAcknowledged = true;
    vm.isCallAwareAcknowledged = true;
    vm.isCallConnectAcknowledged = true;
    vm.isCloudSipUriSet = false;
    vm.isEntitledUnderToggle = false;

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

    vm.setSipUriNotification = function () {
      return FeatureToggleService.supports(FeatureToggleService.features.atlasSipUriDomainEnterprise).then(function (result) {
        if (result) {
          vm.isEntitledUnderToggle = true;
          Orgservice.getOrg(function (data, status) {
            if (status === 200) {
              if (data.orgSettings.sipCloudDomain) {
                vm.isCloudSipUriSet = true;
              }
            } else {
              Log.debug('Get existing org failed. Status: ' + status);
              Notification.error('firstTimeWizard.sparkDomainManagementServiceErrorMessage');
            }
          });
        }
      });
    };
    vm.setSipUriNotification();

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

    vm.setupNotDone = function () {
      return !!(!Authinfo.isSetupDone() && Authinfo.isCustomerAdmin());
    };

    vm.openFirstTimeSetupWiz = function () {
      $state.go('firsttimewizard');
    };
  }
})();
