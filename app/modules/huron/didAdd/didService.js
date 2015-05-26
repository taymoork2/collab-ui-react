(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('DidService', DidService);

  /* @ngInject */
  function DidService() {
    var didList = [];
    var service = {
      addDid: addDid,
      removeDid: removeDid,
      getDidList: getDidList,
      clearDidList: clearDidList
    };

    return service;
    /////////////////////

    function addDid(did) {
      if (didList.indexOf(did) === -1) {
        didList.push(did);
      }
    }

    function removeDid(did) {
      _.pull(didList, did);
    }

    function getDidList() {
      return didList;
    }

    function clearDidList() {
      didList = [];
    }
  }

})();
