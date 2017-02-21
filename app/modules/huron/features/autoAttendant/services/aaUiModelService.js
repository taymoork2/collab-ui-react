(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAUiModelService', AAUiModelService);

  function AAUiModelService() {

    var model = {};

    var service = {
      getUiModel: getUiModel,
      initUiModel: initUiModel,
    };

    return service;

    /////////////////////

    function getUiModel() {
      return model;
    }

    function initUiModel() {
      model = {};
    }
  }
})();
