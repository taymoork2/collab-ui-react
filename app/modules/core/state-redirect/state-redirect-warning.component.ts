export class StateRedirectWarningComponent implements ng.IComponentOptions {
  public bindings = {
    l10nTitle: '@',
    l10nText: '@',
  };
  public template = require('./state-redirect-warning.html');
}
