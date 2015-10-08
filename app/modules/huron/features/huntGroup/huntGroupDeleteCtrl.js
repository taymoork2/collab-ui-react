/**
 * Created by sjalipar on 10/6/15.
 */
(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .controller('HuntGroupDeleteCtrl', HuntGroupDeleteCtrl);

  /* jshint validthis: true */

  function HuntGroupDeleteCtrl($rootScope, $scope, $stateParams, $translate, Authinfo, HuntGroupService, Notification, Log) {
    var vm = this;
    vm.deleteHuntGroupName = $stateParams.deleteHuntGroupName;
    vm.deleteHuntGroupId = $stateParams.deleteHuntGroupId;

    vm.deleteHuntGroup = function () {
      var customerOrgId = Authinfo.getOrgId();
      HuntGroupService.deleteHuntGroup(customerOrgId, vm.deleteHuntGroupId)
        .then(function (response) {

          if (angular.isFunction($scope.$dismiss)) {
            $scope.$dismiss();
          }
          $rootScope.$broadcast('HUNT_GROUP_DELETED');
          Notification.notify([$translate.instant('huntGroupDetails.deleteHuntGroupSuccessText', {
            huntGroupName: vm.deleteHuntGroupName
          })], 'success');

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
