(function () {
  'use strict';

  angular
    .module('Sunlight')
    .controller('EmbedCodeCtrl', EmbedCodeCtrl);

  function EmbedCodeCtrl($window, CTService, SunlightConfigService, templateId, templateHeader, templateName) {
    var vm = this;
    vm.embedCodeSnippet = CTService.generateCodeSnippet(templateId, templateName);
    vm.downloadEmbedCode = downloadEmbedCode;
    vm.templateHeader = templateHeader;
    vm.isLoading = true;

    SunlightConfigService.getChatConfig()
      .then(function (response) {
        var allowedOrigins = _.get(response, 'data.allowedOrigins');
        var warn = false;
        if (allowedOrigins.length === 1 && allowedOrigins[0] === '.*') {
          allowedOrigins = null;
          warn = true;
        }
        vm.domainInfo = { data: allowedOrigins, error: false, warn: warn };
      })
      .catch(function () {
        vm.domainInfo = { data: null, error: true, warn: false };
      })
      .finally(function () {
        vm.isLoading = false;
      });

    function downloadEmbedCode($event) {
      var anchorElement = $window.document.getElementById('downloadChatCodeTxt');
      var blob = new $window.Blob([vm.embedCodeSnippet], {
        type: 'text/plain;charset=utf-8;',
      });
      if ($window.navigator.msSaveOrOpenBlob) {
        $window.navigator.msSaveBlob(blob, 'Chat_Code_Snippet');
        $event.preventDefault();
      } else {
        anchorElement.setAttribute('href', $window.URL.createObjectURL(blob));
        anchorElement.setAttribute('download', 'Chat_Code_Snippet');
      }
    }
  }
})();
