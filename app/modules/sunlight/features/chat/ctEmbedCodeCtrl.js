(function () {
  'use strict';

  angular
    .module('Sunlight')
    .controller('EmbedCodeCtrl', EmbedCodeCtrl);

  function EmbedCodeCtrl(CTService, templateId) {
    var vm = this;
    vm.embedCodeSnippet = CTService.generateCodeSnippet(templateId);
  }

})();
