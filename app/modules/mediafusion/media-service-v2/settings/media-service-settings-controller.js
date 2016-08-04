(function () {
  'use strict';

  /* @ngInject */
  function MediaServiceSettingsControllerV2($state, $modal, MediaServiceActivationV2, Authinfo, $stateParams, ServiceDescriptor, MailValidatorService, XhrNotificationService, Notification, FeatureToggleService) {
    var vm = this;
    vm.config = "";
    vm.wx2users = "";
    vm.serviceType = "mf_mgmt";
    vm.serviceId = "squared-fusion-media";
    vm.cluster = $stateParams.cluster;
    vm.featureToggled = false;

    function isFeatureToggled() {
      return FeatureToggleService.supports(FeatureToggleService.features.atlasHybridServicesResourceList);
    }
    isFeatureToggled().then(function (reply) {
      vm.featureToggled = reply;
    });

    vm.disableMediaService = function () {
      MediaServiceActivationV2.setServiceEnabled(vm.serviceId, false).then(
        function success() {
          vm.disableOrpheusForMediaFusion();
          if (vm.featureToggled) {
            $state.go('services-overview');
          } else {
            $state.go("media-service.list", {
              serviceType: "mf_mgmt"
            }, {
              reload: true
            });
          }
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
        Notification.error("hercules.errors.invalidEmail");
      } else {
        vm.savingEmail = true;
        ServiceDescriptor.setEmailSubscribers(vm.serviceId, emailSubscribers, function (err) {
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
