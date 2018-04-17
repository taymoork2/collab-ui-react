class CallParkAddDirective implements ng.IDirective {
  public template = require('./call-park-add.html');
  public scope = true;
  public restrict = 'E';
}

export const CallParkAddDirectiveFactory: ng.IDirectiveFactory = () => new CallParkAddDirective();
