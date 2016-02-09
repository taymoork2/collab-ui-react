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
    vm.combo = true;
    vm.selectPlaceholder = 'Add new / Select existing Cluster';
    vm.addRedirectTargetClicked = addRedirectTargetClicked;
    vm.redirectToTargetAndCloseWindowClicked = redirectToTargetAndCloseWindowClicked;
    vm.getGroups = getGroups;
    vm.enableRedirectToTarget = false;
    vm.selectedCluster = '';
    vm.groupDetail = null;

    function getGroups() {
      vm.groupResponse = MediaClusterService.getGroups().then(function (group) {
        vm.groups = group;
        _.each(group, function (group) {
          vm.clusterList.push(group.name);
        });
      });
    }
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
            vm.redirectToTargetAndCloseWindowClicked(hostName, enteredCluster, resp.data.id);
          });
        } else {
          vm.redirectToTargetAndCloseWindowClicked(hostName, enteredCluster, vm.groupDetail.id);
        }
      }, XhrNotificationService.notify);
    }

    function redirectToTargetAndCloseWindowClicked(hostName, clusterName, propertSetId) {
      $modalInstance.close();
      $window.open("https://" + encodeURIComponent(hostName) + "/?groupName=" + encodeURIComponent(clusterName) + "&propertySetId=" + encodeURIComponent(propertSetId));
    }
  }
}());
