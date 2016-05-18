(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('QueueHelperService', QueueHelperService);

  /* @ngInject */
  function QueueHelperService($q, QueueService, Authinfo) {

    var service = {
      listQueues: listQueues,

    };
    return service;
    /////////////////////
    function listQueues() {
      return QueueService.query({
        customerId: Authinfo.getOrgId()
      }).$promise;
    }

  }
})();
