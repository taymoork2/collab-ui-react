(function () {
  'use strict';

  angular.module('HDS')
    .service('HDSServiceActivation', HDSServiceActivation);

  /* @ngInject */
  function HDSServiceActivation($http, Authinfo, $q, FusionClusterService, Notification, UrlConfig) {
    var vm = this;
    vm.hdsServiceId = 'spark-hybrid-datasecurity';
    var baseHerculesUrl = UrlConfig.getHerculesUrl();
    var setServiceEnabled = function (serviceId, enabled) {
      return $http
        .patch(baseHerculesUrl.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/services/' + serviceId, {
          enabled: enabled
        });

    };

    var setServiceAcknowledged = function (serviceId, acknowledged) {
      return $http
        .patch(baseHerculesUrl + '/organizations/' + Authinfo.getOrgId() + '/services/' + serviceId, {
          acknowledged: acknowledged
        });

    };

    var isServiceEnabled = function (serviceId, callback) {
      $http
        .get(baseHerculesUrl + '/organizations/' + Authinfo.getOrgId() + '/services')
        .success(function (data) {
          var service = _.find(data.items, {
            id: serviceId
          });
          if (service === undefined) {
            callback(false);
          } else {
            callback(null, service.enabled);
          }
        })
        .error(function () {
          callback(arguments);
        });
    };


    var getServiceState = function () {
      var isService = $q.defer();
      if (!_.isUndefined(vm.isServiceEnabled)) {
        isService.resolve(vm.isServiceEnabled);
      } else {
        FusionClusterService.serviceIsSetUp(vm.hdsServiceId).then(function (enabled) {
          if (enabled) {
            vm.isServiceEnabled = enabled;
          }
          isService.resolve(vm.isServiceEnabled);
        });
      }
      return isService.promise;
    };

    var setisServiceEnabled = function (value) {
      vm.isServiceEnabled = value;
    };

    function enableHdsService(serviceId) {
      setServiceEnabled(serviceId, true).then(
        function success() {
        },
        function error() {
          Notification.error('hds.hdsServiceActivationFailure');
        });
    }

    return {
      setisServiceEnabled: setisServiceEnabled,
      getServiceState: getServiceState,
      isServiceEnabled: isServiceEnabled,
      setServiceEnabled: setServiceEnabled,
      setServiceAcknowledged: setServiceAcknowledged,
      enableHdsService: enableHdsService
    };

  }
})();
