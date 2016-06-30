(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('ProcessorderCtrl', ProcessorderCtrl);

  /* @ngInject */
  function ProcessorderCtrl($location, Auth, Orgservice) {
    var vm = this;
    var enc = $location.search().enc;

    vm.isProcessing = true;

    // 'createOrg()' provisions a limited-privilege access token in order to perform this operation,
    // so we currently use 'logoutAndRedirectTo()' to clear tokens before allowing redirection
    Orgservice.createOrg(enc)
      .then(function (data) {
        vm.isProcessing = false;
        Auth.logoutAndRedirectTo(data.redirectUrl);
      })
      .catch(function () {
        vm.isProcessing = false;
        $('#processOrderErrorModal').modal('show');
      });
  }
})();
