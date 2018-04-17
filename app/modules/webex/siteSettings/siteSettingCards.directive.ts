class WebExSiteSettingCardsDirective implements ng.IDirective {
  public template = require('./siteSettingCards.tpl.html');
  public scope = true;
  public restrict = 'E';
}

const WebExSiteSettingCardsDirectiveFactory: ng.IDirectiveFactory = () => new WebExSiteSettingCardsDirective();

angular.module('WebExApp')
  .directive('webexSiteSettingCards', WebExSiteSettingCardsDirectiveFactory);
