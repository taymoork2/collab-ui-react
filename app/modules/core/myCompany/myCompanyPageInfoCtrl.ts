namespace myCompanyPage {
  class MyCompanyPageInfoCtrl {

    private _companyName:String;
    private _partners:Array<Partner> = [];
    private _representatives:Array<Partner> = [];
    private _accountNumber:String;
    private _isPartner:boolean;
    private isManaged:boolean;
    private mockIfEmpty = true;

    get accountNumber():String {
      return this._accountNumber;
    }

    get companyName():String {
      return this._companyName;
    }

    get isPartner():boolean {
      return this._isPartner;
    }

    get partners():Array<Partner> {
      return this._partners;
    }

    get representatives():Array<Partner> {
      return this._representatives;
    }

    get showSupportContacts():boolean {
      return !_.isEmpty(this.partners) || !_.isEmpty(this.representatives);
    }

    /* @ngInject */
    constructor(Authinfo, UserListService) {
      this._companyName = Authinfo.getOrgName();
      let orgId = Authinfo.getOrgId();
      this._isPartner = Authinfo.isPartner();

      UserListService.listPartners(orgId, (data:{partners:Array<Partner>})=> {
        // _.chain(data.partners).filter((partner)=>{}).last().value();
        if (_.isEmpty(data.partners) && this.mockIfEmpty) {
          //mock data
          data.partners = [{
            userName: 'test@example.com',
            displayName: 'Jan jansen',
            name: {givenName: 'Jan', familyName: 'Jansen'}
          }, {
            userName: 'testola@example.com',
            displayName: 'Ola Nordmann',
            name: {givenName: 'Ola', familyName: 'Nordmann'}
          }, {
            userName: 'test@cisco.com',
            displayName: 'Test Testerson',
            name: {givenName: 'Test', familyName: 'Testerson'}
          }, {
            userName: 'test2@cisco.com',
            displayName: 'Testify Testerson',
            name: {givenName: 'Testify', familyName: 'Testerson'}
          }];
        }
        if (_.isEmpty(data.partners)) {
          return;
        }
        this._representatives = _.filter(data.partners, (rep)=> {
          return _.endsWith(rep.userName, '@cisco.com');
        });
        this._partners = _.filter(data.partners, (rep)=> {
          return !_.endsWith(rep.userName, '@cisco.com')
        });
        // data.partners.forEach(partner=> {
        //   let currentPartner:Partner = data.partners[partner];
        //   if (this.isPartner && currentPartner.userName.indexOf('@cisco.com') === -1) {
        //     console.log('cur', currentPartner);
        //     this._partner = currentPartner;
        //     this.isManaged = true;
        //   } else if (currentPartner.userName.indexOf('@cisco.com') > -1) {
        //     console.log('rep', currentPartner);
        //     this._representative = currentPartner;
        //     this.isManaged = true;
        //   }
        // });
      });
    }
  }

  class Partner {
    userName:string;
    displayName:string;
    name:{givenName:string,familyName:string}
  }

  angular
    .module('Core')
    .controller('MyCompanyPageInfoCtrl', MyCompanyPageInfoCtrl);
}
