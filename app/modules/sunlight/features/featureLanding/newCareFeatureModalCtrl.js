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
    vm.isVirtualAssistantEnabled = $state.isVirtualAssistantEnabled;
    var serviceCards = [];
    serviceCards.push({ //careChatService
      id: 'Ch',
      type: 'chat',
      code: 'sunlightDetails.chatTemplateCode',
      label: 'sunlightDetails.newFeatures.chatType',
      description: 'sunlightDetails.newFeatures.selectCHDesc',
      icons: ['icon-message'],
      disabled: false,
    });

    serviceCards.push({ //careCallbackService
      id: 'Ca',
      type: 'callback',
      code: 'sunlightDetails.callbackTemplateCode',
      label: 'sunlightDetails.newFeatures.callbackType',
      description: vm.CallbackServiceDescription,
      icons: ['icon-calls'],
      disabled: !vm.hasCall,
    });

    serviceCards.push({ //careChatCallbackService
      id: 'ChCa',
      type: 'chatPlusCallback',
      code: 'sunlightDetails.chatTemplateCode',
      label: 'sunlightDetails.newFeatures.chatPlusCallbackType',
      description: vm.ChatCallbackServiceDescription,
      icons: ['icon-message', 'icon-calls'],
      disabled: !vm.hasCall,
    });
    if (vm.isVirtualAssistantEnabled) {
      // sunlightDetails exists in en_US.json we may want virtualAssistant?
      serviceCards.push({ //careVirtualAssistantService
        id: 'Va',
        type: 'virtualAssistant',
        code: 'sunlightDetails.virtualAssistantCode',
        label: 'sunlightDetails.newFeatures.virtualAssistantType',
        description: 'sunlightDetails.newFeatures.selectVADesc',
        icons: ['icon-bot-four'],
        disabled: !vm.isVirtualAssistantEnabled,
      });
    }

    if (Authinfo.isCare()) {
      vm.features = serviceCards;
    }

    vm.ok = ok;
    vm.cancel = cancel;
    vm.purchaseLink = purchaseLink;

    function ok(featureId) {
      vm.features.forEach(function (feature) {
        if (feature.id === featureId) {
          $state.go('care.setupAssistant', {
            type: feature.type,
          });
        }
      });
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
