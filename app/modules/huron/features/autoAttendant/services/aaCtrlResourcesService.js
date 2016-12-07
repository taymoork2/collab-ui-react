(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AACtrlResourcesService', AACtrlResourcesService);

  /* @ngInject */
  function AACtrlResourcesService() {
    var service = {
      getCtrlToResourceMap: getCtrlToResourceMap,
      getCtrlKeys: getCtrlKeys
    };
    var resources = {};

    return service;

    function getCtrlToResourceMap() {
      return resources;
    }

    function getCtrlKeys() {
      return _.keys(getCtrlToResourceMap);
    }
  }

})();
