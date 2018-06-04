export class StateRedirectCtrl implements ng.IComponentController {
  public hasPreviousState = this.PreviousState.isValid();
  public loading = false;

  /* @ngInject */
  constructor(
    private Auth,
    private PreviousState,
  ) {}

  public logout(): void {
    this.loading = true;
    this.Auth.logout();
  }

  public performRedirect(): void {
    if (this.hasPreviousState) {
      this.PreviousState.go();
    } else {
      this.logout();
    }
  }
}
