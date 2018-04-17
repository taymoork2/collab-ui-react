class CallParkEditDirective implements ng.IDirective {
  public template = require('./call-park-edit.html');
  public scope = true;
  public restrict = 'E';
}

export const CallParkEditDirectiveFactory: ng.IDirectiveFactory = () => new CallParkEditDirective();
