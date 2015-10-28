/**
 * Created by sjalipar on 10/6/15.
 */
(function () {
  'use strict';
  /* jshint validthis: true */
  angular
    .module('Huron')
    .controller('HuronFeatureDeleteCtrl', HuronFeatureDeleteCtrl);

  function HuronFeatureDeleteCtrl($rootScope, $scope, $stateParams, $timeout, $translate, Authinfo, HuntGroupService, AutoAttendantCeService, Notification, Log) {
    var vm = this;
    vm.featureId = $stateParams.deleteFeatureId;
    vm.featureName = $stateParams.deleteFeatureName;
    vm.featureFilter = $stateParams.deleteFeatureType;
    vm.featureType = vm.featureFilter === 'AA' ? $translate.instant('autoAttendant.title') : vm.featureFilter === 'HG' ?
      $translate.instant('huntGroup.title') : 'Feature';

    vm.deleteBtnDisabled = false;

    vm.deleteFeature = deleteFeature;

    function deleteFeature() {

      vm.deleteBtnDisabled = true;

      var customerOrgId = Authinfo.getOrgId();

      if (vm.featureFilter === 'AA') {
        AutoAttendantCeService.deleteCe(vm.featureId).then(function (response) {

          vm.deleteBtnDisabled = false;

          if (angular.isFunction($scope.$dismiss)) {
            $scope.$dismiss();
          }

          $timeout(function () {
            $rootScope.$broadcast('HUNT_GROUP_DELETED');
            Notification.success('huntGroupDetails.deleteHuntGroupSuccessText', {
              featureName: vm.deleteFeatureType
            });
          }, 250);

        }, function (response) {
          vm.deleteBtnDisabled = false;

          if (angular.isFunction($scope.$dismiss)) {
            $scope.$dismiss();
          }

          Log.warn('Could not delete the huntGroup with id:', vm.deleteHuntGroupId);
          var error = '';
          if (response.status) {
            error = $translate.instant('errors.statusError', {
              status: response.status
            });
            if (response.data && angular.isString(response.data)) {
              error += ' ' + $translate.instant('huntGroupDetails.messageError', {
                message: response.data
              });
            }
          } else {
            error = 'Request failed.';
            if (angular.isString(response.data)) {
              error += ' ' + response.data;
            }
          }
          Notification.error(error);
        });
      }
      // else if (vm.featureFilter === 'hg') {
      //   //
      // } else if (vm.featureFilter === 'cp') {
      //   //
      // } 
      else {
        return;
      }

    }
  }
})();
