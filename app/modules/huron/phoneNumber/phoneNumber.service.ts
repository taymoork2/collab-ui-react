import { PhoneNumberUtil, PhoneNumberType, PhoneNumber, PhoneNumberFormat } from 'google-libphonenumber';


export interface IREmergencyNumber {
  uuid?: string;
  name: string;
  pattern: string;
  default: boolean;
}

export interface IREmergencyNumberData {
  url: string;
  emergencyNumbers: IREmergencyNumber[];
}

export class EmergencyNumber implements IREmergencyNumber {
  public uuid?: string;
  public name: string;
  public pattern: string;
  public default: boolean;

  constructor(emergencyNumber: IREmergencyNumber = {
    name: '',
    pattern: '',
    default: false,
  }) {
    this.uuid = emergencyNumber.uuid;
    this.name = emergencyNumber.name;
    this.pattern = emergencyNumber.pattern;
    this.default = emergencyNumber.default;
  }

  public getREmergencyNumber(): IREmergencyNumber {
    return {
      name: this.name,
      pattern: this.pattern,
      default: this.default,
    };
  }
}

export interface ICallDestination {
  name?: string;
  code?: string;
  number?: string;
  phoneNumber: string;
}

export interface IRDirectoryNumber {
  url: string;
  uuid: string;
}

export interface IRCallPhoneNumber {
  uuid: string | null;
  url: string | null;
  type: string | null;
  directoryNumber: IRDirectoryNumber | null;
  assigned: boolean | null;
  internal: string | null;
  external: string | null;
  siteToSite: string | null;
  locationUuid: string | null;
}

export interface IRCallPhoneNumberData {
  numbers: IRCallPhoneNumber[];
}

export class CallPhoneNumber implements IRCallPhoneNumber {
  public uuid: string | null;
  public url: string | null;
  public type: string | null;
  public directoryNumber: IRDirectoryNumber | null;
  public assigned: boolean | null;
  public internal: string | null;
  public external: string | null;
  public siteToSite: string | null;
  public locationUuid: string | null;
  public externalLabel: string = '';

  constructor(rPhoneNumber: IRCallPhoneNumber = {
    uuid: null,
    url: null,
    type: null,
    directoryNumber: null,
    assigned: null,
    internal: null,
    external: null,
    siteToSite: null,
    locationUuid: null,
  }) {
    this.assigned = rPhoneNumber.assigned;
    this.directoryNumber = rPhoneNumber.directoryNumber;
    this.external = rPhoneNumber.external;
    this.internal = rPhoneNumber.internal;
    this.locationUuid = rPhoneNumber.locationUuid;
    this.siteToSite = rPhoneNumber.siteToSite;
    this.type = rPhoneNumber.type;
    this.url = rPhoneNumber.url;
    this.uuid = rPhoneNumber.uuid;
    this.externalLabel = this.makeExternalLabel(this.external);
  }

  public makeExternalLabel(external: string | null): string {
    if (_.isString(external)) {
      //strip invalid characters
      const number: string = external.replace(/[^\d+]/g, '');
      return (new PhoneNumberService()).getNationalFormat(number);
    }
    return '';
  }
}


/**
 * Class containing helper functions for validating and formatting phone numbers.
 * Uses https://github.com/googlei18n/libphonenumber library to accomplish this.
 *
 * @export
 * @class PhoneNumberService
 */
export class PhoneNumberService {
  private phoneUtil: PhoneNumberUtil;
  private filterRegex = /[^+\d]/g;
  private readonly REGION_CODE_BLANK: string = '';
  private readonly REGION_CODE_US: string = 'us';
  private readonly REGION_CODE_CANADA: string = 'CA';
  private readonly exampleNumbers = {
    us: '15556667777, +15556667777, 1-555-666-7777, +1 (555) 666-7777',
    au: '61255566777, +61255566777, +61 2 5556 6777',
  };

  /* @ngInject */
  constructor() {
    this.phoneUtil = PhoneNumberUtil.getInstance();
  }

  /**
   * Returns phone number type as defined in https://github.com/googlei18n/libphonenumber.
   * FIXED_LINE: 0
   * MOBILE: 1
   * FIXED_LINE_OR_MOBILE: 2
   * TOLL_FREE: 3,
   * PREMIUM_RATE: 4,
   * SHARED_COST: 5,
   * VOIP: 6,
   * PERSONAL_NUMBER: 7,
   * PAGER: 8,
   * UAN: 9,
   * VOICEMAIL: 10,
   * UNKNOWN: -1
   *
   * @param {string} e164Number
   * @returns {PhoneNumberType}
   *
   * @memberOf PhoneNumberService
   */
  public getPhoneNumberType(e164Number: string): PhoneNumberType {
    try {
      const parsedNumber: PhoneNumber = this.phoneUtil.parseAndKeepRawInput(e164Number, this.REGION_CODE_BLANK);
      return this.phoneUtil.getNumberType(parsedNumber);
    } catch (e) {
      return PhoneNumberType.UNKNOWN;
    }
  }

  /**
   * Given a valid E.164 number, will return
   * number in national format based on the country code
   * of the E.164 format.
   *
   * @param {string} e164Number
   * @returns {string} National format of phone number
   *
   * @memberOf PhoneNumberService
   */
  public getNationalFormat(e164Number: string): string {
    try {
      const parsedNumber: PhoneNumber = this.phoneUtil.parseAndKeepRawInput(e164Number, this.REGION_CODE_BLANK);
      return this.phoneUtil.format(parsedNumber, PhoneNumberFormat.NATIONAL);
    } catch (e) {
      return e164Number;
    }
  }

  /**
   * Given a number and region code, will return e164 format of number passed in.
   * If regionCode is not passed in, it defaults to 'us'.  If parsing of the number fails,
   * the original value passed in will be returned with all other characters besides
   * numbers and '+' stripped out.
   *
   * @param {string} number
   * @param {string} [regionCode]
   * @returns {string}
   *
   * @memberOf PhoneNumberService
   */
  public getE164Format(number: string, regionCode?: string): string {
    try {
      const parsedNumber: PhoneNumber = this.phoneUtil.parseAndKeepRawInput(number, regionCode || this.REGION_CODE_US);
      return this.phoneUtil.format(parsedNumber, PhoneNumberFormat.E164);
    } catch (e) {
      if (_.isString(number)) {
        return _.replace(number, this.filterRegex, '');
      } else {
        return number;
      }
    }
  }

  /**
   * Validates number passed in.  If regionCode is not supplied, 'us' is used.
   *
   * @param {string} number
   * @param {string} [regionCode]
   * @returns {boolean}
   *
   * @memberOf PhoneNumberService
   */
  public validateDID(number: string, regionCode?: string): boolean {
    try {
      const parsedNumber: PhoneNumber = this.phoneUtil.parseAndKeepRawInput(number, regionCode || this.REGION_CODE_US);
      if (this.phoneUtil.isValidNumber(parsedNumber)) {
        const phoneNumberType = this.phoneUtil.getNumberType(parsedNumber);
        switch (phoneNumberType) {
          case PhoneNumberType.PERSONAL_NUMBER:
            return false;
          case PhoneNumberType.TOLL_FREE:
          default:
            return true;
        }
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  /**
   * Checks if e164Number is toll free.
   *
   * @param {string} e164Number
   * @returns {boolean}
   *
   * @memberOf PhoneNumberService
   */
  public isTollFreeNumber(e164Number: string): boolean {
    try {
      const parsedNumber: PhoneNumber = this.phoneUtil.parseAndKeepRawInput(e164Number, this.REGION_CODE_BLANK);
      const numberType: PhoneNumberType = this.phoneUtil.getNumberType(parsedNumber);
      return numberType === PhoneNumberType.TOLL_FREE;
    } catch (e) {
      return false;
    }
  }

  /**
   * Checks if the number is valid for the region specified by the
   * country code in the e164Number passed in.
   *
   * @param {string} e164Number
   * @returns {boolean}
   *
   * @memberOf PhoneNumberService
   */
  public internationalNumberValidator(e164Number: string): boolean {
    try {
      const parsedNumber: PhoneNumber = this.phoneUtil.parseAndKeepRawInput(e164Number, this.REGION_CODE_BLANK);
      return this.phoneUtil.isValidNumberForRegion(parsedNumber, this.phoneUtil.getRegionCodeForNumber(parsedNumber));
    } catch (e) {
      return false;
    }
  }

  /**
   * Checks if the number is only US/Canada number
   *
   * @param {string} e164Number
   * @returns {boolean}
   *
   * @memberOf PhoneNumberService
   */
  public numberNANPValidator(e164Number: string): boolean {
    try {
      const parsedNumber: PhoneNumber = this.phoneUtil.parseAndKeepRawInput(e164Number, this.REGION_CODE_BLANK);
      return (this.phoneUtil.getRegionCodeForNumber(parsedNumber) === _.upperCase(this.REGION_CODE_US) || this.phoneUtil.getRegionCodeForNumber(parsedNumber) === this.REGION_CODE_CANADA);
    } catch (e) {
      return false;
    }
  }

  public getExampleNumbers(regionCode: string): string[] {
    return this.exampleNumbers[regionCode];
  }

  /**
   * Checks if area code passed in is valid for region code.
   *
   * NOTE: This method currently only works with 'us' and 'au' regions.
   * In the future 'au' will be removed and this will only validate area codes
   * for the US.
   *
   * @param {string} areaCode
   * @param {string} regionCode
   * @returns
   *
   * @memberOf PhoneNumberService
   */
  public isPossibleAreaCode(areaCode: string, regionCode: string) {
    // TODO (jlowery): When i751-10d-ext feature toggle is removed,
    // this method will change to only validate area codes for US based numbers.
    try {
      if (regionCode === 'us') {
        const parsedNumber: PhoneNumber = this.phoneUtil.parseAndKeepRawInput(areaCode + '0000000', regionCode);
        return this.phoneUtil.isPossibleNumber(parsedNumber);
      } else if (regionCode === 'au') {
        const parsedNumber: PhoneNumber = this.phoneUtil.parseAndKeepRawInput(areaCode + '00000000', regionCode);
        // have to test both possible and valid for au.
        return this.phoneUtil.isPossibleNumber(parsedNumber) && this.phoneUtil.isValidNumber(parsedNumber);
      } else {
        return true;
      }
    } catch (e) {
      return false;
    }
  }

}
