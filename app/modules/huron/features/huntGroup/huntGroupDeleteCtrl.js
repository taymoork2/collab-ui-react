/**
 * Created by sjalipar on 10/6/15.
 */
(function () {
  'use strict';
  /* jshint validthis: true */
  angular
    .module('uc.hurondetails')
    .controller('HuntGroupDeleteCtrl', HuntGroupDeleteCtrl);

  /* @ngInject */
  function HuntGroupDeleteCtrl($rootScope, $scope, $stateParams, $timeout, $translate, Authinfo, HuntGroupService, Notification, Log) {
    var vm = this;
    vm.deleteHuntGroupId = $stateParams.deleteHuntGroupId;
    vm.deleteHuntGroupName = $stateParams.deleteHuntGroupName;
    vm.deleteBtnDisabled = false;

    vm.deleteHuntGroup = function () {

      vm.deleteBtnDisabled = true;

      var customerOrgId = Authinfo.getOrgId();

      HuntGroupService.deleteHuntGroup(customerOrgId, vm.deleteHuntGroupId).then(function (response) {

        vm.deleteBtnDisabled = false;

        if (angular.isFunction($scope.$dismiss)) {
          $scope.$dismiss();
        }

        $timeout(function () {
          $rootScope.$broadcast('HUNT_GROUP_DELETED');
          Notification.success('huronHuntGroup.deleteHuntGroupSuccessText', {
            huntGroupName: vm.deleteHuntGroupName
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
            error += ' ' + $translate.instant('huronHuntGroup.messageError', {
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
    };
  }
})();
