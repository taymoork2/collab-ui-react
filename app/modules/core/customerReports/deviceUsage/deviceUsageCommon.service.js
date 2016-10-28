(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageCommonService', DeviceUsageCommonService);

  /* @ngInject */
  function DeviceUsageCommonService() {
    var timeSelected = 0;

    function setTimeSelected(ts) {
      timeSelected = ts;
    }

    function getTimeSelected() {
      return timeSelected;
    }

    return {
      getTimeSelected: getTimeSelected,
      setTimeSelected: setTimeSelected
    };
  }
}());
