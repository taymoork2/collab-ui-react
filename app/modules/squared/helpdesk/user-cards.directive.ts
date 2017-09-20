class UserCardsDirective implements ng.IDirective {
  public template = require('./user-cards.html');
  public scope = true;
  public restrict = 'E';
}

const UserCardsDirectiveFactory: ng.IDirectiveFactory = () => new UserCardsDirective();

angular.module('Squared')
  .directive('helpDeskUserCards', UserCardsDirectiveFactory);
