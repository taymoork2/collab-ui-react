/**
 * Created by sjalipar on 10/6/15.
 */
(function () {
  'use strict';
  /* jshint validthis: true */
  angular
    .module('uc.hurondetails')
    .controller('HuntGroupDeleteCtrl', HuntGroupDeleteCtrl);

  function HuntGroupDeleteCtrl($rootScope, $scope, $stateParams, $translate, Authinfo, HuntGroupService, Notification, Log) {
    var vm = this;

    vm.deleteHuntGroup = function () {
      var customerOrgId = Authinfo.getOrgId();
      vm.deleteHuntGroupId = $stateParams.deleteHuntGroupId;
      vm.deleteHuntGroupName = $stateParams.deleteHuntGroupName;

      HuntGroupService.deleteHuntGroup(customerOrgId, vm.deleteHuntGroupId).then(function (response) {
        if (angular.isFunction($scope.$dismiss)) {
          $scope.$dismiss();
        }
        $rootScope.$broadcast('HUNT_GROUP_DELETED');
        Notification.success('huntGroupDetails.deleteHuntGroupSuccessText', {
          huntGroupName: vm.deleteHuntGroupName
        });
      }, function (response) {
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
    };
  }
})();
