import { ProPackSettingSection } from '../proPackSettingSection';

import { FileSharingControlSettingController } from './fileSharingControlSetting.controller';

export class FileSharingControlSetting extends ProPackSettingSection {
  public description: string = '';
  /* @ngInject */
  public constructor(proPackPurchased: boolean) {
    super('fileSharingControl', proPackPurchased);
    this.description = 'globalSettings.fileSharingControl.description';
  }
}

export class FileSharingControlSettingComponent implements ng.IComponentOptions {
  public controller = FileSharingControlSettingController;
  public controllerAs = 'fileSharingControlCtrl';
  public templateUrl = 'modules/core/settings/fileSharingControl/fileSharingControlSetting.tpl.html';
}
