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
      didList.push(did);
    }

    function removeDid(did) {
      didList.splice(didList.indexOf(String(did)), 1);
    }

    function getDidList() {
      return didList;
    }

    function clearDidList() {
      didList = [];
    }
  }

})();
