(function () {
  'use strict';

  /* @ngInject  */
  function CsdmUpgradeChannelService($http, Authinfo, UrlConfig) {
    var channelsUrl = UrlConfig.getCsdmServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/upgradeChannels';

    var channelsPromise = $http.get(channelsUrl).then(function (res) {
      return res.data;
    });

    function getUpgradeChannelsPromise() {
      return channelsPromise;
    }

    function updateUpgradeChannel(deviceUrl, newUpgradeChannel) {
      return $http.post(deviceUrl + '/upgradeChannel', {
        channel: newUpgradeChannel,
      });
    }

    return {
      getUpgradeChannelsPromise: getUpgradeChannelsPromise,
      updateUpgradeChannel: updateUpgradeChannel,
    };
  }

  angular
    .module('Squared')
    .service('CsdmUpgradeChannelService', CsdmUpgradeChannelService);

})();
