(function () {
  'use strict';

  angular
        .module('Sunlight')
        .controller('NewCareFeatureModalCtrl', NewCareFeatureModalCtrl);

    /* @ngInject */
  function NewCareFeatureModalCtrl($modalInstance, $scope, $state, Authinfo) {
    var vm = $scope;

    vm.features = [];

    var careChatService = {
      id: 'Ch',
      code: 'sunlightDetails.chatTemplateCode',
      label: 'sunlightDetails.newFeatures.chatType',
      description: 'sunlightDetails.newFeatures.selectCHDesc',
      icons: ['icon-message'],
    };

    var careCallbackService = {
      id: 'Ca',
      code: 'sunlightDetails.callbackTemplateCode',
      label: 'sunlightDetails.newFeatures.callbackType',
      description: 'sunlightDetails.newFeatures.selectCADesc',
      icons: ['icon-calls'],
    };

    var careChatCallbackService = {
      id: 'ChCa',
      code: 'sunlightDetails.chatTemplateCode',
      label: 'sunlightDetails.newFeatures.chatPlusCallbackType',
      description: 'sunlightDetails.newFeatures.selectCHCADesc',
      icons: ['icon-message', 'icon-calls'],
    };

    if (Authinfo.isCare()) {
      vm.features.push(careChatService);
      vm.features.push(careCallbackService);
      vm.features.push(careChatCallbackService);
    }

    vm.ok = ok;
    vm.cancel = cancel;

    function ok(featureId) {
      if (featureId === 'Ch') {
        $state.go('care.setupAssistant', {
          type: 'chat',
        });
      } else if (featureId === 'Ca') {
        $state.go('care.setupAssistant', {
          type: 'callback',
        });
      } else if (featureId === 'ChCa') {
        $state.go('care.setupAssistant', {
          type: 'chatPlusCallback',
        });
      }
      $modalInstance.close(featureId);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }
  }
})();
