(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OverviewCtrl', OverviewCtrl);

  /* @ngInject */
  function OverviewCtrl($scope, Log, Authinfo, $translate, $state, ReportsService, Orgservice, ServiceDescriptor, ServiceStatusDecriptor, Config, OverviewCardFactory) {
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

    _.each(vm.cards, function (card) {
      if (card.licenseEventHandler) {
        card.licenseEventHandler(Authinfo.getLicenses());
      }
    });

    vm.statusPageUrl = Config.getStatusPageUrl();

    _.each(['oneOnOneCallsLoaded', 'groupCallsLoaded', 'conversationsLoaded', 'activeRoomsLoaded'], function (eventType) {
      $scope.$on(eventType, function (event, response) {
        _.each(vm.cards, function (card) {
          if (card.reportDataEventHandler) {
            card.reportDataEventHandler(event, response);
          }
        });
      });
    });

    ReportsService.getOverviewMetrics(true);

    Orgservice.getAdminOrg(function (data) {
      _.each(vm.cards, function (card) {
        if (card.orgEventHandler) {
          card.orgEventHandler(data);
        }
      });
    });

    Orgservice.getUnlicensedUsers(function (data) {
      _.each(vm.cards, function (card) {
        if (card.unlicensedUsersHandler) {
          card.unlicensedUsersHandler(data);
        }
      });
    });

    ReportsService.healthMonitor(function (data, status) {
      if (data.success) {
        _.each(vm.cards, function (card) {
          if (card.healthStatusUpdatedHandler) {
            card.healthStatusUpdatedHandler(data);
          }
        });
      } else {
        Log.error("Get health status failed. Status: " + status);
      }
    });

    ServiceDescriptor.services(function (err, services) {
      if (!err) {
        _.each(vm.cards, function (card) {
          if (card.hybridStatusEventHandler) {
            card.hybridStatusEventHandler(services);
          }
        });
      }
    });

    vm.isCalendarAcknowledged = true;
    vm.isCallAcknowledged = true;

    Orgservice.getHybridServiceAcknowledged().then(function (response) {
      if (response.status === 200 && response.data.items) {
        vm.isCalendarAcknowledged = !!_.chain(response.data.items).find({
          id: 'sqared-fusion-cal'
        }).get('acknowledged', true).value();
        vm.isCallAcknowledged = !!_.chain(response.data.items).find({
          id: 'sqared-fusion-uc'
        }).get('acknowledged', true).value();
      } else {
        Log.error("Error in GET service acknowledged status");
      }
    });

    vm.setupNotDone = function () {
      return !!(!Authinfo.isSetupDone() && Authinfo.isCustomerAdmin());
    };

    ServiceStatusDecriptor.servicesInOrgWithStatus().then(function (status) {
      _.each(vm.cards, function (card) {
        if (card.adminOrgServiceStatusEventHandler) {
          card.adminOrgServiceStatusEventHandler(status);
        }
      });
    });
  }
})();
