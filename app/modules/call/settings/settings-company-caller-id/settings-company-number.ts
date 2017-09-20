export enum ExternalCallerIdType {
  COMPANY_CALLER_ID_TYPE = <any>'Company Caller ID',
  COMPANY_NUMBER_TYPE = <any>'Company Number',
}

export class CompanyNumber {
  public uuid: string | undefined;
  public name: string;
  public pattern?: string | undefined;
  public externalCallerIdType: ExternalCallerIdType;

  constructor(obj: {
    uuid?: string,
    name: string,
    pattern?: string,
    externalCallerIdType: ExternalCallerIdType,
  }) {
    this.uuid = obj.uuid;
    this.name = obj.name;
    this.pattern = obj.pattern;
    this.externalCallerIdType = obj.externalCallerIdType;
  }
}
