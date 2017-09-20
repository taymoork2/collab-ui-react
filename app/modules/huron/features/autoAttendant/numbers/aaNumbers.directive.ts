class AANumbersDirective implements ng.IDirective {
  public template = require('./aaNumbers.tpl.html');
  public scope = true;
  public restrict = 'E';
}

const AANumbersDirectiveFactory: ng.IDirectiveFactory = () => new AANumbersDirective();

angular
  .module('uc.autoattendant')
  .directive('aaNumbers', AANumbersDirectiveFactory);
