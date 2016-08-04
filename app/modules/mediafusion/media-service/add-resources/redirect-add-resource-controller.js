(function () {
  'use strict';

  angular
    .module("Mediafusion")
    .controller("RedirectAddResourceController", RedirectAddResourceController);

  /* @ngInject */
  function RedirectAddResourceController(RedirectTargetService, MediaClusterService, $modalInstance, $window, XhrNotificationService) {
    var vm = this;
    vm.clusterList = [];
    vm.onlineClusterList = [];
    vm.offlineClusterList = [];
    vm.groups = null;
    vm.combo = true;
    vm.selectPlaceholder = 'Add new / Select existing Cluster';
    vm.addRedirectTargetClicked = addRedirectTargetClicked;
    vm.redirectToTargetAndCloseWindowClicked = redirectToTargetAndCloseWindowClicked;
    vm.redirectPopUpAndClose = redirectPopUpAndClose;
    vm.back = back;
    vm.getGroups = getGroups;
    vm.getClusters = getClusters;
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

    function getClusters() {
      vm.clusterResponse = MediaClusterService.getClusterList().then(function (cluster) {
        _.each(cluster, function (cluster) {
          if ("running" === cluster.services[0].connectors[0].state) {
            vm.onlineClusterList.push(cluster.name);
          } else {
            vm.offlineClusterList.push(cluster.name);
          }
        });
      });
    }
    vm.getClusters();

    function addRedirectTargetClicked(hostName) {
      RedirectTargetService.addRedirectTarget(hostName).then(function () {

        if (vm.onlineClusterList.indexOf(hostName) > -1) {
          $modalInstance.close();
          XhrNotificationService.notify('The media server that you are registering already exists and is online.');
          /*$modalInstance.close();
          $modal.open({
            templateUrl: 'modules/mediafusion/media-service/add-resources/redirect-add-resource-dialog-online-error.html'
          });*/
        }

        if (vm.offlineClusterList.indexOf(hostName) > -1) {
          $modalInstance.close();
          XhrNotificationService.notify('The media server that you are registering already exists and is offline. Deregister the existing server before you try again.');
          /*$modalInstance.close();
          $modal.open({
            templateUrl: 'modules/mediafusion/media-service/add-resources/redirect-add-resource-dialog-offline-error.html'
          });*/
        }

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
          vm.propertySetValue = MediaClusterService.getPropertySet(resp.data.id).then(function (propertySet) {
            propertySet.properties["fms.releaseChannel"] = 'GA';
            MediaClusterService.setPropertySet(resp.data.id, propertySet);
          });
          vm.redirectPopUpAndClose(hostName, enteredCluster, resp.data.id);
        });
      } else {
        vm.redirectPopUpAndClose(hostName, enteredCluster, vm.groupDetail.id);
      }
    }

    function redirectPopUpAndClose(hostName, enteredCluster, propertSetId) {
      $modalInstance.close();
      vm.popup = $window.open("https://" + encodeURIComponent(hostName) + "/?groupName=" + encodeURIComponent(enteredCluster) + "&propertySetId=" + encodeURIComponent(propertSetId));
    }

    function back() {
      vm.enableRedirectToTarget = false;
      vm.createNewGroup = false;
    }
  }
}());
