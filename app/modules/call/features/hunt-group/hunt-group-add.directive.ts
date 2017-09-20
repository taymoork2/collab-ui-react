class HuntGroupAddDirective implements ng.IDirective {
  public template = require('./hunt-group-add.html');
  public scope = true;
  public restrict = 'E';
}

export const HuntGroupAddDirectiveFactory: ng.IDirectiveFactory = () => new HuntGroupAddDirective();
