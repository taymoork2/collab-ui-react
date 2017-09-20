class SettingsEditDirective implements ng.IDirective {
  public template = require('./settings-edit.html');
  public scope = true;
  public restrict = 'E';
}

export const SettingsEditDirectiveFactory: ng.IDirectiveFactory = () => new SettingsEditDirective();
