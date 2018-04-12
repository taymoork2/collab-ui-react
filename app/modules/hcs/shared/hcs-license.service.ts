import { IHcsCustomerLicense, IHcsPlmLicense } from './hcs-license';

interface IHcsCustomerLicenseResource extends ng.resource.IResourceClass<ng.resource.IResource<IHcsCustomerLicense>> {
}

interface IHcsPlmLicenseResource extends ng.resource.IResourceClass<ng.resource.IResource<IHcsPlmLicense>> {
}

export class HcsLicenseService {
  private hcsCustomerLicenseResource: IHcsCustomerLicenseResource;
  private hcsPlmLicenseResource: IHcsPlmLicenseResource;
  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private UrlConfig,
  ) {
    const BASE_URL = this.UrlConfig.getHcsLicenseServiceUrl();
    this.hcsCustomerLicenseResource = <IHcsCustomerLicenseResource>this.$resource(BASE_URL + 'reports/organizations/:partnerId/customers/:customerId', {});
    this.hcsPlmLicenseResource = <IHcsPlmLicenseResource>this.$resource(BASE_URL + 'reports/organizations/:partnerId/plms/:plmId', {});
  }

  public getCustomerLicenseReport(customerId: string): ng.IPromise<IHcsCustomerLicense> {
    return this.hcsCustomerLicenseResource.get({
      partnerId: this.Authinfo.getOrgId(),
      customerId: customerId,
    }).$promise;
  }

  public listCustomerLicenseReports(): ng.IPromise<any[]> {
    return this.hcsCustomerLicenseResource.query({
      partnerId: this.Authinfo.getOrgId(),
    }).$promise;
  }

  public getPlmLicenseReport(plmId: string): ng.IPromise<IHcsPlmLicense> {
    return this.hcsPlmLicenseResource.get({
      partnerId: this.Authinfo.getOrgId(),
      plmId: plmId,
    }).$promise;
  }

  public listPlmLicenseReports(): ng.IPromise<any[]> {
    return this.hcsPlmLicenseResource.query({
      partnerId: this.Authinfo.getOrgId(),
    }).$promise;
  }
}
