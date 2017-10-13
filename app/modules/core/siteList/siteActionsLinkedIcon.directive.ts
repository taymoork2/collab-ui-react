class SiteActionsLinkedIconDirective implements ng.IDirective {
  public template = require('./siteActionsLinkedIcon.tpl.html');
  public scope = true;
  public restrict = 'E';
}

const SiteActionsLinkedIconDirectiveFactory: ng.IDirectiveFactory = () => new SiteActionsLinkedIconDirective();

angular.module('Core')
  .directive('crSiteActionsLinkedIcon', SiteActionsLinkedIconDirectiveFactory);
