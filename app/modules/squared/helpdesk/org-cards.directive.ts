class OrgCardsDirective implements ng.IDirective {
  public template = require('./org-cards.html');
  public scope = true;
  public restrict = 'E';
}

const OrgCardsDirectiveFactory: ng.IDirectiveFactory = () => new OrgCardsDirective();

angular.module('Squared')
  .directive('helpDeskOrgCards', OrgCardsDirectiveFactory);
