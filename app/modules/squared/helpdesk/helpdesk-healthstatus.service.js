(function () {
  'use strict';

  /*ngInject*/
  function HelpdeskHealthStatusService($q, ReportsService) {

    var healthComponentMapping = {
      message: ['Spark message'],
      meeting: ['Spark message'],
      call: ['Spark call'],
      room: ['Rooms'],
      hybrid: ['Spark Hybrid Services']
    };

    function getHealthStatuses() {
      var deferred = $q.defer();
      ReportsService.healthMonitor(function (data, status) {
        if (data.success) {
          deferred.resolve(getRelevantHealthStatuses(data.components));
        } else {
          deferred.reject(status);
        }
      });
      return deferred.promise;
    }

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

      var status = error || warning || partialOutage || operational || 'unknown';
      return status;
    }

    function getRelevantHealthStatuses(components) {
      var result = {
        message: [],
        meeting: [],
        call: [],
        room: [],
        hybrid: []
      };
      for (var i = 0; i < components.length; i++) {
        if (_.includes(healthComponentMapping.message, components[i].name)) {
          result.message.push(components[i].status);
        }
        if (_.includes(healthComponentMapping.meeting, components[i].name)) {
          result.meeting.push(components[i].status);
        }
        if (_.includes(healthComponentMapping.call, components[i].name)) {
          result.call.push(components[i].status);
        }
        if (_.includes(healthComponentMapping.room, components[i].name)) {
          result.room.push(components[i].status);
        }
        if (_.includes(healthComponentMapping.hybrid, components[i].name)) {
          result.hybrid.push(components[i].status);
        }
      }
      var healthStatuses = {};
      healthStatuses.message = deduceHealthStatus(result.message);
      healthStatuses.meeting = deduceHealthStatus(result.meeting);
      healthStatuses.call = deduceHealthStatus(result.call);
      healthStatuses.room = deduceHealthStatus(result.room);
      healthStatuses.hybrid = deduceHealthStatus(result.hybrid);
      return healthStatuses;
    }

    return {
      getHealthStatuses: getHealthStatuses
    };
  }

  angular.module('Squared')
    .service('HelpdeskHealthStatusService', HelpdeskHealthStatusService);
}());
