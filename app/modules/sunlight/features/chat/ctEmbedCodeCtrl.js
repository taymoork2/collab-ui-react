(function () {
  'use strict';

  /* global Uint8Array:false */

  angular
    .module('Sunlight')
    .controller('EmbedCodeCtrl', EmbedCodeCtrl);

  function EmbedCodeCtrl($scope, CTService, templateId) {

    var vm = this;
    vm.embedCodeSnippet = '';

    init();

    function init() {
      vm.embedCodeSnippet = getEmbedCodeSnippet();
    }

    function getEmbedCodeSnippet() {
      return CTService.generateCodeSnippet(templateId);
    }

    $scope.embedCodeCtrl = vm;
  }

})();
