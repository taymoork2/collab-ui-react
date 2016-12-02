require('./_user-csv.scss');

(function () {
  'use strict';

  angular.module('Core')
    .component('crUserCsvResults', {
      controller: UserCsvResultsController,
      templateUrl: 'modules/core/users/userCsv/userCsvResults.tpl.html',
      bindings: {
        onCancelImport: '&',
        csvData: '<',
        onDoneImport: '&'
      }
    });

  ////////////////////
  /* @ngInject */
  function UserCsvResultsController(Analytics) {
    var vm = this;

    vm.$onInit = onInit;
    vm.analyticsEventNames = {
      DOWNLOAD_ERRORS: Analytics.sections.ADD_USERS.eventNames.CSV_ERROR_EXPORT
    };

    //////////////

    function onInit() {
    }

  }

})();
