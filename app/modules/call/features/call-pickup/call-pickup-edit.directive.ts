class CallPickupEditDirective implements ng.IDirective {
  public template = require('./call-pickup-edit.html');
  public scope = true;
  public restrict = 'E';
}

export const CallPickupEditDirectiveFactory: ng.IDirectiveFactory = () => new CallPickupEditDirective();
