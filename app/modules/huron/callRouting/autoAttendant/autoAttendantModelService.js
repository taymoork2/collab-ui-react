(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAModelService', AAModelService);

  function AAModelService() {

    var aaModel = {};

    var service = {
      getAAModel: getAAModel,
      setAAModel: setAAModel
    };

    return service;

    /////////////////////

    function getAAModel() {
      return aaModel;
    }

    function setAAModel(aaMdl) {
      aaModel = aaMdl;
    }

  }
})();
