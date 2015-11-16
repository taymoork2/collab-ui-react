(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OverviewCtrl', OverviewCtrl);

  /* @ngInject */
  function OverviewCtrl($scope, Log, $translate, $state, ReportsService, Orgservice, CsdmDeviceService, ServiceDescriptor, Config) {
    var vm = this;

    vm.pageTitle = $translate.instant('overview.pageTitle');

    vm.cards = [
      new MessageCard(),
      new MeetingCard(),
      new CallCard(),
      new RoomSystemCard()
    ];

    vm.userCard = new UserCard();
    vm.hybridCard = new HybridServicesCard();

    vm.statusPageUrl = Config.getStatusPageUrl();

    vm.openConvertModal = function () {
      $state.go('users.convert', {});
    };

    _.each(['oneOnOneCallsLoaded', 'groupCallsLoaded', 'conversationsLoaded'], function (eventType) {
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

    ServiceDescriptor.services(function (err, services) {
      if (!err) {
        if (vm.hybridCard.hybridStatusEventHandler) {
          vm.hybridCard.hybridStatusEventHandler(services);
        }
      }
    });


    //ClusterService.subscribe('data', function (data) {
      //if(!data.error){
      //console.log(ClusterService.getClusters());
      //console.log(ClusterService.getConnector());  //undefined, since no connector id is specified..
      //}
      //console.log(data);
      //var servicesKnow =[{id:'asdf'}];
      //var map = {};
      //_.each(data, function(cluster){
      //  _.each(cluster.services, function (service){
      //    if(map[service.service_type]){
      //      map[service.service_type] = [];
      //    }
      //    map[service.service_type].push(service.needs_attention);
      //  });
      //});
      //_.each(servicesKnow, function(service){
      //  if(map[service.id]){
      //    if(_.contains('needs_attetion')){
      //      service.status = 'warning';
      //    }
      //  }
      //});
    //});
    //ClusterService.getClusters
    //ConverterService.convertClusters()
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
    this.trial = false;
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
    var card = this;
    this.icon = 'icon-circle-group';
    this.desc = 'overview.cards.meeting.desc';
    this.name = 'overview.cards.meeting.title';
    this.cardClass = 'meetings';
    this.trial = true;
    this.healthStatusUpdatedHandler = _.partial(meeetingHealthEventHandler, card);
    this.eventHandler = callEventHandler;

    function callEventHandler(event, response) {
      if (!response.data.success) return;
      if (event.name == 'groupCallsLoaded' && response.data.spanType == 'month' && response.data.intervalCount >= 2) {
        card.current = Math.round(response.data.data[0].count);
        card.previous = Math.round(response.data.data[1].count);
      }
    }
  }

  function CallCard() {
    var card = this;
    this.icon = 'icon-circle-call';
    this.desc = 'overview.cards.call.desc';
    this.name = 'overview.cards.call.title';
    this.cardClass = 'people';
    this.healthStatusUpdatedHandler = _.partial(meeetingHealthEventHandler, card);
    this.eventHandler = callEventHandler;

    function callEventHandler(event, response) {
      if (!response.data.success) return;
      if (event.name == 'oneOnOneCallsLoaded' && response.data.spanType == 'month' && response.data.intervalCount >= 2) {
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
    this.cardClass = 'Call';
    this.currentTitle = 'overview.cards.roomSystem.currentTitle';
    this.previousTitle = 'overview.cards.roomSystem.previousTitle';
    this.settingsUrl = '#/devices';
    this.deviceUpdateEventHandler = deviceUpdateEventHandler;

    function deviceUpdateEventHandler(response) {
      if (response.data) {
        card.current = _.size(response.data);
        var last30Days = new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 30));
        card.previous = _(response.data)
          .filter(function (value, key) {
            return new Date(value.createTime) > last30Days;
          })
          .size();
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

  function HybridServicesCard() {
    var card = this;
    this.icon = 'icon-circle-data';
    //this.services = [];
    this.hybridStatusEventHandler = hybridStatusEventHandler;
    function hybridStatusEventHandler(services) {
      console.log('services', services);
      _.each(services, function (service) {
        service.statusIcon = !service.enabled || !service.acknowledged ? 'warning' : 'success';
      });
      card.services = services;
    }
  }
})();
