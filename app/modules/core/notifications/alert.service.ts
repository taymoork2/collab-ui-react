export class AlertService {
  private alertDefer: ng.IDeferred<any>;
  private alertMessage: string;

  /* @ngInject */
  constructor() {}

  public setDeferred(deferred) {
    this.alertDefer = deferred;
  }

  public getDeferred() {
    return this.alertDefer;
  }

  public setMessage(message) {
    this.alertMessage = message;
  }

  public getMessage() {
    return this.alertMessage;
  }
}
