(function () {
  'use strict';

  //Defining a MeetingListService.
  function MediaFusionAnalyticsService($http, $rootScope, UrlConfig, Authinfo, Log, Utils, Auth) {

    //Fetching the Base url form config.js file.
    var vm = this;
    vm.baseUrl = UrlConfig.getAthenaServiceUrl();

    var getCallReject = function (clusterId, startTime, endTime, callback) {

      vm.url = vm.baseUrl + "/organizations/" + Authinfo.getOrgId() + "/cluster/" + clusterId + "/call_reject" + '?' + 'startTime=' + startTime + '&' + 'endTime=' + endTime;

      $http.get(vm.url)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          data.status = status;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
          var description = null;
          var errors = data.Errors;
          if (errors) {
            description = errors[0].description;
          }
        });
    };

    var getRelativeTimeCallReject = function (clusterId, relativeTime, callback) {

      vm.url = vm.baseUrl + "/organizations/" + Authinfo.getOrgId() + "/cluster/" + clusterId + "/call_reject" + '?' + 'relativeTime=' + relativeTime;

      $http.get(vm.url)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          data.status = status;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
          var description = null;
          var errors = data.Errors;
          if (errors) {
            description = errors[0].description;
          }
        });
    };

    var getActiveMediaCount = function (clusterId, startTime, endTime, callback) {

      vm.url = vm.baseUrl + "/organizations/" + Authinfo.getOrgId() + "/cluster/" + clusterId + "/media_count" + '?' + 'startTime=' + startTime + '&' + 'endTime=' + endTime;

      $http.get(vm.url)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          data.status = status;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
          var description = null;
          var errors = data.Errors;
          if (errors) {
            description = errors[0].description;
          }
        });
    };

    var getRelativeTimeActiveMediaCount = function (clusterId, relativeTime, callback) {

      vm.url = vm.baseUrl + "/organizations/" + Authinfo.getOrgId() + "/cluster/" + clusterId + "/media_count" + '?' + 'relativeTime=' + relativeTime;

      $http.get(vm.url)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          data.status = status;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
          var description = null;
          var errors = data.Errors;
          if (errors) {
            description = errors[0].description;
          }
        });
    };

    var getClusterAvailability = function (clusterId, startTime, endTime, callback) {

      vm.url = vm.baseUrl + "/organizations/" + Authinfo.getOrgId() + "/cluster/" + clusterId + "/availability" + '?' + 'startTime=' + startTime + '&' + 'endTime=' + endTime;

      $http.get(vm.url)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          data.status = status;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
          var description = null;
          var errors = data.Errors;
          if (errors) {
            description = errors[0].description;
          }
        });
    };

    var getRelativeTimeClusterAvailability = function (clusterId, relativeTime, callback) {

      vm.url = vm.baseUrl + "/organizations/" + Authinfo.getOrgId() + "/cluster/" + clusterId + "/availability" + '?' + 'relativeTime=' + relativeTime;

      $http.get(vm.url)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          data.status = status;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
          var description = null;
          var errors = data.Errors;
          if (errors) {
            description = errors[0].description;
          }
        });
    };

    var getNotificationForDashboard = function (callback) {

      vm.url = vm.baseUrl + '/organizations/' + Authinfo.getOrgId() + '/threshold_notification/2d';

      $http.get(vm.url)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          data.status = status;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
          var description = null;
          var errors = data.Errors;
          if (errors) {
            description = errors[0].description;
          }
        });
    };

    var getClusters = function (callback) {

      vm.url = vm.baseUrl + '/organizations/' + Authinfo.getOrgId() + '/clusters';

      $http.get(vm.url)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          data.status = status;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
          var description = null;
          var errors = data.Errors;
          if (errors) {
            description = errors[0].description;
          }
        });
    };

    var getHosts = function (clusterId, callback) {

      vm.url = vm.baseUrl + '/organizations/' + Authinfo.getOrgId() + '/cluster/' + clusterId + '/hosts';
      //console.log("service" + clusterId);

      $http.get(vm.url)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          data.status = status;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
          var description = null;
          var errors = data.Errors;
          if (errors) {
            description = errors[0].description;
          }
        });
    };

    var getRelativeTimeClusterAvailabilityForHost = function (clusterId, hostName, relativeTime, callback) {

      vm.url = vm.baseUrl + '/organizations/' + Authinfo.getOrgId() + '/cluster/' + clusterId + '/host/' + hostName + '/availability' + '?' + 'relativeTime=' + relativeTime;
      //console.log("service" + clusterId);

      $http.get(vm.url)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          data.status = status;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
          var description = null;
          var errors = data.Errors;
          if (errors) {
            description = errors[0].description;
          }
        });
    };

    var getRelativeTimeActiveMediaCountForHost = function (clusterId, hostName, relativeTime, callback) {

      vm.url = vm.baseUrl + '/organizations/' + Authinfo.getOrgId() + '/cluster/' + clusterId + '/host/' + hostName + '/media_count' + '?' + 'relativeTime=' + relativeTime;
      //console.log("service" + clusterId);

      $http.get(vm.url)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          data.status = status;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
          var description = null;
          var errors = data.Errors;
          if (errors) {
            description = errors[0].description;
          }
        });
    };

    var getRelativeTimeCallRejectForHost = function (clusterId, hostName, relativeTime, callback) {

      vm.url = vm.baseUrl + '/organizations/' + Authinfo.getOrgId() + '/cluster/' + clusterId + '/host/' + hostName + '/call_reject' + '?' + 'relativeTime=' + relativeTime;
      //console.log("service" + clusterId);

      $http.get(vm.url)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          data.status = status;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
          var description = null;
          var errors = data.Errors;
          if (errors) {
            description = errors[0].description;
          }
        });
    };

    var getClusterAvailabilityForHost = function (clusterId, hostName, startTime, endTime, callback) {

      vm.url = vm.baseUrl + "/organizations/" + Authinfo.getOrgId() + "/cluster/" + clusterId + "/host/" + hostName + "/availability" + '?' + 'startTime=' + startTime + '&' + 'endTime=' + endTime;

      $http.get(vm.url)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          data.status = status;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
          var description = null;
          var errors = data.Errors;
          if (errors) {
            description = errors[0].description;
          }
        });
    };

    var getActiveMediaCountForHost = function (clusterId, hostName, startTime, endTime, callback) {

      vm.url = vm.baseUrl + "/organizations/" + Authinfo.getOrgId() + "/cluster/" + clusterId + "/host/" + hostName + "/media_count" + '?' + 'startTime=' + startTime + '&' + 'endTime=' + endTime;

      $http.get(vm.url)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          data.status = status;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
          var description = null;
          var errors = data.Errors;
          if (errors) {
            description = errors[0].description;
          }
        });
    };

    var getCallRejectForHost = function (clusterId, hostName, startTime, endTime, callback) {

      vm.url = vm.baseUrl + "/organizations/" + Authinfo.getOrgId() + "/cluster/" + clusterId + "/host/" + hostName + "/call_reject" + '?' + 'startTime=' + startTime + '&' + 'endTime=' + endTime;

      $http.get(vm.url)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          data.status = status;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
          var description = null;
          var errors = data.Errors;
          if (errors) {
            description = errors[0].description;
          }
        });
    };

    return {

      getCallReject: getCallReject,
      getRelativeTimeCallReject: getRelativeTimeCallReject,
      getActiveMediaCount: getActiveMediaCount,
      getRelativeTimeActiveMediaCount: getRelativeTimeActiveMediaCount,
      getClusterAvailability: getClusterAvailability,
      getRelativeTimeClusterAvailability: getRelativeTimeClusterAvailability,
      getNotificationForDashboard: getNotificationForDashboard,
      getClusters: getClusters,
      getHosts: getHosts,
      getRelativeTimeClusterAvailabilityForHost: getRelativeTimeClusterAvailabilityForHost,
      getRelativeTimeActiveMediaCountForHost: getRelativeTimeActiveMediaCountForHost,
      getRelativeTimeCallRejectForHost: getRelativeTimeCallRejectForHost,
      getClusterAvailabilityForHost: getClusterAvailabilityForHost,
      getActiveMediaCountForHost: getActiveMediaCountForHost,
      getCallRejectForHost: getCallRejectForHost

    };

  }
  angular
    .module('Mediafusion')
    .service('MediaFusionAnalyticsService', MediaFusionAnalyticsService);

}());
