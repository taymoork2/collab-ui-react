(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnSetupCtrl', PstnSetupCtrl);

  /* @ngInject */
  function PstnSetupCtrl($state, $stateParams, PstnModel, PstnService, Notification) {
    //Save state params
    PstnModel.setCustomerId($stateParams.customerId);
    PstnModel.setCustomerExists(false);
    PstnModel.setCustomerName($stateParams.customerName);
    PstnModel.setCustomerEmail($stateParams.customerEmail);
    PstnModel.setIsTrial($stateParams.customerCommunicationLicenseIsTrial && $stateParams.customerRoomSystemsLicenseIsTrial);

    //Reset Carriers
    PstnModel.setCarriers([]);

    //Verify the the Terminus Reseller is setup, otherwise setup the Reseller
    if (!PstnModel.isResellerExists()) {
      PstnService.getResellerV2().then(function () {
        PstnModel.setResellerExists(true);
      }).catch(function () {
        PstnService.createResellerV2().then(function () {
          PstnModel.setResellerExists(true);
        }).catch(function (response) {
          Notification.errorResponse(response, 'pstnSetup.resellerCreateError');
        });
      });
    }

    if ($state.modal && $state.modal.result) {
      $state.modal.result.finally(PstnModel.clear);
    }
  }
})();
