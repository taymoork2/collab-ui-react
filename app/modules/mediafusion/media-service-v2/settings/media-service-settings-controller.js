(function () {
  'use strict';

  /* @ngInject */
  function MediaServiceSettingsControllerV2($state, $modal, MediaServiceActivationV2, Authinfo, $stateParams, ServiceDescriptor, MailValidatorService, XhrNotificationService, Notification) {
    var vm = this;
    vm.config = "";
    vm.wx2users = "";
    vm.serviceType = "mf_mgmt";
    vm.serviceId = "squared-fusion-media";
    vm.cluster = $stateParams.cluster;

    vm.disableMediaService = function () {
      MediaServiceActivationV2.setServiceEnabled(vm.serviceId, false).then(
        function success() {
          MediaServiceActivationV2.setisMediaServiceEnabled(false);
          MediaServiceActivationV2.setServiceAcknowledged(vm.serviceId, false);
          vm.disableOrpheusForMediaFusion();
          $state.go('services-overview');
        },
        function error() {
          XhrNotificationService.notify(error);
        });
    };

    vm.confirmDisable = function (serviceId) {
      $modal.open({
        templateUrl: "modules/mediafusion/media-service-v2/settings/confirm-disable-dialog.html",
        controller: DisableConfirmController,
        controllerAs: "disableConfirmDialog",
        type: 'small'
      }).result.then(function () {
        vm.disableMediaService(serviceId);
      });
    };

    vm.disableOrpheusForMediaFusion = function () {
      MediaServiceActivationV2.getUserIdentityOrgToMediaAgentOrgMapping().then(
        function success(response) {
          var mediaAgentOrgIdsArray = [];
          var orgId = Authinfo.getOrgId();
          mediaAgentOrgIdsArray = response.data.mediaAgentOrgIds;

          var index = mediaAgentOrgIdsArray.indexOf(orgId);
          mediaAgentOrgIdsArray.splice(index, 1);

          index = mediaAgentOrgIdsArray.indexOf("squared");
          mediaAgentOrgIdsArray.splice(index, 1);

          if (mediaAgentOrgIdsArray.length > 0) {
            MediaServiceActivationV2.setUserIdentityOrgToMediaAgentOrgMapping(mediaAgentOrgIdsArray).then(
              function success() {},
              function error(errorResponse) {
                Notification.error('mediaFusion.mediaAgentOrgMappingFailure', {
                  failureMessage: errorResponse.message
                });
              });
          } else {
            MediaServiceActivationV2.deleteUserIdentityOrgToMediaAgentOrgMapping(mediaAgentOrgIdsArray).then(
              function success() {},
              function error(errorResponse) {
                Notification.error('mediaFusion.mediaAgentOrgMappingFailure', {
                  failureMessage: errorResponse.message
                });
              });
          }
        });
    };

    vm.config = "";
    ServiceDescriptor.getEmailSubscribers(vm.serviceId, function (error, emailSubscribers) {
      if (!error) {
        vm.emailSubscribers = _.map(_.without(emailSubscribers.split(','), ''), function (user) {
          return {
            text: user
          };
        });
      } else {
        vm.emailSubscribers = [];
      }
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
        ServiceDescriptor.setEmailSubscribers(vm.serviceId, emailSubscribers, function (statusCode) {
          if (statusCode === 204) {
            Notification.success('mediaFusion.email.emailNotificationsSavingSuccess');
          } else {
            Notification.error('mediaFusion.email.emailNotificationsSavingError');
          }
          vm.savingEmail = false;
        });
      }
    };
  }

  /* @ngInject */
  function DisableConfirmController(MediaServiceActivationV2, $modalInstance) {
    var modalVm = this;
    modalVm.ok = function () {
      $modalInstance.close();
    };
    modalVm.cancel = function () {
      $modalInstance.dismiss();
    };
  }

  angular
    .module('Mediafusion')
    .controller('MediaServiceSettingsControllerV2', MediaServiceSettingsControllerV2);
}());
