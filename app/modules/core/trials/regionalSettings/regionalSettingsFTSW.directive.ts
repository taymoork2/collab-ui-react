class TrialRegionalSettingsFTSWDirective implements ng.IDirective {
  public template = require('./regionalSettingsFTSW.html');
  public scope = true;
  public restrict = 'E';
}

export const TrialRegionalSettingsFTSWDirectiveFactory: ng.IDirectiveFactory = () => new TrialRegionalSettingsFTSWDirective();
