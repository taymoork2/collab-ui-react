(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OverviewCtrl', OverviewCtrl);

  /* @ngInject */
  function OverviewCtrl($scope, Log, Authinfo, $translate, ReportsService, Orgservice, ServiceDescriptor, Config, OverviewCardFactory) {
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
    ReportsService.huronHealthMonitor(_.partial(forwardEvent, 'healthStatusUpdatedHandler'));

    ServiceDescriptor.services(_.partial(forwardEvent, 'hybridStatusEventHandler'), true);

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
  }
})();
