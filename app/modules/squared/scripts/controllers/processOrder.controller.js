(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('ProcessorderCtrl', ProcessorderCtrl);

  /* @ngInject */
  function ProcessorderCtrl($location, $translate, Auth, Orgservice, ModalService) {
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
        ModalService.open({
          title: $translate.instant('processOrderPage.info'),
          message: $translate.instant('processOrderPage.errOrgCreation'),
          dismiss: false,
        });
      });
  }
})();
