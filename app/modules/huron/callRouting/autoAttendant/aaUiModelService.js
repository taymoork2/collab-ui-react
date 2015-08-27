(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAUiModelService', AAUiModelService);

  function AAUiModelService() {

    var ceMenus = [];
    var ceInfo = {};

    var service = {
      getCeMenus: getCeMenus,
      setCeMenus: setCeMenus,
      getCeInfo: getCeInfo,
      setCeInfo: setCeInfo
    };

    return service;

    /////////////////////

    function getCeMenus(scheduleName) {
      return ceMenus[scheduleName];
    }

    function setCeMenus(scheduleName, model) {
      ceMenus[scheduleName] = model;
    }

    function getCeInfo() {
      return ceInfo;
    }

    function setCeInfo(model) {
      ceInfo = model;
    }

  }
})();
