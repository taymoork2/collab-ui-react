(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OverviewCtrl', OverviewCtrl);

  /* @ngInject */
  function OverviewCtrl($scope, $translate, ReportsService) {
    var vm = this;
    vm.pageTitle = $translate.instant('overview.pageTitle');
    vm.cards = [
      {name: 'Room Systems', icon: 'icon-circle-message', level: 'info', levelText: 'Excellent'},
      {
        name: 'Message',
        icon: 'icon-circle-calendar',
        level: 'warn',
        levelText: 'Warning',
        eventHandler: messageEventHandler
      },
      {name: 'Meeting', icon: 'icon-circle-comp-pos', level: 'error', levelText: 'Error'},
      {
        name: 'Call',
        icon: 'icon-circle-contact-centre',
        level: 'info',
        levelText: 'Check status',
        eventHandler: callEventHandler
      },
      {name: 'Hybrid Services', icon: 'icon-circle-localize', level: 'info', levelText: 'Excellent'}
    ];

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

  }
})();
