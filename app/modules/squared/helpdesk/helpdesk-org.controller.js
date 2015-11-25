(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskOrgController(Config, $stateParams, HelpdeskService, XhrNotificationService, Authinfo, ReportsService) {
    var vm = this;
    var orgId = null;
    if ($stateParams.org) {
      vm.org = $stateParams.org;
      orgId = vm.org.id;
    } else {
      orgId = $stateParams.id;
    }
    vm.showCard = showCard;

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

    HelpdeskService.getOrg(orgId).then(function (res) {
      vm.org = res;
      findPartners(vm.org);
    }, function (err) {
      XhrNotificationService.notify(err);
    });

    if (hasEntitlement(Config.entitlements.fusion_mgmt)) {
      HelpdeskService.getHybridServices(orgId).then(function (services) {
        var enabledHybridServices = _.filter(services, {
          enabled: true
        });
        if (enabledHybridServices.length === 1 && enabledHybridServices[0].id === "squared-fusion-mgmt") {
          enabledHybridServices = []; // Don't show the management service if none of the others are enabled.
        }
        vm.enabledHybridServices = enabledHybridServices;
        vm.availableHybridServices = _.filter(services, {
          enabled: false
        });
      }, function (err) {
        XhrNotificationService.notify(err);
      });
    }

    /*
      message : entitlement = "webex-squared" ?
      meeting (webex) : entitlement = "webex-messenger" ?
      call(huron) : authinfo.issquareduc()
      hybrid: Authinfo.isFusion()
      room (cloudberry): Authinfo.isDeviceManagement()
     */
    // TODO: Move and and reuse between user and org ?
    function showCard(type) {
      switch (type) {
        //TODO: Check for the CORRECT entitlements !!!
      case 'message':
        return hasEntitlement(Config.entitlements.squared); //???
      case 'meeting':
        return hasEntitlement("webex-messenger"); // ???
      case 'call':
        return hasEntitlement(Config.entitlements.huron);
      case 'hybrid':
        return hasEntitlement(Config.entitlements.fusion_mgmt);
      case 'room':
        return hasEntitlement(Config.entitlements.device_mgmt);
      }
      return true;
    }

    function hasEntitlement(entitlement) {
      if (vm.org && vm.org.services) {
        return _.includes(vm.org.services, entitlement);
      }
      return false;
    }

    function findPartners(org) {
      if (org.managedBy && org.managedBy.length > 0) {
        org.partners = [];
        _.each(org.managedBy, function (parnterOrg) {
          HelpdeskService.getOrg(parnterOrg.orgId).then(function (res) {
            org.partners.push(res);
          }, function (err) {});
        });
      }
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskOrgController', HelpdeskOrgController);
}());
