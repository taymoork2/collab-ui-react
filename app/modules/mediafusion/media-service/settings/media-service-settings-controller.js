(function () {
  'use strict';

  /* @ngInject */
  function MediaServiceSettingsController($state, $modal, MediaServiceActivation, Authinfo, $stateParams, $translate, EmailNotificationConfigService, $log, EmailValidatorService, XhrNotificationService, Notification) {
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

    EmailNotificationConfigService.read(function (err, config) {
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
      if (vm.config.wx2users && !EmailValidatorService.isValidEmailCsv(vm.config.wx2users)) {
        Notification.error("hercules.errors.invalidEmail");
      } else {
        vm.savingEmail = true;
        EmailNotificationConfigService.write(vm.config, function (err) {
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
