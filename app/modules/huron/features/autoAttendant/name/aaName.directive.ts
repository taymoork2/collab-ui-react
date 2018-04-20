class AANameDirective implements ng.IDirective {
  public template = require('./aaName.tpl.html');
  public scope = true;
  public restrict = 'E';
}

const AANameDirectiveFactory: ng.IDirectiveFactory = () => new AANameDirective();

angular
  .module('uc.autoattendant')
  .directive('aaName', AANameDirectiveFactory);
