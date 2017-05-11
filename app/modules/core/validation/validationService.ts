
import { PhoneNumberUtil } from 'google-libphonenumber';

export class ValidationService {
  private phoneUtil: PhoneNumberUtil;

  /* @ngInject */
  constructor() {
    this.phoneUtil = PhoneNumberUtil.getInstance();
  }

  public nonPrintable(viewValue: string, modelValue: string): boolean {
    const value: string = modelValue || viewValue;
    return /^[^\x00-\x1F]{0,}$/.test(value);
  }

  public alertingName(viewValue: string, modelValue: string): boolean {
    const value: string = modelValue || viewValue;
    return /^[^\]"%<>[&|{}]{0,}$/.test(value);
  }

  public callForward(viewValue: string, modelValue: string): boolean {
    const value: string = modelValue || viewValue;
    return /^[0-9*#+X]{0,}$/.test(value) || /^Voicemail$/.test(value);
  }

  public numeric(viewValue: string, modelValue: string): boolean {
    const value: string = modelValue || viewValue;
    return /^\d*$/.test(value);
  }

  public positiveNumber(viewValue: number, modelValue: number): boolean {
    const value: number = modelValue || viewValue;
    return (_.isString(value) && value.length === 0) || value > 0;
  }

  public maxNumber100(viewValue: number, modelValue: number): boolean {
    const value: number = modelValue || viewValue;
    return value <= 100;
  }

  public phoneUS(viewValue: string, modelValue: string): boolean {
    return this.phoneAny(viewValue, modelValue, 'US');
  }

  public phoneAny(viewValue: string, modelValue: string, country: string): boolean {
    const value: string = modelValue || viewValue;
    try {
      if (country) {
        return this.phoneUtil.isValidNumber(this.phoneUtil.parse(value, country));
      } else {
        country = 'US';
        return this.phoneUtil.isPossibleNumber(this.phoneUtil.parse(value, country));
      }
    } catch (e) {
      return false;
    }
  }
}
