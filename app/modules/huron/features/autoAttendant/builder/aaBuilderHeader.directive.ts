class AABuilderHeaderDirective implements ng.IDirective {
  public template = require('./aaBuilderHeader.tpl.html');
  public scope = true;
  public restrict = 'E';
}

const AABuilderHeaderDirectiveFactory: ng.IDirectiveFactory = () => new AABuilderHeaderDirective();

angular
  .module('uc.autoattendant')
  .directive('aaBuilderHeader', AABuilderHeaderDirectiveFactory);
