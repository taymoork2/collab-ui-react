export interface IHcsSubscription {
  id: string;
  licenseType: string;
  ordered: number;
}

export class HcsSubscription implements IHcsSubscription {
  public id: string;
  public licenseType: string;
  public ordered: number;

  constructor(obj: IHcsSubscription = {
    id: '',
    licenseType: '',
    ordered: 0,
  }) {
    this.id = obj.id;
    this.licenseType = obj.licenseType;
    this.ordered = obj.ordered;
  }
}

export interface IHcsPlmBase {
  plmId: string;
  plmName: string;
  violationsCount: number;
}

export class HcsPlmBase implements IHcsPlmBase {
  public plmId: string;
  public plmName: string;
  public violationsCount: number;

  constructor(obj: IHcsPlmBase = {
    plmId: '',
    plmName: '',
    violationsCount: 0,
  }) {
    this.plmId = obj.plmId;
    this.plmName = obj.plmName;
    this.violationsCount = obj.violationsCount;
  }
}

export interface IHcsLicense {
  licenseType: string;
  productType: string;
  required: number; //sum of usages for this license type for the products belonging to this customer.
  ordered: number;
}

export class HcsLicense implements IHcsLicense {
  public licenseType: string;
  public productType: string;
  public required: number; //sum of usages for this license type for the products belonging to this customer.
  public ordered: number; //sum of subscriptions for this license type for the customer.

  constructor(obj: IHcsLicense = {
    licenseType: '',
    productType: '',
    required: 0,
    ordered: 0,
  }) {
    this.licenseType = obj.licenseType;
    this.productType = obj.productType;
    this.required = obj.required;
    this.ordered = obj.ordered;
  }
}

export interface IHcsCustomerLicense {
  partnerOrgId: string;
  customerId: string;
  customerOrgId?: string | null | undefined;
  customerName: string;
  customerGroupId?: string | null | undefined;
  customerGroupName?: string | null | undefined;
  subscriptionList?: HcsSubscription[] | undefined | null;
  plmList: HcsPlmBase[];
  licenseList: HcsLicense[];
}

export class HcsCustomerLicense implements IHcsCustomerLicense {
  public partnerOrgId: string;
  public customerId: string;
  public customerOrgId?: string | null | undefined;
  public customerName: string;
  public customerGroupId?: string | null | undefined;
  public customerGroupName?: string | null | undefined;
  public subscriptionList?: HcsSubscription[] | undefined | null;
  public plmList: HcsPlmBase[];
  public licenseList: HcsLicense[];

  constructor(obj: IHcsCustomerLicense = {
    partnerOrgId: '',
    customerId: '',
    customerName: '',
    plmList: [],
    licenseList: [],
  }) {
    this.partnerOrgId = obj.partnerOrgId;
    this.customerId = obj.customerId;
    this.customerOrgId = obj.customerOrgId;
    this.customerName = obj.customerName;
    this.customerGroupId = obj.customerGroupId;
    this.customerGroupName = obj.customerGroupName;
    this.subscriptionList = obj.subscriptionList;
    this.plmList = obj.plmList;
    this.licenseList = obj.licenseList;
  }
}
export interface IHcsCustomerReport {
  customerName: string;
  subscriptionId: string;
  standard: IHcsLicense;
  foundation: IHcsLicense;
  basic: IHcsLicense;
  telepresence: IHcsLicense;
  essential: IHcsLicense;
  status: string;
}


export class HcsCustomerReport implements IHcsCustomerReport {
  public customerName: string;
  public subscriptionId: string;
  public standard: IHcsLicense;
  public foundation: IHcsLicense;
  public basic: IHcsLicense;
  public telepresence: IHcsLicense;
  public essential: IHcsLicense;
  public status: string;

  constructor(obj: IHcsCustomerReport = {
    customerName: '',
    subscriptionId: '',
    standard: new HcsLicense(),
    foundation: new HcsLicense(),
    basic: new HcsLicense(),
    telepresence: new HcsLicense(),
    essential: new HcsLicense(),
    status: '',
  }) {
    this.customerName = obj.customerName;
    this.subscriptionId = obj.subscriptionId;
    this.standard = obj.standard;
    this.foundation = obj.foundation;
    this.basic = obj.basic;
    this.telepresence = obj.telepresence;
    this.essential = obj.essential;
    this.status = obj.status;
  }
}
