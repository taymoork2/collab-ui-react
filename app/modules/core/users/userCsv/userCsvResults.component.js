(function () {
  'use strict';

  angular.module('Core')
    .component('crUserCsvResults', {
      controller: UserCsvResultsController,
      templateUrl: 'modules/core/users/userCsv/userCsvResults.tpl.html',
      bindings: {
        onCancelImport: '&',
        csvData: '<'
      }
    });

  ////////////////////
  /* @ngInject */
  function UserCsvResultsController() {
    var vm = this;

    vm.$onInit = onInit;

    //////////////

    function onInit() {
    }

  }

})();
