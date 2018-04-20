class WebExIframeContainerDirective implements ng.IDirective {
  public template = require('./iframeContainer.tpl.html');
  public scope = true;
  public restrict = 'E';
}

const WebExIframeContainerDirectiveFactory: ng.IDirectiveFactory = () => new WebExIframeContainerDirective();

angular.module('WebExApp')
  .directive('webexIframeContainer', WebExIframeContainerDirectiveFactory);
