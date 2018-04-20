export interface ICallDestinationTranslate {
  numberFormat: string;
  internal: string;
  external: string;
  uri: string;
  custom: string;
  internalPlaceholder: string;
  internalHelpText: string;
  externalHelpText: string;
  uriPlaceholder: string;
  customPlaceholder: string;
  customHelpText: string;
  alternateCustomPlaceholder: string;
  alternateCustomHelpText: string;
  callDestinationInvalidFormat: string;
  commonInvalidRequired: string;
}

export class CallDestinationTranslateObject implements ICallDestinationTranslate {
  public numberFormat: string;
  public internal: string;
  public external: string;
  public uri: string;
  public custom: string;
  public internalPlaceholder: string;
  public internalHelpText: string;
  public externalHelpText: string;
  public uriPlaceholder: string;
  public customPlaceholder: string;
  public customHelpText: string;
  public alternateCustomPlaceholder: string;
  public alternateCustomHelpText: string;
  public callDestinationInvalidFormat: string;
  public commonInvalidRequired: string;
  constructor(
    callDestinationTranslate: ICallDestinationTranslate = {
      numberFormat: '',
      internal: '',
      external: '',
      uri: '',
      custom: '',
      internalPlaceholder: '',
      internalHelpText: '',
      externalHelpText: '',
      uriPlaceholder: '',
      customPlaceholder: '',
      customHelpText: '',
      alternateCustomPlaceholder: '',
      alternateCustomHelpText: '',
      callDestinationInvalidFormat: '',
      commonInvalidRequired: '',
    }) {
    this.numberFormat = callDestinationTranslate.numberFormat;
    this.internal = callDestinationTranslate.internal;
    this.external = callDestinationTranslate.external;
    this.uri = callDestinationTranslate.uri;
    this.custom = callDestinationTranslate.custom;
    this.internalPlaceholder = callDestinationTranslate.internalPlaceholder;
    this.internalHelpText = callDestinationTranslate.internalHelpText;
    this.externalHelpText = callDestinationTranslate.externalHelpText;
    this.uriPlaceholder = callDestinationTranslate.uriPlaceholder;
    this.customPlaceholder = callDestinationTranslate.customPlaceholder;
    this.customHelpText = callDestinationTranslate.customHelpText;
    this.alternateCustomPlaceholder = callDestinationTranslate.alternateCustomPlaceholder;
    this.alternateCustomHelpText = callDestinationTranslate.alternateCustomHelpText;
    this.callDestinationInvalidFormat = callDestinationTranslate.callDestinationInvalidFormat;
    this.commonInvalidRequired = callDestinationTranslate.commonInvalidRequired;
  }
}
