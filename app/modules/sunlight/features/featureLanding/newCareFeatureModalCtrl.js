(function () {
  'use strict';

  angular
        .module('Sunlight')
        .controller('NewCareFeatureModalCtrl', NewCareFeatureModalCtrl);

    /* @ngInject */
  function NewCareFeatureModalCtrl($modalInstance, $scope, $state, Authinfo) {
    var vm = $scope;

    vm.features = [];
    vm.hasCall = Authinfo.isSquaredUC();
    vm.CallbackServiceDescription = vm.hasCall ? 'sunlightDetails.newFeatures.selectCADesc'
                                                : 'sunlightDetails.featuresNotYetConfiguredPage.CallLicenseMissing';
    vm.ChatCallbackServiceDescription = vm.hasCall ? 'sunlightDetails.newFeatures.selectCHCADesc'
                                                : 'sunlightDetails.featuresNotYetConfiguredPage.CallLicenseMissing';

    var careChatService = {
      id: 'Ch',
      code: 'sunlightDetails.chatTemplateCode',
      label: 'sunlightDetails.newFeatures.chatType',
      description: 'sunlightDetails.newFeatures.selectCHDesc',
      icons: ['icon-message'],
      disabled: false,
    };

    var careCallbackService = {
      id: 'Ca',
      code: 'sunlightDetails.callbackTemplateCode',
      label: 'sunlightDetails.newFeatures.callbackType',
      description: vm.CallbackServiceDescription,
      icons: ['icon-calls'],
      disabled: !vm.hasCall,
    };

    var careChatCallbackService = {
      id: 'ChCa',
      code: 'sunlightDetails.chatTemplateCode',
      label: 'sunlightDetails.newFeatures.chatPlusCallbackType',
      description: vm.ChatCallbackServiceDescription,
      icons: ['icon-message', 'icon-calls'],
      disabled: !vm.hasCall,
    };

    if (Authinfo.isCare()) {
      vm.features.push(careChatService);
      vm.features.push(careCallbackService);
      vm.features.push(careChatCallbackService);
    }

    vm.ok = ok;
    vm.cancel = cancel;
    vm.purchaseLink = purchaseLink;

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

    function purchaseLink() {
      cancel();
      $state.go('my-company.subscriptions');
    }
  }
})();
