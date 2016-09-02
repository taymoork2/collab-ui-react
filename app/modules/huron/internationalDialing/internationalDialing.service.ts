export const INT_DIAL_CHANGE = 'INT_DIAL_CHANGE';

export interface IOption {
  label: string;
  value: string;
}

export class InternationalDialingService {
  public cbUseGlobal: IOption;
  public cbAlwaysAllow: IOption;
  public cbNeverAllow: IOption;
  private internationalDialing;
  constructor(private $translate) {
    this.cbUseGlobal = {
      label: $translate.instant('internationalDialingPanel.useGlobal'),
      value: '-1'
    };
    this.cbAlwaysAllow = {
      label: $translate.instant('internationalDialingPanel.alwaysAllow'),
      value: '1'
    };
    this.cbNeverAllow = {
      label: $translate.instant('internationalDialingPanel.neverAllow'),
      value: '0'
    };
    this.internationalDialing = this.cbUseGlobal;
  }
  public getInternationalDialing() {
    return this.internationalDialing;
  }

  public setInternationalDialing(item) {
    this.internationalDialing = item;
  }
}
