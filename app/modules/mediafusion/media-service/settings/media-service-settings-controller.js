(function () {
  'use strict';

  /* @ngInject */
  function MediaServiceSettingsController($state, $modal, MediaServiceActivation, Authinfo, $stateParams, $translate, ServiceDescriptor, MailValidatorService, XhrNotificationService, Notification) {
    var vm = this;
    vm.config = "";
    vm.wx2users = "";
    vm.serviceType = "mf_mgmt";
    vm.serviceId = "squared-fusion-media";
    vm.cluster = $stateParams.cluster;

    vm.disableMediaService = function (serviceId) {
      MediaServiceActivation.setServiceEnabled(vm.serviceId, false).then(
        function success() {
          vm.disableOrpheusForMediaFusion();
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

    vm.confirmDisable = function (serviceId) {
      $modal.open({
        templateUrl: "modules/mediafusion/media-service/settings/confirm-disable-dialog.html",
        controller: DisableConfirmController,
        controllerAs: "disableConfirmDialog",
        type: 'small'
      }).result.then(function () {
        vm.disableMediaService(serviceId);
      });
    };

    vm.disableOrpheusForMediaFusion = function () {
      //$log.log("Entered disableOrpheusForMediaFusion");
      MediaServiceActivation.getUserIdentityOrgToMediaAgentOrgMapping().then(
        function success(response) {
          var mediaAgentOrgIdsArray = [];
          var orgId = Authinfo.getOrgId();
          var updateMediaAgentOrgId = false;
          mediaAgentOrgIdsArray = response.data.mediaAgentOrgIds;
          //$log.log("Media Agent Org Ids Array:", mediaAgentOrgIdsArray);

          var index = mediaAgentOrgIdsArray.indexOf(orgId);
          mediaAgentOrgIdsArray.splice(index, 1);

          index = mediaAgentOrgIdsArray.indexOf("squared");
          mediaAgentOrgIdsArray.splice(index, 1);

          if (mediaAgentOrgIdsArray.length > 0) {
            //$log.log("Updated Media Agent Org Ids Array:", mediaAgentOrgIdsArray);
            MediaServiceActivation.setUserIdentityOrgToMediaAgentOrgMapping(mediaAgentOrgIdsArray).then(
              function success(response) {},
              function error(errorResponse, status) {
                Notification.notify([$translate.instant('mediaFusion.mediaAgentOrgMappingFailure', {
                  failureMessage: errorResponse.message
                })], 'error');
              });
          } else {
            MediaServiceActivation.deleteUserIdentityOrgToMediaAgentOrgMapping(mediaAgentOrgIdsArray).then(
              function success(response) {},
              function error(errorResponse, status) {
                Notification.notify([$translate.instant('mediaFusion.mediaAgentOrgMappingFailure', {
                  failureMessage: errorResponse.message
                })], 'error');
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
  function DisableConfirmController(MediaServiceActivation, $modalInstance) {
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
    .controller('MediaServiceSettingsController', MediaServiceSettingsController);
}());
