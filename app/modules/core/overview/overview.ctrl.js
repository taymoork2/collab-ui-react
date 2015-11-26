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
      OverviewCardFactory.messageCard,
      OverviewCardFactory.meetingCard,
      OverviewCardFactory.callCard,
      OverviewCardFactory.roomSystemsCard,
    ];

    vm.userCard = OverviewCardFactory.usersCard;
    vm.hybridCard = OverviewCardFactory.hybridServicesCard;

    _.each(vm.cards, function (card) {
      if (card.licenseEventHandler) {
        card.licenseEventHandler(Authinfo.getLicenses());
      }
    });

    vm.statusPageUrl = Config.getStatusPageUrl();

    vm.openConvertModal = function () {
      $state.go('users.convert', {});
    };

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

    Orgservice.getAdminOrg(function (orgData) {
      _.each(vm.cards, function (card) {
        if (card.orgEventHandler) {
          card.orgEventHandler(orgData);
        }
      });
      vm.userCard.orgEventHandler(orgData);
    });
    Orgservice.getUnlicensedUsers(vm.userCard.unlicensedUsersHandler);

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
        if (vm.hybridCard.hybridStatusEventHandler) {
          vm.hybridCard.hybridStatusEventHandler(services);
        }
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

    ServiceStatusDecriptor.servicesInOrgWithStatus().then(vm.hybridCard.adminOrgServiceStatusEventHandler);

  }

  //list: https://sqbu-github.cisco.com/WebExSquared/wx2-admin-service/blob/master/common/src/main/java/com/cisco/wx2/atlas/common/bean/order/OfferCode.java

})();
