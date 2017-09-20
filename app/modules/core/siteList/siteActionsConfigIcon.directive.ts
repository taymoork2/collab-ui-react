class SiteActionsConfigIconDirective implements ng.IDirective {
  public template = require('./siteActionsConfigIcon.tpl.html');
  public scope = true;
  public restrict = 'E';
}

const SiteActionsConfigIconDirectiveFactory: ng.IDirectiveFactory = () => new SiteActionsConfigIconDirective();

angular.module('Core')
  .directive('crSiteActionsConfigIcon', SiteActionsConfigIconDirectiveFactory);
