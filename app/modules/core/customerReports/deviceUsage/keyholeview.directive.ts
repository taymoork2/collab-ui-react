class KeyHoleViewDirective implements ng.IDirective {
  public template = require('./keyholeview.tpl.html');
  public scope = true;
  public restrict = 'E';
}

const KeyHoleViewDirectiveFactory: ng.IDirectiveFactory = () => new KeyHoleViewDirective();

angular
  .module('Core')
  .directive('keyHoleView', KeyHoleViewDirectiveFactory);
