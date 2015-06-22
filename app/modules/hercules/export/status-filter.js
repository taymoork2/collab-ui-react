'use strict';

angular.module('Hercules').service('StatusFilter',

  /* @ngInject  */
  function (Log) {

    var convertToUiState = function (serviceStateInfo) {
      return serviceStateInfo.entitled ? serviceStateInfo.state : "notEntitled";
    };

    return {
      convertToUiState: convertToUiState
    };

  }
);
