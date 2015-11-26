(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskOrgController($stateParams, HelpdeskService, XhrNotificationService, HelpdeskCardsService, ReportsService) {
    var vm = this;
    if ($stateParams.org) {
      vm.org = $stateParams.org;
      vm.orgId = vm.org.id;
    } else {
      vm.orgId = $stateParams.id;
    }
    vm.messageCard = {};
    vm.meetingCard = {};
    vm.callCard = {};
    vm.hybridServicesCard = {};
    vm.roomSystemsCard = {};

    var componentMapping = {
      message: ['Mobile Clients', 'Rooms', 'Web and Desktop Clients'],
      meeting: ['Media/Calling'],
      call: ['Media/Calling'],
      room: ['Rooms'],
      hybrid: ['Cloud Hybrid Services Management', 'Calendar Service']
    };

    vm.healthStatuses = {
      message: 'operational',
      meeting: 'operational',
      call: 'operational',
      room: 'operational',
      hybrid: 'operational'
    };

    ReportsService.healthMonitor(function (data, status) {
      if (data.success) {
        filterHealthStatuses(data.components);
      }
    });

    function deduceHealthStatus(statuses) {
      var error = _.find(statuses, function (status) {
        return status === 'error';
      });
      var warning = _.find(statuses, function (status) {
        return status === 'warning';
      });
      var partialOutage = _.find(statuses, function (status) {
        return status === 'partial_outage';
      });
      var operational = _.find(statuses, function (status) {
        return status === 'operational';
      });

      var status = error || warning || partialOutage || operational || 'error';
      return status;
    }

    function filterHealthStatuses(components) {
      var result = {
        message: [],
        meeting: [],
        call: [],
        room: [],
        hybrid: []
      };
      for (var i = 0; i < components.length; i++) {
        if (_.includes(componentMapping.message, components[i].name)) {
          result.message.push(components[i].status);
        }
        if (_.includes(componentMapping.meeting, components[i].name)) {
          result.meeting.push(components[i].status);
        }
        if (_.includes(componentMapping.call, components[i].name)) {
          result.call.push(components[i].status);
        }
        if (_.includes(componentMapping.room, components[i].name)) {
          result.room.push(components[i].status);
        }
        if (_.includes(componentMapping.hybrid, components[i].name)) {
          result.hybrid.push(components[i].status);
        }
      }

      vm.healthStatuses.message = deduceHealthStatus(result.message);
      vm.healthStatuses.meeting = deduceHealthStatus(result.meeting);
      vm.healthStatuses.call = deduceHealthStatus(result.call);
      vm.healthStatuses.room = deduceHealthStatus(result.room);
      vm.healthStatuses.hybrid = deduceHealthStatus(result.hybrid);
    }

    HelpdeskService.getOrg(vm.orgId).then(initOrgView, XhrNotificationService.notify);

    function initOrgView(org) {
      vm.org = org;
      vm.messageCard = HelpdeskCardsService.getMessageCardForOrg(org);
      vm.meetingCard = HelpdeskCardsService.getMeetingCardForOrg(org);
      vm.callCard = HelpdeskCardsService.getCallCardForOrg(org);
      vm.hybridServicesCard = HelpdeskCardsService.getHybridServicesCardForOrg(org);
      vm.roomSystemsCard = HelpdeskCardsService.getRoomSystemsCardForOrg(org);
      findPartners(org);
    }

    function findPartners(org) {
      if (org.managedBy && org.managedBy.length > 0) {
        org.partners = [];
        _.each(org.managedBy, function (parnterOrg) {
          HelpdeskService.getOrg(parnterOrg.orgId).then(function (res) {
            org.partners.push(res);
          }, angular.noop);
        });
      }
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskOrgController', HelpdeskOrgController);
}());
