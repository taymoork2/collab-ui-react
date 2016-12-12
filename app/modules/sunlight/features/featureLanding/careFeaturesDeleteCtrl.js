(function () {
  'use strict';

  angular
    .module('Sunlight')
    .controller('CareFeaturesDeleteCtrl', CareFeaturesDeleteCtrl);

  /* @ngInject */
  function CareFeaturesDeleteCtrl($rootScope, $scope, $stateParams, $timeout, $translate, CardUtils, CareFeatureList, Log, Notification) {
    var vm = this;
    vm.deleteFeature = deleteFeature;
    vm.deleteBtnDisabled = false;
    vm.featureId = $stateParams.deleteFeatureId;
    vm.featureName = $stateParams.deleteFeatureName;
    vm.featureType = $stateParams.deleteFeatureType;
    vm.featureText = vm.featureType === 'Ch' ? $translate.instant('careChatTpl.chatTemplate') : '';

    function deleteFeature() {
      vm.deleteBtnDisabled = true;
      if (vm.featureType === 'Ch') {
        CareFeatureList.deleteChatTemplate(vm.featureId).then(function () {
          deleteSuccess();
        }, function (response) {
          deleteError(response);
        });
      }
    }

    function reInstantiateMasonry() {
      CardUtils.resize();
    }

    function deleteSuccess() {
      vm.deleteBtnDisabled = false;

      if (_.isFunction($scope.$dismiss)) {
        $scope.$dismiss();
      }

      $timeout(function () {
        $rootScope.$broadcast('CARE_FEATURE_DELETED');
        Notification.success('careChatTpl.deleteSuccessText', {
          featureName: vm.featureName,
          featureText: vm.featureText
        });
        reInstantiateMasonry();
      }, 250);
    }

    function deleteError(response) {
      vm.deleteBtnDisabled = false;

      if (_.isFunction($scope.$dismiss)) {
        $scope.$dismiss();
      }
      Log.warn('Failed to delete the ' + vm.featureText + ' with name: ' + vm.featureName + ' and id:' + vm.featureId);

      var error = $translate.instant('careChatTpl.deleteFailedText', {
        featureName: vm.featureName,
        featureText: vm.featureText
      });
      if (response) {
        if (response.status) {
          error += ' ' + $translate.instant('errors.statusError', {
            status: response.status
          });
          if (response.data && _.isString(response.data)) {
            error += ' ' + $translate.instant('careChatTpl.messageError', {
              message: response.data
            });
          }
        } else {
          error += ' Request failed.';
          if (_.isString(response.data)) {
            error += ' ' + response.data;
          }
        }
      }
      Notification.error(error);
    }

  }
})();
