(function() {
  'use strict';

  /* @ngInject */
  function MediaServiceSettingsController($state, $modal, MediaServiceActivation, Authinfo, $stateParams, NotificationConfigService, $log, MailValidatorService, XhrNotificationService, Notification) {
    var vm = this;
    vm.config = "";
    vm.wx2users = "";
    vm.serviceType = "mf_mgmt";
    vm.serviceId = "squared-fusion-media";
    vm.cluster = $stateParams.cluster;
    vm.currentServiceId = "squared-fusion-media";

    vm.disableMediaService = function(serviceId) {
      MediaServiceActivation.setServiceEnabled(vm.currentServiceId, false).then(
        function success() {
          $state.go("media-service.list", {
            serviceType: "mf_mgmt"
          }, {
            reload: true
          });
        },
        function error(data, status) {
          XhrNotificationService.notify(error);
        });
    };

    vm.confirmDisable = function(serviceId) {
      $modal.open({
        // TODO: update correct disable-dialog html
        templateUrl: "modules/mediafusion/media-service/settings/confirm-disable-dialog.html",
        controller: DisableConfirmController,
        controllerAs: "disableConfirmDialog",
      }).result.then(function() {
        vm.disableMediaService(serviceId);
      });
    };

    NotificationConfigService.read(function(err, config) {
      vm.loading = false;
      if (err) {
        return XhrNotificationService.notify(err);
      }
      vm.config = config || {};
      if (vm.config.wx2users.length > 0) {
        vm.wx2users = _.map(vm.config.wx2users.split(','), function(user) {
          return {
            text: user
          };
        });
      } else {
        vm.wx2users = [];
      }
    });

    vm.writeConfig = function() {
      $log.log("inside");
      vm.config.wx2users = _.map(vm.wx2users, function(data) {
        return data.text;
      }).toString();
      $log.log("value of wx2users", vm.config.wx2users);
      if (vm.config.wx2users && !MailValidatorService.isValidEmailCsv(vm.config.wx2users)) {
        Notification.error("hercules.errors.invalidEmail");
      } else {
        vm.savingEmail = true;
        NotificationConfigService.write(vm.config, function(err) {
          vm.savingEmail = false;
          if (err) {
            return XhrNotificationService.notify(err);
          }
        });
      }
    };

    vm.invalidEmail = function(tag) {
      Notification.error(tag.text + " is not a valid email");
    };
  }

  /* @ngInject */
  function DisableConfirmController(MediaServiceActivation, $modalInstance) {
    var modalVm = this;
    //TODO:check this
    // modalVm.serviceIconClass = MediaServiceDescriptor.serviceIcon();

    modalVm.ok = function() {
      $modalInstance.close();
    };
    modalVm.cancel = function() {
      $modalInstance.dismiss();
    };
  }

  angular
    .module('Mediafusion')
    .controller('MediaServiceSettingsController', MediaServiceSettingsController);
}());