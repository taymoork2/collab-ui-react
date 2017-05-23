import { SettingSection } from './settingSection';

export abstract class ProPackSettingSection extends SettingSection {

  public icon: string = '';
  public tooltipText: string = '';

  constructor(settingKey: string, proPackPurchased: boolean) {
    super(settingKey);
    if (!proPackPurchased) {
      this.icon = 'icon-certified';
      this.tooltipText = 'globalSettings.' + settingKey + '.proPackInfoCopy';
    }
  }
}
