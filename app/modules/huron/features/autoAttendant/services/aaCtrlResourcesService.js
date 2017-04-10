(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AACtrlResourcesService', AACtrlResourcesService);

  /* @ngInject */
  function AACtrlResourcesService() {
    var service = {
      getCtrlToResourceMap: getCtrlToResourceMap,
      getCtrlKeys: getCtrlKeys,
    };
    var resources = {};
    //generic resource manager for various controller resources using the common service mapping
    //essentially the service maintains a resource map correlated to the unique controller, and as various actions occur from the client,
    //the calling service tracks the state and manages the deletion of resources, while the controller manages the view and actionEntry state
    //see mediaUploadService for an example of how this works
    return service;

    function getCtrlToResourceMap() {
      return resources;
    }

    function getCtrlKeys() {
      return _.keys(getCtrlToResourceMap());
    }
  }

})();
