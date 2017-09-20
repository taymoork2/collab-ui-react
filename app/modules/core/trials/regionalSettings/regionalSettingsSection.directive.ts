class TrialRegionalSettingsSectionDirective implements ng.IDirective {
  public template = require('./regionalSettingsSection.html');
  public scope = true;
  public restrict = 'E';
}

export const TrialRegionalSettingsSectionDirectiveFactory: ng.IDirectiveFactory = () => new TrialRegionalSettingsSectionDirective();
