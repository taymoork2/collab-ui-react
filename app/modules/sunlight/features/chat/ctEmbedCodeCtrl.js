(function () {
  'use strict';

  angular
    .module('Sunlight')
    .controller('EmbedCodeCtrl', EmbedCodeCtrl);

  function EmbedCodeCtrl($window, CTService, templateId, templateHeader) {
    var vm = this;
    vm.embedCodeSnippet = CTService.generateCodeSnippet(templateId);
    vm.downloadEmbedCode = downloadEmbedCode;
    vm.templateHeader = templateHeader;

    function downloadEmbedCode() {
      var anchorElement = $window.document.getElementById('downloadChatCodeTxt');
      var mimeType = 'text/plain';
      anchorElement.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(vm.embedCodeSnippet));
    }
  }
})();
