export interface IHcsSubscription {
  subscriptionId: string;
  licenseType: string;
  ordered: number;
}

export class HcsSubscription implements IHcsSubscription {
  public subscriptionId: string;
  public licenseType: string;
  public ordered: number;

  constructor(obj: IHcsSubscription = {
    subscriptionId: '',
    licenseType: '',
    ordered: 0,
  }) {
    this.subscriptionId = obj.subscriptionId;
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
  subscriptions?: HcsSubscription[] | undefined | null;
  plms: HcsPlmBase[];
  licenses: HcsLicense[];
}

export class HcsCustomerLicense implements IHcsCustomerLicense {
  public partnerOrgId: string;
  public customerId: string;
  public customerOrgId?: string | null | undefined;
  public customerName: string;
  public customerGroupId?: string | null | undefined;
  public customerGroupName?: string | null | undefined;
  public subscriptions?: HcsSubscription[] | undefined | null;
  public plms: HcsPlmBase[];
  public licenses: HcsLicense[];

  constructor(obj: IHcsCustomerLicense = {
    partnerOrgId: '',
    customerId: '',
    customerName: '',
    plms: [],
    licenses: [],
  }) {
    this.partnerOrgId = obj.partnerOrgId;
    this.customerId = obj.customerId;
    this.customerOrgId = obj.customerOrgId;
    this.customerName = obj.customerName;
    this.customerGroupId = obj.customerGroupId;
    this.customerGroupName = obj.customerGroupName;
    this.subscriptions = obj.subscriptions;
    this.plms = obj.plms;
    this.licenses = obj.licenses;
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

//PLM Reports
export interface IHcsPlmLicenseInfo {
  licenseType: string;
  installed: number;
  required: number;
  productType: string;
  licenseStatus: string;
}

export class  HcsPlmLicenseInfo implements  IHcsPlmLicenseInfo {
  public licenseType: string;
  public installed: number;
  public required: number;
  public productType: string;
  public licenseStatus: string;
  constructor(obj = {
    licenseType: '',
    installed: 0,
    required: 0,
    productType: '',
    licenseStatus: '',
  }) {
    this.licenseType = obj.licenseType;
    this.installed = obj.installed;
    this.required = obj.required;
    this.productType = obj.productType;
    this.licenseType = obj.licenseType;
  }
}

export interface IHcsPlmProduct {
  productId: string;
  productName: string;
  productType: string;
  productStatus: string;
}

export class HcsPlmProduct implements IHcsPlmProduct {
  public productId: string;
  public productName: string;
  public productType: string;
  public productStatus: string;
  constructor(obj = {
    productId: '',
    productName: '',
    productType: '',
    productStatus: '',
  }) {
    this.productId = obj.productId;
    this.productName = obj.productName;
    this.productStatus = obj.productStatus;
    this.productType = obj.productType;
  }
}

export interface IHcsPlmLicense extends IHcsPlmBase {
  partnerOrgId: string;
  productCount: number;
  plmLicenses: IHcsPlmLicenseInfo[];
  products: IHcsPlmProduct[];
}

export class HcsPlmLicense implements IHcsPlmLicense {
  public partnerOrgId: string;
  public plmId: string;
  public plmName: string;
  public violationsCount: number;
  public productCount: number;
  public plmLicenses: IHcsPlmLicenseInfo[];
  public products: IHcsPlmProduct[];
  constructor(obj = {
    partnerOrgId: '',
    plmId: '',
    plmName: '',
    violationsCount: 0,
    productCount: 0,
    plmLicenses: [],
    products: [],
  }) {
    this.partnerOrgId = obj.partnerOrgId;
    this.plmId = obj.plmId;
    this.plmName = obj.plmName;
    this.violationsCount = obj.violationsCount;
    this.productCount = obj.productCount;
    this.plmLicenses = obj.plmLicenses;
    this.products = obj.products;
  }
}
