export class StateRedirectAction implements ng.IComponentController {
  public l10nTitle: string;
  public l10nText: string;
  public l10nButtonText?: string;
  public isWebexLayout?: boolean;

  public loading = false;

  private hasPreviousState = this.PreviousState.isValid();
  private readonly L10N_GO_BACK = 'stateRedirect.goBackButton';
  private readonly L10N_SIGN_IN = 'stateRedirect.signInButton';

  /* @ngInject */
  constructor(
    private Auth,
    private PreviousState,
  ) {}

  public get buttonTextKey(): string {
    if (this.l10nButtonText) {
      return this.l10nButtonText;
    }
    if (this.hasPreviousState) {
      return this.L10N_GO_BACK;
    }
    return this.L10N_SIGN_IN;
  }

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

export class StateRedirectActionComponent implements ng.IComponentOptions {
  public bindings = {
    l10nTitle: '@',
    l10nText: '@',
    l10nButtonText: '@?',
    isWebexLayout: '<?',
  };
  public controller = StateRedirectAction;
  public template = require('./state-redirect-action.html');
}
