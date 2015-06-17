'use strict';

angular.module('Hercules').service('UiStateConverter',

  /* @ngInject  */
  function () {

    var convertToUiState = function (serviceStateInfo) {
      return serviceStateInfo.entitled ? serviceStateInfo.state : "notEntitled";
    };

    return {
      convertToUiState: convertToUiState
    };

  }
);
