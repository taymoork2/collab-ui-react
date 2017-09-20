class SiteActionsReportsIconDirective implements ng.IDirective {
  public template = require('./siteActionsReportsIcon.tpl.html');
  public scope = true;
  public restrict = 'E';
}

const SiteActionsReportsIconDirectiveFactory: ng.IDirectiveFactory = () => new SiteActionsReportsIconDirective();

angular.module('Core')
  .directive('crSiteActionsReportsIcon', SiteActionsReportsIconDirectiveFactory);
