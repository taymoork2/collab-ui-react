(function () {
  'use strict';

  angular
    .module('Sunlight')
    .controller('NewCareFeatureModalCtrl', NewCareFeatureModalCtrl);

  /* @ngInject */
  function NewCareFeatureModalCtrl($modalInstance, $scope, $state, Authinfo, VirtualAssistantService) {
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
      goToService: function goToService($state) {
        $state.go('care.setupAssistant', {
          type: 'chat',
        });
      },
    });

    serviceCards.push({ //careCallbackService
      id: 'Ca',
      type: 'callback',
      code: 'sunlightDetails.callbackTemplateCode',
      label: 'sunlightDetails.newFeatures.callbackType',
      description: vm.CallbackServiceDescription,
      icons: ['icon-calls'],
      disabled: !vm.hasCall,
      goToService: function goToService($state) {
        $state.go('care.setupAssistant', {
          type: 'callback',
        });
      },
    });

    serviceCards.push({ //careChatCallbackService
      id: 'ChCa',
      type: 'chatPlusCallback',
      code: 'sunlightDetails.chatTemplateCode',
      label: 'sunlightDetails.newFeatures.chatPlusCallbackType',
      description: vm.ChatCallbackServiceDescription,
      icons: ['icon-message', 'icon-calls'],
      disabled: !vm.hasCall,
      goToService: function goToService($state) {
        $state.go('care.setupAssistant', {
          type: 'chatPlusCallback',
        });
      },
    });
    if (vm.isVirtualAssistantEnabled) {
      serviceCards.push(VirtualAssistantService.serviceCard);
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
          feature.goToService($state);
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
