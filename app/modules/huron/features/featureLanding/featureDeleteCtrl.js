/**
 * Created by sjalipar on 10/6/15.
 */
(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('HuronFeatureDeleteCtrl', HuronFeatureDeleteCtrl);

  /* @ngInject */
  function HuronFeatureDeleteCtrl($q, $rootScope, $scope, $stateParams, $timeout, $translate, AACalendarService, AACommonService, AAModelService, AutoAttendantCeInfoModelService, AutoAttendantCeService, CallParkService, CallPickupGroupService, CardUtils, DoRestService, HuntGroupService, Log, Notification, PagingGroupService) {
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

    function deleteDoRest(doRestIdsList) {
      var promiseList = [];
      _.forEach(doRestIdsList, function (doRestIds) {
        _.forEach(doRestIds, function (doRest) {
          promiseList.push(DoRestService.deleteDoRest(doRest)
            .then(function (response) {
              return response;
            })
            .catch(function (response) {
              // bail out even if the response is 404
              if (response.status === 404) {
                return response;
              } else {
                return $q.reject(response);
              }
            })
          );
        });
      });
      return $q.all(promiseList);
    }

    function deleteCeWrapper(ceUrl, delPosition, ceInfoToDelete, scheduleId) {
      var aaModel = AAModelService.getAAModel();
      AutoAttendantCeService.deleteCe(ceUrl)
        .then(function () {
          //Important: We are splicing aaModel.ceInfos list, as aaModel.ceInfo is global object
          //and if concurrently modified could lead to unwanted/error condition.
          //Currently, our UI flow is preventing it to delete more than one AA at a time, so
          //there are no parallel execution of this code.
          //If you are modifying that behavior, please take care of splicing in parallel deletion.

          aaModel.ceInfos.splice(delPosition, 1);
          AutoAttendantCeInfoModelService.deleteCeInfo(aaModel.aaRecords, ceInfoToDelete);
          if (!_.isUndefined(scheduleId)) {
            AACalendarService.deleteCalendar(scheduleId);
          }
          deleteSuccess();
        })
        .catch(function (response) {
          deleteError(response);
        });
    }

    function deleteCeFromDb(data, ceInfoToDelete, delPosition) {
      var scheduleId = data.scheduleId;
      var doRestIdsList = [];
      if (AACommonService.isRestApiToggle()) {
        var actionSets = _.get(data, 'actionSets', []);
        _.forEach(actionSets, function (actionSet) {
          var actions = actionSet.actions;
          var doRestList = _.filter(actions, 'doREST');
          if (doRestList.length) {
            doRestIdsList.push(_.map(doRestList, 'doREST.id'));
          }
        });
        if (!_.isEmpty(doRestIdsList)) {
          deleteDoRest(doRestIdsList)
            .then(function () {
              deleteCeWrapper(ceInfoToDelete.getCeUrl(), delPosition, ceInfoToDelete, scheduleId);
            })
            .catch(function (response) {
              deleteError(response);
            });
        } else {
          deleteCeWrapper(ceInfoToDelete.getCeUrl(), delPosition, ceInfoToDelete, scheduleId);
        }
      } else {
        deleteCeWrapper(ceInfoToDelete.getCeUrl(), delPosition, ceInfoToDelete, scheduleId);
      }
    }

    function deleteFeature() {
      vm.deleteBtnDisabled = true;

      if (vm.featureFilter === 'AA') {
        var aaModel = AAModelService.getAAModel();
        var ceInfoToDelete;
        var delPosition;
        for (var i = 0; i < aaModel.ceInfos.length; i++) {
          var ceUrl = aaModel.ceInfos[i].getCeUrl();
          var uuidPos = ceUrl.lastIndexOf('/');
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
            deleteCeFromDb(data, ceInfoToDelete, delPosition);
          })
          .catch(function (response) {
            deleteError(response);
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
          featureType: vm.featureType,
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
        featureType: vm.featureType,
      });
      if (response) {
        if (response.status) {
          error += $translate.instant('errors.statusError', {
            status: response.status,
          });
          if (response.data && _.isString(response.data)) {
            error += ' ' + $translate.instant('huronFeatureDetails.messageError', {
              message: response.data,
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
