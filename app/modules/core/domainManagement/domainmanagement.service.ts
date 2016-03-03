class DomainManagementService {

  private _domainList = [];

  private _enforceUsersInVerifiedAndClaimedDomains;

  private _states = {
    pending: 'pending',
    verified: 'verified',
    claimed: 'claimed'
  };

  private _scomUrl;
  private _invokeGetTokenUrl;
  private _invokeUnverifyDomainUrl;
  private _invokeVerifyDomainUrl;
  private _claimDomainUrl;

  constructor(private $http, Config, Authinfo, private $q, private Log, private XhrNotificationService, private $translate) {

    // var _verifiedDomainsUrl = Config.getDomainManagementUrl(Authinfo.getOrgId()) + "Domain";  //not used anymore?

    let orgId = Authinfo.getOrgId();

    this._scomUrl = Config.getScomUrl() + '/' + orgId;

    //POST https://identity.webex.com/organization/{orgid}/v1/actions/DomainVerification/GetToken/invoke HTTP 1.1
    this._invokeGetTokenUrl = Config.getDomainManagementUrl(orgId) + 'actions/DomainVerification/GetToken/invoke';

    //Unverify: http://wikicentral.cisco.com/display/IDENTITY/API+-+UnVerify+Domain+Ownership
    //POST https://identity.webex.com/organization/{orgid}/v1/actions/DomainVerification/Unverify/invoke
    this._invokeUnverifyDomainUrl = Config.getDomainManagementUrl(orgId) + 'actions/DomainVerification/Unverify/invoke';


    //Verify: http://wikicentral.cisco.com/display/IDENTITY/API+-+Verify+Domain+Ownership
    this._invokeVerifyDomainUrl = Config.getDomainManagementUrl(orgId) + 'actions/DomainVerification/Verify/invoke';

    //Delete: (domain base64 enc) http://wikicentral.cisco.com/display/IDENTITY/Domain+Management+API+-+Delete+Domain
    //Claim: http://wikicentral.cisco.com/display/IDENTITY/Domain+management+API+-+Add+Domain
    //DELETE https://<server name>/organization/{orgId}/v1/Domains/<domainValue>
    this._claimDomainUrl = Config.getDomainManagementUrl(orgId) + 'Domains';

  }

  private getErrorMessage(errObject) {
    return this.XhrNotificationService.getMessages([errObject])[0];
  }

  get states() {
    return this._states;
  }

  public get domainList() {
    return this._domainList;
  }

  public get enforceUsersInVerifiedAndClaimedDomains() {
    return this._enforceUsersInVerifiedAndClaimedDomains;
  }

  public addDomain(domainToAdd) {

    //we always normalize to lowercase.
    domainToAdd = domainToAdd ? domainToAdd.toLowerCase() : domainToAdd;

    let existingDomain = _.find(this._domainList, {text: domainToAdd});

    if ((!domainToAdd) || existingDomain) {
      return this.$q.reject(this.$translate.instant('domainManagement.add.invalidDomainAdded'));
    }

    return this.getToken(domainToAdd);
  }

  public unverifyDomain(domain) {
    if (!domain) {
      this.$q.reject();
    }

    let existingDomain = _.find(this._domainList, {text: domain});
    let requestData = {
      domain: domain,
      removePending: (existingDomain && existingDomain.status == this._states.pending)
    };

    return this.$http.post(this._invokeUnverifyDomainUrl, requestData).then(res => {
      _.remove(this._domainList, {text: domain});
    }, err => {
      this.Log.error('Failed to unverify domain:' + domain, err);
      this.$q.reject(this.getErrorMessage(err));
    });
  }

  public verifyDomain(domain) {
    //let deferred = this.$q.defer();

    if (!domain) {
      this.Log.error('attempt to delete a domain not in list:' + domain);
      this.$q.reject();
    }
    return this.$http.post(this._invokeVerifyDomainUrl, {
        "domain": domain,
        "claimDomain": false
      })
      .then(res => {
        let domainInList = _.find(this._domainList, {text: domain, status: this.states.pending});
        if (domainInList)
          domainInList.status = this.states.verified;
      }, err => {
        this.Log.error('Failed to verify domain:' + domain, err);
        this.$q.reject(this.getErrorMessage(err));
      });
  }

  public claimDomain(domain) {
    //let deferred = this.$q.defer();
    if (!domain) {
      this.$q.reject();
    }
    return this.$http.post(this._claimDomainUrl, {
        data: [{'domain': domain}]
      })
      .then(res => {

        let claimedDomain = _.find(this._domainList, {text: domain, status: this.states.verified});

        if (claimedDomain)
          claimedDomain.status = this.states.claimed;

      }, err => {
        this.Log.error('Failed to claim domain:' + domain, err);
        this.$q.reject(this.getErrorMessage(err));
      });
  }

  public unclaimDomain(domain) {
    if (!domain) {
      return this.$q.reject();
    }
    return this.$http.delete(this._claimDomainUrl + '/' + window.btoa(domain)).then(() => {

      let claimedDomain = _.find(this._domainList, {text: domain, status: this.states.claimed});

      if (claimedDomain)
        claimedDomain.status = this.states.verified;

    }, err => {
      this.Log.error('Failed to unclaim domain:' + domain, err);
      this.$q.reject(this.getErrorMessage(err));
    });
  }

  public getVerifiedDomains(disableCache) {
    //let deferred = this.$q.defer();
    let scomUrl = this._scomUrl + (disableCache ? '?disableCache=true' : '');

    return this.$http.get(scomUrl).then(res => {
      let data = res.data;
      this._domainList = [];

      this.loadDomainlist(data.domains, this.states.claimed, overrideIf => (overrideIf.status != this.states.claimed));

      this.loadDomainlist(data.verifiedDomains, this.states.verified, overrideIf => (overrideIf.status == this.states.pending));

      this.loadDomainlist(data.pendingDomains, this.states.pending, null);

      this._enforceUsersInVerifiedAndClaimedDomains = data.enforceVerifiedDomains;

      return this.$q.resolve(this._domainList);
    }, err => {
      return this.$q.reject(this.getErrorMessage(err));
    });
  }

  public getToken(domain) {
    return this.$http.post(this._invokeGetTokenUrl, {
      'domain': domain
    }).then(res => {

      let pendingDomain = _.find(this._domainList, {text: domain, status: this.states.pending});

      if (!pendingDomain) {
        this._domainList.push({
          text: domain,
          token: res.data.token,
          status: this.states.pending
        });
      } else {
        pendingDomain.token = res.data.token;
      }
      this.$q.resolve(res.data.token);
    }, err => {
      this.$q.reject(this.getErrorMessage(err));
    });
  }

  private loadDomainlist(domainArray, domainStatus, overridePredicate) {

    _.each(domainArray, dom => {

      let domLower = dom.toLowerCase();
      let alreadyAddedMatch = _.find(this._domainList, {text: domLower});

      if (!alreadyAddedMatch || (overridePredicate && overridePredicate(alreadyAddedMatch))) {

        if (alreadyAddedMatch)
          _.remove(this._domainList, {text: domLower});

        this._domainList.push({
          text: domLower,
          token: '',
          status: domainStatus
        });
      }
    });
  }
}
angular.module('Core')
  .service('DomainManagementService', DomainManagementService);
