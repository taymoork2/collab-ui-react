class CallPickupAddDirective implements ng.IDirective {
  public template = require('./call-pickup-add.html');
  public scope = true;
  public restrict = 'E';
}

export const CallPickupAddDirectiveFactory: ng.IDirectiveFactory = () => new CallPickupAddDirective();
