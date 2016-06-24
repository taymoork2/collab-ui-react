(function () {
  'use strict';
  var kem = 1;

  /* @ngInject */
  //function CmiKemService($resource, HuronConfig, Authinfo) {
  function CmiKemService($q) {

    return {
      getKEM: getKEM,
      createKEM: createKEM,
      deleteKEM: deleteKEM
    };

    /////////////////////

    function getKEM(userId, deviceId) {
      //TODO:Update parameters
      //return $resource(HuronConfig.getCmiUrl() + '/customers/:customerId/users/:userId/devices/:deviceId/addonmodules', {
      //  customerId: '@customerId',
      //  userId: '@userId',
      //  deviceId: '@deviceId'
      //}).get({
      //  customerId: Authinfo.getOrgId(),
      //  userId: userId,
      //  deviceId: deviceId
      //}).$promise;
      var data = {
        addonModule: [],
        uri: '/customers/:customerId/users/:userId/devices/:deviceId/addonmodules',
        version: '1'
      };
      _.times(kem, function (n) {
        data.addonModule.push({
          id: n,
          moniker: 'BEKEM',
          index: n + 1
        });
      });
      var deferred = $q.defer();
      deferred.resolve(data);
      return deferred.promise;
    }

    function createKEM(userId, deviceId, index) {
      //TODO:Update parameters
      //var data = {
      //  index: index,
      //  moniker: 'BEKEM'
      //};
      //return $resource(HuronConfig.getCmiUrl() + '/customers/:customerId/users/:userId/devices/:deviceId/addonmodule', {
      //  customerId: '@customerId',
      //  userId: '@userId',
      //  deviceId: '@deviceId'
      //}).save({
      //    userId: userId,
      //    deviceId: deviceId,
      //    customerId: Authinfo.getOrgId()
      //  },
      //  data
      //).$promise;
      kem++;
      var deferred = $q.defer();
      deferred.resolve();
      return deferred.promise;
    }

    function deleteKEM(userId, deviceId, kemId) {
      //TODO:Update parameters
      //return $resource(HuronConfig.getCmiUrl() + '/customers/:customerId/users/:userId/devices/:deviceId/addonmodule/:addonmoduleId', {
      //  customerId: '@customerId',
      //  userId: '@userId',
      //  deviceId: '@deviceId',
      //  addonmoduleId: '@addonmoduleId'
      //}).delete({
      //  customerId: Authinfo.getOrgId(),
      //  userId: userId,
      //  deviceId: deviceId,
      //  addonmoduleId: kemId
      //}).$promise;
      kem--;
      var deferred = $q.defer();
      deferred.resolve();
      return deferred.promise;
    }
  }

  angular
    .module('Squared')
    .factory('CmiKemService', CmiKemService);
})();
