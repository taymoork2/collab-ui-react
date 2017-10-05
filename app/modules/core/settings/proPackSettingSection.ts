import { SettingSection } from './settingSection';

export abstract class ProPackSettingSection extends SettingSection {

  public badge: string = '';
  public tooltipText: string = '';

  constructor(settingKey: string, proPackPurchased: boolean) {
    super(settingKey);
    if (!proPackPurchased) {
      this.badge = 'badge--outline';
      this.tooltipText = 'common.proPackTooltip';
    }
  }
}
