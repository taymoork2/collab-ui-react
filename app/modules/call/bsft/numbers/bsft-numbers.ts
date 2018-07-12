export interface IPhoneNumber {
  number?: string;
  country?: string;
  e164Number: string;
}

export class PhoneNumber implements IPhoneNumber {
  public number: string | undefined;
  public country: string | undefined;
  public e164Number: string;

  constructor(phoneNumber: IPhoneNumber = {
    e164Number: '',
  }) {
    this.e164Number = phoneNumber.e164Number;
  }
}
