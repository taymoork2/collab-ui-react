/**
 * Created by sjalipar on 10/6/15.
 */
(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('HuronFeatureDeleteCtrl', HuronFeatureDeleteCtrl);

  /* @ngInject */
  function HuronFeatureDeleteCtrl($rootScope, $scope, $stateParams, $timeout, $translate, AAModelService, CallPickupGroupService, HuntGroupService, CallParkService, PagingGroupService, AutoAttendantCeService, AutoAttendantCeInfoModelService, Notification, Log, AACalendarService, CardUtils) {
    var vm = this;
    vm.deleteBtnDisabled = false;
    vm.deleteFeature = deleteFeature;
    vm.featureId = $stateParams.deleteFeatureId;
    vm.featureName = $stateParams.deleteFeatureName;
    vm.featureFilter = $stateParams.deleteFeatureType;
    if (vm.featureFilter === 'AA') {
      vm.featureType = $translate.instant('autoAttendant.title');
    } else if (vm.featureFilter === 'HG') {
      vm.featureType = $translate.instant('huronHuntGroup.title');
    } else if (vm.featureFilter === 'CP') {
      vm.featureType = $translate.instant('callPark.title');
    } else if (vm.featureFilter === 'PG') {
      vm.featureType = $translate.instant('pagingGroup.title');
    } else if (vm.featureFilter === 'PI') {
      vm.featureType = $translate.instant('callPickup.title');
    } else {
      vm.featureType = $translate.instant('huronFeatureDetails.feature');
    }
    vm.deleteBtnDisabled = false;

    vm.deleteFeature = deleteFeature;
    vm.deleteSuccess = deleteSuccess;
    vm.deleteError = deleteError;

    function reInstantiateMasonry() {
      CardUtils.resize();
    }

    function deleteFeature() {
      vm.deleteBtnDisabled = true;

      if (vm.featureFilter === 'AA') {

        var aaModel = AAModelService.getAAModel();
        var ceInfoToDelete;
        var delPosition;
        for (var i = 0; i < aaModel.ceInfos.length; i++) {
          var ceUrl = aaModel.ceInfos[i].getCeUrl();
          var uuidPos = ceUrl.lastIndexOf("/");
          var uuid = ceUrl.substr(uuidPos + 1);
          if (uuid === vm.featureId) {
            ceInfoToDelete = aaModel.ceInfos[i];
            delPosition = i;
            break;
          }
        }

        if (ceInfoToDelete === undefined) {
          deleteError();
          return;
        }

        AutoAttendantCeService.readCe(ceInfoToDelete.getCeUrl())
          .then(function (data) {
            var scheduleId = data.scheduleId;
            AutoAttendantCeService.deleteCe(ceInfoToDelete.getCeUrl())
              .then(function () {
                aaModel.ceInfos.splice(delPosition, 1);
                AutoAttendantCeInfoModelService.deleteCeInfo(aaModel.aaRecords, ceInfoToDelete);
                if (!_.isUndefined(scheduleId)) {
                  AACalendarService.deleteCalendar(scheduleId);
                }
                deleteSuccess();
              },
              function (response) {
                deleteError(response);
              });
          });
      } else if (vm.featureFilter === 'HG') {
        HuntGroupService.deleteHuntGroup(vm.featureId).then(
          function () {
            deleteSuccess();
          },
          function (response) {
            deleteError(response);
          }
        );
      } else if (vm.featureFilter === 'CP') {
        CallParkService.deleteCallPark(vm.featureId).then(
          function () {
            deleteSuccess();
          },
          function (response) {
            deleteError(response);
          }
        );
      } else if (vm.featureFilter === 'PG') {
        PagingGroupService.deletePagingGroup(vm.featureId).then(
          function () {
            deleteSuccess();
          },
          function (response) {
            deleteError(response);
          }
        );
      } else if (vm.featureFilter === 'PI') {
        CallPickupGroupService.deletePickupGroup(vm.featureId).then(
          function () {
            deleteSuccess();
          },
          function (response) {
            deleteError(response);
          }
        );
      }
    }

    function deleteSuccess() {
      vm.deleteBtnDisabled = false;

      if (_.isFunction($scope.$dismiss)) {
        $scope.$dismiss();
      }

      $timeout(function () {
        $rootScope.$broadcast('HURON_FEATURE_DELETED');
        Notification.success('huronFeatureDetails.deleteSuccessText', {
          featureName: vm.featureName,
          featureType: vm.featureType
        });
        reInstantiateMasonry();
      }, 250);
    }

    function deleteError(response) {
      vm.deleteBtnDisabled = false;

      if (_.isFunction($scope.$dismiss)) {
        $scope.$dismiss();
      }
      Log.warn('Failed to delete the ' + vm.featureType + ' with name: ' + vm.featureName + ' and id:' + vm.featureId);

      var error = $translate.instant('huronFeatureDetails.deleteFailedText', {
        featureName: vm.featureName,
        featureType: vm.featureType
      });
      if (response) {
        if (response.status) {
          error += $translate.instant('errors.statusError', {
            status: response.status
          });
          if (response.data && _.isString(response.data)) {
            error += ' ' + $translate.instant('huronFeatureDetails.messageError', {
              message: response.data
            });
          }
        } else {
          error += 'Request failed.';
          if (_.isString(response.data)) {
            error += ' ' + response.data;
          }
        }
      }
      Notification.error(error);
    }
  }

})();
