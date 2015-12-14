(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskHelpController(HelpdeskService, $modal) {
    $('body').css('background', 'white');
    var vm = this;
    vm.showSearchHelp = showSearchHelp;

    function showSearchHelp() {
      var searchHelpUrl = "modules/squared/helpdesk/helpdesk-search-help-dialog.html";
      var searchHelpMobileUrl = "modules/squared/helpdesk/helpdesk-search-help-dialog-mobile.html";
      $modal.open({
        templateUrl: HelpdeskService.checkIfMobile() ? searchHelpMobileUrl : searchHelpUrl
      });
    }

  }

  angular
    .module('Squared')
    .controller('HelpdeskHelpController', HelpdeskHelpController);
}());
