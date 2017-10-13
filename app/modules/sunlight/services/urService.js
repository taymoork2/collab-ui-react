/**
 * Created by sundravi on 18/08/15.
 */

(function () {
  'use strict';

  /* @ngInject */
  function urService($http, UrlConfig, Authinfo) {
    var sunlightURQueueURUrl = UrlConfig.getSunlightURServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/queue';
    var service = {
      createQueue: createQueue,
      getQueue: getQueue,
      getQueuesList: getQueuesList,
      updateQueue: updateQueue,
      deleteQueue: deleteQueue,
    };

    return service;

    function createQueue(createQueueRequest) {
      return $http.post(sunlightURQueueURUrl, createQueueRequest);
    }

    function getQueue(queueId) {
      return $http.get(sunlightURQueueURUrl + '/' + queueId);
    }

    function getQueuesList() {
      return $http.get(sunlightURQueueURUrl);
    }

    function updateQueue(queueId, updateQueueRequest) {
      return $http.put(sunlightURQueueURUrl + '/' + queueId, updateQueueRequest);
    }

    function deleteQueue(queueId) {
      return $http.delete(sunlightURQueueURUrl + '/' + queueId);
    }
  }

  module.exports = urService;
})();
