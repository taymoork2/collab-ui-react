export interface IPhoneNumber {
  number?: string;
  countryCode?: string;
  e164Number: string;
}

export class PhoneNumber implements IPhoneNumber {
  public number: string | undefined;
  public countryCode: string | undefined;
  public e164Number: string;

  constructor(phoneNumber: IPhoneNumber = {
    e164Number: '',
  }) {
    this.e164Number = phoneNumber.e164Number;
  }
}
