import { Notification } from 'modules/core/notifications';

export class DomainManagementService {

  private _domainList: {
    text: string,
    token: string,
    status: string,
  }[] = [];

  private _domainListLoaded: boolean = false;

  private _enforceUsersInVerifiedAndClaimedDomains: boolean;

  private _states = {
    pending: 'pending',
    verified: 'verified',
    claimed: 'claimed',
  };

  private _scomUrl;
  private _invokeGetTokenUrl;
  private _invokeUnverifyDomainUrl;
  private _invokeVerifyDomainUrl;
  private _claimDomainUrl;
  private _sunlightConfigUrl;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private Log,
    private UrlConfig,
    private Notification: Notification,
  ) {

    const orgId = this.Authinfo.getOrgId();

    this._scomUrl = this.UrlConfig.getScomUrl() + '/' + orgId;

    //POST https://identity.webex.com/organization/<orgid>/v1/actions/DomainVerification/GetToken/invoke HTTP 1.1
    this._invokeGetTokenUrl = this.UrlConfig.getDomainManagementUrl(orgId) + 'actions/DomainVerification/GetToken/invoke';

    //Unverify: http://wikicentral.cisco.com/display/IDENTITY/API+-+UnVerify+Domain+Ownership
    //POST https://identity.webex.com/organization/<orgid>/v1/actions/DomainVerification/Unverify/invoke
    this._invokeUnverifyDomainUrl = this.UrlConfig.getDomainManagementUrl(orgId) + 'actions/DomainVerification/Unverify/invoke';

    //Verify: http://wikicentral.cisco.com/display/IDENTITY/API+-+Verify+Domain+Ownership
    this._invokeVerifyDomainUrl = this.UrlConfig.getDomainManagementUrl(orgId) + 'actions/DomainVerification/Verify/invoke';

    //Delete: (domain base64 enc) http://wikicentral.cisco.com/display/IDENTITY/Domain+Management+API+-+Delete+Domain
    //Claim: http://wikicentral.cisco.com/display/IDENTITY/Domain+management+API+-+Add+Domain
    //DELETE https://<server name>/organization/<orgId>/v1/Domains/<domainValue>
    this._claimDomainUrl = this.UrlConfig.getDomainManagementUrl(orgId) + 'Domains';
    this._sunlightConfigUrl = this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/chat';

  }

  private getErrorMessage(errObject) {
    return this.Notification.processErrorResponse(errObject);
  }

  get states() {
    return this._states;
  }

  public get domainList(): {
    text: string,
    token: string,
    status: string,
  }[] {
    return this._domainList;
  }

  public get enforceUsersInVerifiedAndClaimedDomains() {
    return this._enforceUsersInVerifiedAndClaimedDomains;
  }

  public addDomain(domainToAdd) {

    //we always normalize to lowercase.
    domainToAdd = domainToAdd ? domainToAdd.toLowerCase() : domainToAdd;

    const existingDomain = _.find(this._domainList, { text: domainToAdd });

    if ((!domainToAdd) || existingDomain) {
      return this.$q.reject(this.$translate.instant('domainManagement.add.invalidDomainAdded'));
    }

    return this.getToken(domainToAdd);
  }

  public unverifyDomain(domain) {
    if (!domain) {
      return this.$q.reject();
    }

    const existingDomain = _.find(this._domainList, { text: domain });
    const requestData = {
      domain: domain,
      removePending: (existingDomain && existingDomain.status === this._states.pending),
    };

    return this.$http.post(this._invokeUnverifyDomainUrl, requestData).then(() => {
      _.remove(this._domainList, { text: domain });

      if (existingDomain && existingDomain.status !== this._states.pending && !_.some(this._domainList, d => { return (d.status === this._states.verified || d.status === this._states.claimed); })) {
        //last domain was deleted. CI will set the _enforceUsersInVerifiedAndClaimedDomains flag to false on server side. We will do it now in our browser cache:
        this._enforceUsersInVerifiedAndClaimedDomains = false;
      }
      if (this.Authinfo.isCare()) {
        this.syncDomainsWithCare();
      }
    }, err => {
      this.Log.error('Failed to unverify domain: ' + domain, err);
      return this.$q.reject(this.getErrorMessage(err));
    });
  }

  public verifyDomain(domain) {
    //let deferred = this.$q.defer();

    if (!domain) {
      this.Log.error('attempt to delete a domain not in list: ' + domain);
      return this.$q.reject();
    }
    return this.$http.post(this._invokeVerifyDomainUrl, {
      domain: domain,
      claimDomain: false,
    })
    .then(() => {
      const domainInList = _.find(this._domainList, { text: domain, status: this.states.pending });
      if (domainInList) {
        domainInList.status = this.states.verified;
      }
      if (this.Authinfo.isCare()) {
        this.syncDomainsWithCare();
      }
    }, err => {
      this.Log.error('Failed to verify domain: ' + domain, err);
      return this.$q.reject(this.getErrorMessage(err));
    });
  }

  public claimDomain(domain) {
    //let deferred = this.$q.defer();
    if (!domain) {
      return this.$q.reject();
    }
    return this.$http.post(this._claimDomainUrl, {
      data: [{ domain: domain }],
    })
    .then(() => {

      const claimedDomain = _.find(this._domainList, { text: domain, status: this.states.verified });

      if (claimedDomain) {
        claimedDomain.status = this.states.claimed;
      }
    }, err => {
      this.Log.error('Failed to claim domain: ' + domain, err);
      return this.$q.reject(this.getErrorMessage(err));
    });
  }

  public unclaimDomain(domain) {
    if (!domain) {
      return this.$q.reject();
    }
    return this.$http.delete(this._claimDomainUrl + '/' + window.btoa(domain)).then(() => {

      const claimedDomain = _.find(this._domainList, { text: domain, status: this.states.claimed });

      if (claimedDomain) {
        claimedDomain.status = this.states.verified;
      }

    }, err => {
      this.Log.error('Failed to unclaim domain: ' + domain, err);
      return this.$q.reject(this.getErrorMessage(err));
    });
  }

  public getVerifiedDomains(disableCache: boolean = false) {

    if (!disableCache && this._domainListLoaded) {
      return this.$q.resolve(this._domainList);
    }

    const scomUrl = this._scomUrl + (disableCache ? '?disableCache=true' : '');

    return this.$http.get<any>(scomUrl).then(res => {
      const data = res.data;
      this._domainList = [];

      this.loadDomainlist(data.domains, this.states.claimed, overrideIf => (overrideIf.status !== this.states.claimed));

      this.loadDomainlist(data.verifiedDomains, this.states.verified, overrideIf => (overrideIf.status === this.states.pending));

      this.loadDomainlist(data.pendingDomains, this.states.pending, null);

      this._enforceUsersInVerifiedAndClaimedDomains = data.enforceVerifiedDomains;

      return this.$q.resolve(this._domainList);
    }, err => {
      return this.$q.reject(this.getErrorMessage(err));
    });
  }

  public getToken(domain) {
    return this.$http.post<any>(this._invokeGetTokenUrl, {
      domain: domain,
    }).then(res => {

      const pendingDomain = _.find(this._domainList, { text: domain, status: this.states.pending });

      if (!pendingDomain) {
        this._domainList.push({
          text: domain,
          token: res.data.token,
          status: this.states.pending,
        });
      } else {
        pendingDomain.token = res.data.token;
      }
      return this.$q.resolve(res.data.token);
    }, err => {
      return this.$q.reject(this.getErrorMessage(err));
    });
  }

  private loadDomainlist(domainArray, domainStatus, overridePredicate) {

    _.each(domainArray, dom => {

      const domLower = dom.toLowerCase();
      const alreadyAddedMatch = _.find(this._domainList, { text: domLower });

      if (!alreadyAddedMatch || (overridePredicate && overridePredicate(alreadyAddedMatch))) {

        if (alreadyAddedMatch) {
          _.remove(this._domainList, { text: domLower });
        }

        this._domainList.push({
          text: domLower,
          token: '',
          status: domainStatus,
        });
      }
    });
  }

  public syncDomainsWithCare() {
    this.getVerifiedDomains().then(response => {
      let verifiedDomains = _.chain(response)
        .filter({ status : this.states.verified })
        .map('text')
        .value();
      verifiedDomains = verifiedDomains.length > 0 ? verifiedDomains : ['.*'];
      this.$http.put(this._sunlightConfigUrl, { allowedOrigins : verifiedDomains });
    }).catch(_.noop);
  }
}
