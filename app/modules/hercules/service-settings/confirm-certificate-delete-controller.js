(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ConfirmCertificateDeleteController', ConfirmCertificateDeleteController);


/* @ngInject */
  function ConfirmCertificateDeleteController(CertService, Notification, cert, $modalInstance) {
    var vm = this;
    vm.cert = cert;
    vm.remove = function () {
      CertService.deleteCert(vm.cert.certId)
        .then($modalInstance.close())
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.settings.call.certificatesCannotDelete');
        });
    };
  }
}());
