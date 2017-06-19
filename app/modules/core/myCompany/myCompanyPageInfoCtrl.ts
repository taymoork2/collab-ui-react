class MyCompanyPageInfoCtrl {

  private _companyName: String;
  private _partners: Partner[] = [];
  private _representatives: Partner[] = [];
  private _accountNumber: String;
  private _isPartner: boolean;

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

  /* @ngInject */
  constructor(Authinfo, UserListService) {
    this._companyName = Authinfo.getOrgName();
    const orgId = Authinfo.getOrgId();
    this._accountNumber = orgId;
    this._isPartner = Authinfo.isPartner();

    UserListService.listPartners(orgId, (data: { partners: Partner[] }) => {
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
}

class Partner {
  public userName: string;
  public displayName: string;
  public name: { givenName: string, familyName: string };
}

angular
  .module('Core')
  .controller('MyCompanyPageInfoCtrl', MyCompanyPageInfoCtrl);
