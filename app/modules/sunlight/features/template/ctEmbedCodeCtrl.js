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

    function downloadEmbedCode($event) {
      var anchorElement = $window.document.getElementById('downloadChatCodeTxt');
      var blob = new $window.Blob([vm.embedCodeSnippet], {
        type: "text/plain;charset=utf-8;"
      });
      if ($window.navigator.msSaveOrOpenBlob) {
        $window.navigator.msSaveBlob(blob, "Chat_Code_Snippet");
        $event.preventDefault();
      } else {
        anchorElement.setAttribute('href', $window.URL.createObjectURL(blob));
        anchorElement.setAttribute('download', "Chat_Code_Snippet");
      }
    }
  }
})();
