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
      clearDidList: clearDidList,
    };

    return service;
    /////////////////////

    function addDid(did) {
      didList.push(did);
    }

    function removeDid(did) {
      var index = _.indexOf(didList, did);
      if (index > -1) {
        didList.splice(index, 1);
      }
    }

    function getDidList() {
      return didList;
    }

    function clearDidList() {
      didList = [];
    }
  }

})();
