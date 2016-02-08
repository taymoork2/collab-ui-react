(function () {
  'use strict';

  angular
    .module("Mediafusion")
    .controller("RedirectAddResourceController", RedirectAddResourceController);

  /* @ngInject */
  function RedirectAddResourceController(RedirectTargetService, MediaClusterService, $modalInstance, $window, XhrNotificationService, $log) {
    var vm = this;
    vm.clusterList = [];
    vm.groups = null;
    vm.selectPlaceholder = 'Add new / Select existing Cluster';
    vm.addRedirectTargetClicked = addRedirectTargetClicked;
    vm.redirectToTargetAndCloseWindowClicked = redirectToTargetAndCloseWindowClicked;
    vm.enableRedirectToTarget = false;
    vm.selectedCluster = '';
    vm.groupDetail = null;

    vm.getGroups = function () {
      vm.groupResponse = MediaClusterService.getGroups().then(function (group) {
        vm.groups = group;
        _.each(group, function (group) {
          vm.clusterList.push(group.name);
        });
      });
    };
    vm.getGroups();

    function addRedirectTargetClicked(hostName, enteredCluster) {
      // $log.log("entered value", enteredCluster);
      RedirectTargetService.addRedirectTarget(hostName).then(function () {
        _.each(vm.groups, function (group) {
          if (group.name == vm.selectedCluster) {
            vm.groupDetail = group;
          }
        });
        // $log.log("group details", vm.groupDetail);
        if (vm.groupDetail == null) {
          // $log.log("creation logic here");
          MediaClusterService.createGroup(enteredCluster).then(function (resp) {
            // $log.log("create repsone", resp);
            // $log.log("create repsone", resp.data.id);
            $modalInstance.close();
            $window.open("https://" + encodeURIComponent(hostName) + "/?groupName=" + encodeURIComponent(enteredCluster) + "&propertySetId=" + encodeURIComponent(resp.data.id));
          });
        } else {
          $modalInstance.close();
          $window.open("https://" + encodeURIComponent(hostName) + "/?groupName=" + encodeURIComponent(enteredCluster) + "&propertySetId=" + encodeURIComponent(vm.groupDetail.id));
        }
      }, XhrNotificationService.notify);
    }

    function selectCluster(enteredCluster) {
      // $log.log("inside");
      $log.log("entered value", enteredCluster);
    }

    function redirectToTargetAndCloseWindowClicked(hostName) {
      $modalInstance.close();
      $window.open("https://" + encodeURIComponent(hostName) + "/fusionregistration");
    }
  }
}());
