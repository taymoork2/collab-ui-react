(function () {
  'use strict';

  angular
    .module('Sunlight')
    .controller('CareFeaturesDeleteCtrl', CareFeaturesDeleteCtrl);

  /* @ngInject */
  function CareFeaturesDeleteCtrl($rootScope, $scope, $stateParams, $timeout, Analytics, CardUtils, CareFeatureList, CvaService, EvaService, Log, Notification) {
    var vm = this;
    vm.deleteFeature = deleteFeature;
    vm.deleteBtnDisabled = false;
    vm.featureId = $stateParams.deleteFeatureId;
    vm.featureName = $stateParams.deleteFeatureName;
    vm.featureType = $stateParams.deleteFeatureType;
    vm.queueId = $stateParams.deleteQueueId;
    vm.confirmationText = 'careChatTpl.deleteFeatureTextConfirmation';

    if (vm.featureType === CvaService.cvaServiceCard.id) {
      vm.confirmationText = 'careChatTpl.deleteVaFeatureTextConfirmation';
    } else if (vm.featureType === EvaService.evaServiceCard.id) {
      vm.confirmationText = 'careChatTpl.deleteEvaFeatureTextConfirmation';
    }

    function deleteFeature() {
      vm.deleteBtnDisabled = true;
      var deleteFunc = CareFeatureList.deleteTemplate;
      var deleteSuccessEvent;
      var deleteFailureEvent;
      if (vm.featureType === CvaService.cvaServiceCard.id) {
        deleteFunc = CvaService.deleteConfig.bind(CvaService);
        deleteSuccessEvent = Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_DELETE_SUCCESS;
        deleteFailureEvent = Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_DELETE_FAILURE;
      } else if (vm.featureType === EvaService.evaServiceCard.id) {
        deleteFunc = EvaService.deleteExpertAssistant.bind(EvaService);
        deleteSuccessEvent = Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_DELETE_SUCCESS;
        deleteFailureEvent = Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_DELETE_FAILURE;
      }
      deleteFunc(vm.featureId).then(function () {
        deleteSuccess(deleteSuccessEvent);
      }, function (response) {
        deleteError(response, deleteFailureEvent);
      });
    }

    function reInstantiateMasonry() {
      CardUtils.resize();
    }

    function deleteSuccess(deleteSuccessEvent) {
      vm.deleteBtnDisabled = false;

      // Writing metrics into mixpanel
      if (deleteSuccessEvent) {
        Analytics.trackEvent(deleteSuccessEvent);
      }

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

    function deleteError(response, deleteFailureEvent) {
      vm.deleteBtnDisabled = false;

      // Writing metrics into mixpanel
      if (deleteFailureEvent) {
        Analytics.trackEvent(deleteFailureEvent);
      }

      if (_.isFunction($scope.$dismiss)) {
        $scope.$dismiss();
      }

      Log.warn('Failed to delete name: ' + vm.featureName + ' and id:' + vm.featureId);

      Notification.errorWithTrackingId(response, 'careChatTpl.deleteFailedText', { featureName: vm.featureName });
    }
  }
})();
