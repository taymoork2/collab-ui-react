(function () {
  'use strict';

  /* @ngInject */
  function MediaServiceSettingsController($state, $modal, MediaServiceDescriptor, Authinfo, $stateParams, NotificationConfigService, $log, MailValidatorService, XhrNotificationService, Notification) {
    var vm = this;
    vm.config = "";
    vm.wx2users = "";
    vm.serviceType = "mf_mgmt";
    vm.serviceId = "squared-fusion-media";
    vm.cluster = $stateParams.cluster;

    vm.disableMediaService = function (serviceId) {
      MediaServiceDescriptor.setServiceEnabled(serviceId, false).then(
        function success() {
          $state.go("mediafusion.list", {
            serviceType: "mf_mgmt"
          }, {
            reload: true
          });
        },
        function error(data, status) {
          XhrNotificationService.notify(error);
        });
    };

    vm.confirmDisable = function (serviceId) {
      $log.log("inside");
      $modal.open({
        // TODO: update correct disable-dialog html
        templateUrl: "modules/mediafusion/media-service/settings/confirm-disable-dialog.html",
        controller: DisableConfirmController,
        controllerAs: "disableConfirmDialog",
      }).result.then(function () {
        vm.disableMediaService(serviceId);
      });
    };

    NotificationConfigService.read(function (err, config) {
      vm.loading = false;
      if (err) {
        return XhrNotificationService.notify(err);
      }
      vm.config = config || {};
      if (vm.config.wx2users.length > 0) {
        vm.wx2users = _.map(vm.config.wx2users.split(','), function (user) {
          return {
            text: user
          };
        });
      } else {
        vm.wx2users = [];
      }
    });

    vm.writeConfig = function () {
      vm.config.wx2users = _.map(vm.wx2users, function (data) {
        return data.text;
      }).toString();
      if (vm.config.wx2users && !MailValidatorService.isValidEmailCsv(vm.config.wx2users)) {
        Notification.error("hercules.errors.invalidEmail");
      } else {
        vm.savingEmail = true;
        NotificationConfigService.write(vm.config, function (err) {
          vm.savingEmail = false;
          if (err) {
            return XhrNotificationService.notify(err);
          }
        });
      }
    };

    vm.invalidEmail = function (tag) {
      Notification.error(tag.text + " is not a valid email");
    };
  }

  /* @ngInject */
  function DisableConfirmController(MediaServiceDescriptor, $modalInstance) {
    var modalVm = this;
   //TODO:check this
    // modalVm.serviceIconClass = MediaServiceDescriptor.serviceIcon();

    modalVm.ok = function () {
      $modalInstance.close();
    };
    modalVm.cancel = function () {
      $modalInstance.dismiss();
    };
  }

  angular
    .module('Mediafusion')
    .controller('MediaServiceSettingsController', MediaServiceSettingsController);
}());
