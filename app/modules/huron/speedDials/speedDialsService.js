(function () {
  'use strict';

  /* @ngInject */
  function SpeedDialsService($resource, HuronConfig, Authinfo) {

    return {
      getSpeedDials: getSpeedDials,
      updateSpeedDials: updateSpeedDials
    };

    /////////////////////

    function getSpeedDials(userId) {
      return $resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/users/:userId/speeddials', {
        customerId: '@customerId',
        userId: '@userId'
      }).get({
        customerId: Authinfo.getOrgId(),
        userId: userId
      }).$promise;
    }

    function updateSpeedDials(userId, speedDials) {
      var data = {};
      data.speedDials = [];
      _.each(speedDials, function (sd) {
        data.speedDials.push({
          'index': sd.index,
          'number': sd.number,
          'label': sd.label
        });
      });
      return $resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/users/:userId/bulk/speeddials', {
        customerId: '@customerId',
        userId: '@userId'
      }, {
        'update': {
          method: 'PUT'
        }
      }).update({
        customerId: Authinfo.getOrgId(),
        userId: userId
      },
        data
      ).$promise;
    }
  }

  angular
    .module('Squared')
    .factory('SpeedDialsService', SpeedDialsService);
})();
