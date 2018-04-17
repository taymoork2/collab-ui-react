class SiteActionsCsvIconDirective implements ng.IDirective {
  public template = require('./siteActionsCsvIcon.tpl.html');
  public scope = true;
  public restrict = 'E';
}

const SiteActionsCsvIconDirectiveFactory: ng.IDirectiveFactory = () => new SiteActionsCsvIconDirective();

angular.module('Core')
  .directive('crSiteActionsCsvIcon', SiteActionsCsvIconDirectiveFactory);
