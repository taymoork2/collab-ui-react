
import { PrivacySettingController } from './privacy.settings.controller';

export class CrashReportSettingComponent implements ng.IComponentOptions {
  public controller = PrivacySettingController;
  public controllerAs = 'vm';
  public templateUrl = 'modules/core/settings/privacySection/crashReport.tpl.html';
}
