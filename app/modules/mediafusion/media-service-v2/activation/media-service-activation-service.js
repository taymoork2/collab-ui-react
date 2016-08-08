(function () {
  'use strict';

  angular.module('Mediafusion')
    .service('MediaServiceActivationV2', MediaServiceActivationV2);

  /* @ngInject */
  function MediaServiceActivationV2($http, MediaConfigServiceV2, Authinfo) {

    var setServiceEnabled = function (serviceId, enabled) {
      return $http
        .patch(MediaConfigServiceV2.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/services/' + serviceId, {
          enabled: enabled
        });

    };

    var setServiceAcknowledged = function (serviceId, acknowledged) {
      return $http
        .patch(MediaConfigServiceV2.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/services/' + serviceId, {
          acknowledged: acknowledged
        });

    };

    var isServiceEnabled = function (serviceId, callback) {
      $http
        .get(MediaConfigServiceV2.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/services')
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
      var url = MediaConfigServiceV2.getCalliopeUrl() + '/identity2agent/' + Authinfo.getOrgId();
      return $http.get(url);
    };

    var setUserIdentityOrgToMediaAgentOrgMapping = function (mediaAgentOrgIdsArray) {
      var url = MediaConfigServiceV2.getCalliopeUrl() + '/identity2agent';
      return $http
        .put(url, {
          identityOrgId: Authinfo.getOrgId(),
          mediaAgentOrgIds: mediaAgentOrgIdsArray
        });
    };

    var deleteUserIdentityOrgToMediaAgentOrgMapping = function () {
      var url = MediaConfigServiceV2.getCalliopeUrl() + '/identity2agent/' + Authinfo.getOrgId();
      return $http.delete(url);
    };

    return {
      isServiceEnabled: isServiceEnabled,
      setServiceEnabled: setServiceEnabled,
      setServiceAcknowledged: setServiceAcknowledged,
      getUserIdentityOrgToMediaAgentOrgMapping: getUserIdentityOrgToMediaAgentOrgMapping,
      setUserIdentityOrgToMediaAgentOrgMapping: setUserIdentityOrgToMediaAgentOrgMapping,
      deleteUserIdentityOrgToMediaAgentOrgMapping: deleteUserIdentityOrgToMediaAgentOrgMapping
    };
  }
})();
