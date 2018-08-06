export enum EnumCountryCode {
 US = '1',
}
export interface IPhoneNumber {
  number?: string;
  countryCode?: string;
  e164: string;
}

export class PhoneNumber implements IPhoneNumber {
  public number: string | undefined;
  public countryCode: string | undefined;
  public e164: string;

  constructor(phoneNumber: IPhoneNumber = {
    e164: '',
  }) {
    this.e164 = phoneNumber.e164;
  }
}
