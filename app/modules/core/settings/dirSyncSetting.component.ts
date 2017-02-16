import { SettingSection } from './settingSection';
import { DirSyncSettingController } from './dirsync/dirSyncSetting.controller';

export class DirSyncSetting extends SettingSection {
  /* @ngInject */
  public constructor() {
    super('dirsync');
    this.subsectionLabel = '';    // dont display a subsection label
  }
}

export class DirSyncSettingComponent implements ng.IComponentOptions {
  public controller = DirSyncSettingController;
  public templateUrl = 'modules/core/settings/dirsync/dirsyncSetting.tpl.html';
}

/////////////////////

export default angular.module('Core')
  .component('dirsyncSetting', new DirSyncSettingComponent())
  .name;
