(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OverviewCtrl', OverviewCtrl);

  /* @ngInject */
  function OverviewCtrl($scope, $translate, ReportsService, Orgservice, Config) {
    var vm = this;
    vm.pageTitle = $translate.instant('overview.pageTitle');
    var cards = [
      {key: 'message', icon: 'icon-circle-message', eventHandler: messageEventHandler},
      {key: 'meeting', icon: 'icon-circle-group'},
      {key: 'call', icon: 'icon-circle-call', eventHandler: callEventHandler},
      {key: 'roomSystem', icon: 'icon-circle-telepresence'},
    ];
    vm.cards = _.map(cards, function (card) {
      card.name = $translate.instant('overview.cards.' + card.key + '.title');
      card.desc = $translate.instant('overview.cards.' + card.key + '.desc');
      return card;
    });

    vm.user = {};

    function callEventHandler(event, response) {
      if (!response.data.success) return;

      if (event.name == 'callsLoaded' && response.data.spanType == 'month' && response.data.intervalCount >= 2) {

        this.current = Math.round(response.data.data[0].count);
        this.previous = Math.round(response.data.data[1].count);
      }
    }

    function messageEventHandler(event, response) {
      if (!response.data.success) return;

      if (event.name == 'conversationsLoaded' && response.data.spanType == 'month' && response.data.intervalCount >= 2) {

        this.current = Math.round(response.data.data[0].count);
        this.previous = Math.round(response.data.data[1].count);
      }
    }

    _.each(['callsLoaded', 'conversationsLoaded'], function (eventType) {
      $scope.$on(eventType, function (event, response) {
        _.each(vm.cards, function (card) {
          if (card.eventHandler) {
            card.eventHandler(event, response);
          }
        });
      })
    });

    ReportsService.getOverviewMetrics(true);

    Orgservice.getUnlicensedUsers(function (data) {
      if (data.success && data.resources) {
        // for now use the length to get the count as there is a bug in CI and totalResults
        // is not accurate.
        vm.user.usersToConvert = data.resources.length;
      }
    });


    Orgservice.getOrg(function (data, status) {
      if (status === 200) {
        console.log(data);
        vm.user.ssoEnabled = data.ssoEnabled || false;
        vm.user.dirsyncEnabled = data.dirsyncEnabled || false;
      } else {
        Log.error("Query active users metrics failed. Status: " + status);
      }
    });

    vm.statusPageUrl = Config.getStatusPageUrl();

    ReportsService.getHealthStatus()
      .then(function (status) {
        console.log('status::'+status);
        vm.healthStatus = status;
      });


  }
})();
