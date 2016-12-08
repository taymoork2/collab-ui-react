(function () {
  'use strict';

  /* @ngInject */
  function MediaServiceSettingsControllerV2($modal, $stateParams, ServiceDescriptor, MailValidatorService, Notification) {
    var vm = this;
    vm.config = "";
    vm.wx2users = "";
    vm.serviceType = "mf_mgmt";
    vm.serviceId = "squared-fusion-media";
    vm.cluster = $stateParams.cluster;

    vm.confirmDisable = function () {
      $modal.open({
        templateUrl: "modules/mediafusion/media-service-v2/settings/confirm-disable-dialog.html",
        controller: 'DisableMediaServiceController',
        controllerAs: "disableServiceDialog",
        type: 'small'
      });
    };

    vm.config = "";
    ServiceDescriptor.getEmailSubscribers(vm.serviceId)
      .then(function (emailSubscribers) {
        vm.emailSubscribers = _.map(emailSubscribers, function (user) {
          return {
            text: user
          };
        });
      });

    vm.cluster = $stateParams.cluster;

    vm.writeConfig = function () {
      var emailSubscribers = _.map(vm.emailSubscribers, function (data) {
        return data.text;
      }).toString();
      if (emailSubscribers && !MailValidatorService.isValidEmailCsv(emailSubscribers)) {
        Notification.error('mediaFusion.email.invalidEmail');
      } else {
        vm.savingEmail = true;
        ServiceDescriptor.setEmailSubscribers(vm.serviceId, emailSubscribers)
          .then(function (response) {
            if (response.status === 204) {
              Notification.success('mediaFusion.email.emailNotificationsSavingSuccess');
            } else {
              Notification.error('mediaFusion.email.emailNotificationsSavingError');
            }
            vm.savingEmail = false;
          });
      }
    };
  }

  angular
    .module('Mediafusion')
    .controller('MediaServiceSettingsControllerV2', MediaServiceSettingsControllerV2);
}());
