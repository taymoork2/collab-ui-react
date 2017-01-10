(function () {
  'use strict';

  angular
        .module('Sunlight')
        .controller('NewCareFeatureModalCtrl', NewCareFeatureModalCtrl);

    /* @ngInject */
  function NewCareFeatureModalCtrl($modalInstance, $scope, $state, FeatureToggleService) {
    var vm = $scope;

    vm.features = [];

    var careChatService = {
      id: 'Ch',
      code: 'sunlightDetails.chatTemplateCode',
      label: 'sunlightDetails.newFeatures.chatType',
      description: 'sunlightDetails.newFeatures.selectCHDesc',
      icon: 'icon-message'
    };

    var careCallbackService = {
      id: 'Ca',
      code: 'sunlightDetails.callbackTemplateCode',
      label: 'sunlightDetails.newFeatures.callbackType',
      description: 'sunlightDetails.newFeatures.selectCADesc',
      icon: 'icon-calls'
    };

    FeatureToggleService.atlasCareTrialsGetStatus().then(function (result) {
      if (result) {
        vm.features.push(careChatService);
      }
    });

    FeatureToggleService.atlasCareCallbackTrialsGetStatus().then(function (result) {
      if (result) {
        vm.features.push(careCallbackService);
      }
    });

    vm.ok = ok;
    vm.cancel = cancel;

    function ok(featureId) {
      if (featureId === 'Ch') {
        $state.go('care.setupAssistant', {
          type: 'chat'
        });
      } else if (featureId === 'Ca') {
        $state.go('care.setupAssistant', {
          type: 'callback'
        });
      }
      $modalInstance.close(featureId);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }
  }
})();
