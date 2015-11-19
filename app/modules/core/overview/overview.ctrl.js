(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OverviewCtrl', OverviewCtrl);

  /* @ngInject */
  function OverviewCtrl($scope, Log, $translate, $state, ReportsService, Orgservice, CsdmDeviceService, Config) {
    var vm = this;

    vm.pageTitle = $translate.instant('overview.pageTitle');

    vm.cards = [
      new MessageCard(),
      new MeetingCard(),
      new CallCard(),
      new RoomSystemCard()
    ];

    vm.userCard = new UserCard();

    vm.statusPageUrl = Config.getStatusPageUrl();

    vm.openConvertModal = function () {
      $state.go('users.convert', {});
    };

    _.each(['callsLoaded', 'conversationsLoaded'], function (eventType) {
      $scope.$on(eventType, function (event, response) {
        _.each(vm.cards, function (card) {
          if (card.eventHandler) {
            card.eventHandler(event, response);
          }
        });
      });
    });

    ReportsService.getOverviewMetrics(true);

    Orgservice.getOrg(vm.userCard.orgEventHandler);
    Orgservice.getUnlicensedUsers(vm.userCard.unlicencedUsersHandler);

    CsdmDeviceService.on('data', function (data) {
      _.each(vm.cards, function (card) {
        if (card.deviceUpdateEventHandler) {
          card.deviceUpdateEventHandler(data);
        }
      });
    }, {
      scope: $scope
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
  }

  function mapStatus(oldStatus, componentStatus) {
    if (oldStatus == 'error') return 'error';
    if (componentStatus == "partial_outage" || oldStatus == 'warning') return "warning";
    if (componentStatus == "operational") return "success";
    return "error";
  }

  function meeetingHealthEventHandler(card, data) {
    _.each(data.components, function (component) {
      if (component.name == 'Media/Calling') {
        card.healthStatus = mapStatus(card.healthStatus, component.status);
      }
    });
  }

  function MessageCard() {
    var card = this;
    this.icon = 'icon-circle-message';
    this.desc = 'overview.cards.message.desc';
    this.name = 'overview.cards.message.title';
    this.eventHandler = messageEventHandler;
    this.healthStatusUpdatedHandler = messageHealthEventHandler;

    function messageEventHandler(event, response) {
      if (!response.data.success) return;
      if (event.name == 'conversationsLoaded' && response.data.spanType == 'month' && response.data.intervalCount >= 2) {
        card.current = Math.round(response.data.data[0].count);
        card.previous = Math.round(response.data.data[1].count);
      }
    }

    function messageHealthEventHandler(data) {
      _.each(data.components, function (component) {
        if (component.name == 'Mobile Clients' || component.name == 'Rooms' || component.name == 'Web and Desktop Clients') {
          card.healthStatus = mapStatus(card.healthStatus, component.status);
        }
      });
    }
  }

  function MeetingCard() {
    this.icon = 'icon-circle-group';
    this.desc = 'overview.cards.meeting.desc';
    this.name = 'overview.cards.meeting.title';
    this.healthStatusUpdatedHandler = _.partial(meeetingHealthEventHandler, this);
  }

  function CallCard() {
    var card = this;
    this.icon = 'icon-circle-call';
    this.desc = 'overview.cards.call.desc';
    this.name = 'overview.cards.call.title';
    this.healthStatusUpdatedHandler = _.partial(meeetingHealthEventHandler, card);
    this.eventHandler = callEventHandler;

    function callEventHandler(event, response) {
      if (!response.data.success) return;
      if (event.name == 'callsLoaded' && response.data.spanType == 'month' && response.data.intervalCount >= 2) {
        card.current = Math.round(response.data.data[0].count);
        card.previous = Math.round(response.data.data[1].count);
      }
    }
  }

  function RoomSystemCard() {
    var card = this;
    this.icon = 'icon-circle-telepresence';
    this.desc = 'overview.cards.roomSystem.desc';
    this.name = 'overview.cards.roomSystem.title';
    this.currentTitle = 'overview.cards.roomSystem.currentTitle';
    this.previousTitle = 'overview.cards.roomSystem.previousTitle';
    this.settingsUrl = '#/devices';
    this.deviceUpdateEventHandler = deviceUpdateEventHandler;

    function deviceUpdateEventHandler(response) {
      if (response.data) {
        card.current = _.size(response.data);
        var last30Days = new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 30));
        var filteredRes = _.filter(response.data, function (value, key) {
          return new Date(value.createTime) > last30Days;
        });
        card.previous = _.size(filteredRes);
      }
    }
  }

  function UserCard() {
    var card = this;
    this.orgEventHandler = orgEventHandler;
    this.unlicencedUsersHandler = unlicencedUsersHandler;

    function unlicencedUsersHandler(data) {
      if (data.success && data.resources) {
        card.usersToConvert = data.resources.length; // for now use the length to get the count as there is a bug in CI and totalResults is not accurate.
      }
    }

    function orgEventHandler(data) {
      if (data.success) {
        card.ssoEnabled = data.ssoEnabled || false;
        card.dirsyncEnabled = data.dirsyncEnabled || false;
      }
    }
  }

})();
