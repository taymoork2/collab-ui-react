(function () {
  'use strict';

  angular
    .module('Sunlight')
    .controller('CareFeaturesDeleteCtrl', CareFeaturesDeleteCtrl);

  /* @ngInject */
  function CareFeaturesDeleteCtrl($rootScope, $scope, $stateParams, $timeout, CardUtils, CareFeatureList, Log, Notification) {
    var vm = this;
    vm.deleteFeature = deleteFeature;
    vm.deleteBtnDisabled = false;
    vm.featureId = $stateParams.deleteFeatureId;
    vm.featureName = $stateParams.deleteFeatureName;
    vm.featureType = $stateParams.deleteFeatureType;
    vm.confirmationText = 'careChatTpl.deleteFeatureTextConfirmation';

    if (vm.featureType === 'Va') {
      vm.confirmationText = 'careChatTpl.deleteVaFeatureTextConfirmation';
    }

    function deleteFeature() {
      vm.deleteBtnDisabled = true;
      var deleteFunc = CareFeatureList.deleteTemplate;
      if (vm.featureType === 'Va') {
        deleteFunc = CareFeatureList.deleteVirtualAssistantConfig;
      }
      deleteFunc(vm.featureId).then(function () {
        deleteSuccess();
      }, function (response) {
        deleteError(response);
      });
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
        });
        reInstantiateMasonry();
      }, 250);
    }

    function deleteError(response) {
      vm.deleteBtnDisabled = false;

      if (_.isFunction($scope.$dismiss)) {
        $scope.$dismiss();
      }

      Log.warn('Failed to delete name: ' + vm.featureName + ' and id:' + vm.featureId);

      Notification.errorWithTrackingId(response, 'careChatTpl.deleteFailedText', { featureName: vm.featureName });
    }
  }
})();
