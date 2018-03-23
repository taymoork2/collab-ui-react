class HcsSetupFinishDirective implements ng.IDirective {
  public template = require('./hcs-setup-finish.html');
  public scope = true;
  public restrict = 'E';
}

export const HcsSetupFinishDirectiveFactory: ng.IDirectiveFactory = () => new HcsSetupFinishDirective();
