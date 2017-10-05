import { SettingSection } from '../settingSection';
import { DirSyncSettingController } from './dirSyncSetting.controller';

export class DirSyncSetting extends SettingSection {
  /* @ngInject */
  public constructor() {
    super('dirsync');
    this.subsectionLabel = '';
    this.subsectionDescription = '';
  }
}

export class DirSyncSettingComponent implements ng.IComponentOptions {
  public controller = DirSyncSettingController;
  public template = require('modules/core/settings/dirsync/dirsyncSetting.tpl.html');
}
