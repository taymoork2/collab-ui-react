class HuntGroupEditDirective implements ng.IDirective {
  public template = require('./hunt-group-edit.html');
  public scope = true;
  public restrict = 'E';
}

export const HuntGroupEditDirectiveFactory: ng.IDirectiveFactory = () => new HuntGroupEditDirective();
