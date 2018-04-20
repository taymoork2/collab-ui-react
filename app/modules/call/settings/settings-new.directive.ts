class SettingsNewDirective implements ng.IDirective {
  public template = require('./settings-new.html');
  public scope = true;
  public restrict = 'E';
}

export const SettingsNewDirectiveFactory: ng.IDirectiveFactory = () => new SettingsNewDirective();
