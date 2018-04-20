class WebexSiteReportsDirective implements ng.IDirective {
  public template = require('./siteReports.tpl.html');
  public scope = true;
  public restrict = 'E';
}

const WebexSiteReportsDirectiveFactory: ng.IDirectiveFactory = () => new WebexSiteReportsDirective();

angular.module('WebExApp')
  .directive('webexSiteReports', WebexSiteReportsDirectiveFactory);
