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
    vm.redirectPopUpAndClose = redirectPopUpAndClose;
    vm.back = back;
    vm.getGroups = getGroups;
    vm.enableRedirectToTarget = false;
    vm.selectedCluster = '';
    vm.groupDetail = null;
    vm.popup = '';
    vm.createNewGroup = false;

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
      RedirectTargetService.addRedirectTarget(hostName).then(function () {
        vm.enableRedirectToTarget = true;
        _.each(vm.groups, function (group) {
          if (group.name == vm.selectedCluster) {
            vm.groupDetail = group;
          }
        });
        if (vm.groupDetail == null) {
          /*MediaClusterService.createGroup(enteredCluster).then(function (resp) {
            vm.redirectToTargetAndCloseWindowClicked(hostName, enteredCluster, resp.data.id);
          });*/
          vm.createNewGroup = true;
        }
        /* else {
                  vm.redirectToTargetAndCloseWindowClicked(hostName, enteredCluster, vm.groupDetail.id);
                }*/
      }, XhrNotificationService.notify);
    }

    function redirectToTargetAndCloseWindowClicked(hostName, enteredCluster) {
      _.each(vm.groups, function (group) {
        if (group.name == vm.selectedCluster) {
          vm.groupDetail = group;
        }
      });
      if (vm.groupDetail == null) {
        MediaClusterService.createGroup(enteredCluster).then(function (resp) {
          vm.redirectPopUpAndClose(hostName, enteredCluster, resp.data.id);
        });
      } else {
        vm.redirectPopUpAndClose(hostName, enteredCluster, vm.groupDetail.id);
      }
    }

    function redirectPopUpAndClose(hostName, enteredCluster, propertSetId) {
      $modalInstance.close();
      vm.popup = $window.open("https://" + encodeURIComponent(hostName) + "/?groupName=" + encodeURIComponent(enteredCluster) + "&propertySetId=" + encodeURIComponent(propertSetId));
      if (!vm.popup || vm.popup.closed || typeof vm.popup.closed == 'undefined') {
        $log.log('popup.closed');
      }
    }

    function back() {
      vm.enableRedirectToTarget = false;
      vm.createNewGroup = false;
    }
  }
}());
