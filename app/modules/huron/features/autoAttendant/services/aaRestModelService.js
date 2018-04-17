// TODO: convert this file to TypeScript

(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AARestModelService', AARestModelService);

  /* @ngInject */
  function AARestModelService() {
    var restBlocks = {};
    var uiRestBlocks = {};
    var restBlockCounter = 0;

    var service = {
      getRestBlocks: getRestBlocks,
      setRestBlocks: setRestBlocks,
      getUiRestBlocks: getUiRestBlocks,
      setUiRestBlocks: setUiRestBlocks,
      getRestTempId: getRestTempId,
      REST_TEMP_ID_PREFIX: 'TEMP_',
    };

    return service;

    /////////////////////
    function getRestBlocks() {
      return restBlocks;
    }

    function setRestBlocks(argRestBlocks) {
      restBlocks = argRestBlocks;
    }

    function getUiRestBlocks() {
      return uiRestBlocks;
    }

    function setUiRestBlocks(argUiRestBlocks) {
      uiRestBlocks = argUiRestBlocks;
    }

    function getRestTempId() {
      restBlockCounter += 1;
      return this.REST_TEMP_ID_PREFIX + restBlockCounter;
    }
  }
})();
