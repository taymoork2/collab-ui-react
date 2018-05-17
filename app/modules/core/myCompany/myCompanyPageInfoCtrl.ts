import { OrganizationDeleteService } from 'modules/core/organizations/organization-delete/organization-delete.service';

class MyCompanyPageInfoCtrl {

  private _companyName: String;
  private _partners: Partner[] = [];
  private _representatives: Partner[] = [];
  private _accountNumber: String;
  private _isPartner: boolean;
  private _showDeleteOrg: boolean;

  get accountNumber(): String {
    return this._accountNumber;
  }

  get companyName(): String {
    return this._companyName;
  }

  get isPartner(): boolean {
    return this._isPartner;
  }

  get partners(): Partner[] {
    return this._partners;
  }

  get representatives(): Partner[] {
    return this._representatives;
  }

  get showSupportContacts(): boolean {
    return false; //!_.isEmpty(this.partners) || !_.isEmpty(this.representatives);
  }

  get showDeleteOrg(): boolean {
    return this._showDeleteOrg;
  }

  /* @ngInject */
  constructor(
    private Authinfo,
    private OrganizationDeleteService: OrganizationDeleteService,
    private UserListService,
  ) {
    this._companyName = this.Authinfo.getOrgName();
    const orgId = this.Authinfo.getOrgId();
    this._accountNumber = orgId;
    this._isPartner = this.Authinfo.isPartner();

    this.OrganizationDeleteService.canOnlineOrgBeDeleted()
    .then((result) => {
      this._showDeleteOrg = result;
    });

    this.UserListService.listPartners(orgId, (data: { partners: Partner[] }) => {
      if (_.isEmpty(data.partners)) {
        return;
      }
      this._representatives = _.filter(data.partners, (rep) => {
        return _.endsWith(rep.userName, '@cisco.com');
      });
      this._partners = _.filter(data.partners, (rep) => {
        return !_.endsWith(rep.userName, '@cisco.com');
      });
    });
  }

  public deleteOrg(): void {
    this.OrganizationDeleteService.openOrgDeleteModal('organizationDeleteModal.title.deleteAccount');
  }
}

class Partner {
  public userName: string;
  public displayName: string;
  public name: { givenName: string, familyName: string };
}

angular
  .module('Core')
  .controller('MyCompanyPageInfoCtrl', MyCompanyPageInfoCtrl);
