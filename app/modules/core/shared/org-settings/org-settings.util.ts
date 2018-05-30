import { FileShareControlType, IFileShareControlOptions } from './org-settings.types';

export class OrgSettingsUtil {
  public static mkFileShareControl(settings: IFileShareControlOptions = {}) {
    return {
      desktopFileShareControl: _.get(settings, 'desktopFileShareControl', FileShareControlType.NONE),
      mobileFileShareControl: _.get(settings, 'mobileFileShareControl', FileShareControlType.NONE),
      webFileShareControl: _.get(settings, 'webFileShareControl', FileShareControlType.NONE),
      botFileShareControl: _.get(settings, 'botFileShareControl', FileShareControlType.NONE),
    };
  }
}
