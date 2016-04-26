(function () {
  'use strict';

  angular.module('Mediafusion')
    .service('MediaServiceDescriptor', MediaServiceDescriptor);

  /* @ngInject */
  function MediaServiceDescriptor($http, config, Authinfo) {

    var setServiceEnabled = function (serviceId, enabled) {
      return $http
        .patch(config.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/services/' + serviceId, {
          enabled: enabled
        });

    };

    var isServiceEnabled = function (serviceId, callback) {
      $http
        .get(config.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/services')
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

    var getUserIdentityOrgToMediaAgentOrgMapping = function () {
      var url = config.getCalliopeUrl() + '/identity2agent/' + Authinfo.getOrgId();
      return $http.get(url);
    };

    var setUserIdentityOrgToMediaAgentOrgMapping = function (mediaAgentOrgIdsArray) {
      var url = config.getCalliopeUrl() + '/identity2agent';
      return $http
        .put(url, {
          identityOrgId: Authinfo.getOrgId(),
          mediaAgentOrgIds: mediaAgentOrgIdsArray
        });
    };

    return {
      isServiceEnabled: isServiceEnabled,
      setServiceEnabled: setServiceEnabled,
      getUserIdentityOrgToMediaAgentOrgMapping: getUserIdentityOrgToMediaAgentOrgMapping,
      setUserIdentityOrgToMediaAgentOrgMapping: setUserIdentityOrgToMediaAgentOrgMapping
    };
  }
})();
