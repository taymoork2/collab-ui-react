(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OverviewCtrl', OverviewCtrl);

  /* @ngInject */
  function OverviewCtrl($scope, Log, $translate, $state, ReportsService, Orgservice, CsdmDeviceService, Config) {

    var vm = this;
    vm.pageTitle = $translate.instant('overview.pageTitle');
    var cards = [
      {
        key: 'message',
        icon: 'icon-circle-message',
        eventHandler: messageEventHandler,
        healthStatusUpdatedHandler: messageHealthEventHandler
      },
      {
        key: 'meeting', icon: 'icon-circle-group',
        healthStatusUpdatedHandler: meeetingHealthEventHandler
      },
      {
        key: 'call', icon: 'icon-circle-call', eventHandler: callEventHandler,
        healthStatusUpdatedHandler: meeetingHealthEventHandler
      },
      {
        key: 'roomSystem',
        icon: 'icon-circle-telepresence',
        currentTitle: 'overview.cards.roomSystem.currentTitle',
        previousTitle: 'overview.cards.roomSystem.previousTitle',
        deviceUpdateEventHandler: deviceUpdateEventHandler
      }
    ];
    vm.cards = _.map(cards, function (card) {
      card.name = $translate.instant('overview.cards.' + card.key + '.title');
      card.desc = $translate.instant('overview.cards.' + card.key + '.desc');
      return card;
    });

    vm.user = {};

    vm.hybrid = {};

    function messageHealthEventHandler(data) {
      _.each(data.components, function (component) {
        if (component.name == 'Mobile Clients' || component.name == 'Rooms'
          || component.name == 'Web and Desktop Clients') {

          this.healthStatus = mapStatus(this.healthStatus, component.status);
        }
      }, this);
    }

    function deviceUpdateEventHandler(response) {

      if (response.data) {
        this.current = _.size(response.data);

        var last30Days = new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 30));

        var filteredRes = _.filter(response.data, function (value, key) {
          return new Date(value.createTime) > last30Days;
        });

        this.previous = _.size(filteredRes);
      }
    }

    function meeetingHealthEventHandler(data) {
      _.each(data.components, function (component) {
        if (component.name == 'Media/Calling') {
          this.healthStatus = mapStatus(this.healthStatus, component.status);
        }
      }, this);
    }

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
      if (data.success) {
        vm.user.ssoEnabled = data.ssoEnabled || false;
        vm.user.dirsyncEnabled = data.dirsyncEnabled || false;
      } else {
        Log.error("Query active users metrics failed. Status: " + status);
      }
    });

    vm.statusPageUrl = Config.getStatusPageUrl();

    vm.openConvertModal = function () {
      $state.go('users.convert', {});
    };

    function mapStatus(oldStatus, componentStatus) {
      if (oldStatus == 'error') return 'error';

      if (componentStatus == "partial_outage" || oldStatus == 'warning') return "warning";

      if (componentStatus == "operational") return "success";

      return "error";
    }

    vm.deviceListSubscription = CsdmDeviceService.on('data', function (data) {
      _.each(cards, function (card) {
        if (card.deviceUpdateEventHandler) {
          card.deviceUpdateEventHandler(data);
        }
      });
    }, {
      scope: $scope
    });

    ReportsService.healthMonitor(function (data, status) {
      if (data.success) {
        _.each(cards, function (card) {
          if (card.healthStatusUpdatedHandler) {
            card.healthStatusUpdatedHandler(data);
          }
        });
      } else {
        Log.error("Get health status failed. Status: " + status);
      }
    });
  }
})();
