class DomainManagementService {

  private _domainList = [
    /* {
     text: 'initialDomain.com',
     token: 'hjkhk',
     status: this.states.pending}*/
  ];

  private _states = {
    pending: 'pending',
    verified: 'verified',
    claimed: 'claimed'
  }

  private _scomUrl;
  private _invokeGetTokenUrl;
  private _invokeUnverifyDomainUrl;
  private _deleteDomainUrl;

  constructor(private $http, Config, Authinfo, private $q, private Log) {

    // var _verifiedDomainsUrl = Config.getDomainManagementUrl(Authinfo.getOrgId()) + "Domain";  //not used anymore?

    let orgId = Authinfo.getOrgId();

    this._scomUrl = Config.getScomUrl() + '/' + orgId;

    //POST https://identity.webex.com/organization/{orgid}/v1/actions/DomainVerification/GetToken/invoke HTTP 1.1
    this._invokeGetTokenUrl = Config.getDomainManagementUrl(orgId) + 'actions/DomainVerification/GetToken/invoke';

    //Unverify: http://wikicentral.cisco.com/display/IDENTITY/API+-+UnVerify+Domain+Ownership
    //POST https://identity.webex.com/organization/{orgid}/v1/actions/DomainVerification/Unverify/invoke
    this._invokeUnverifyDomainUrl = Config.getDomainManagementUrl(orgId) + 'actions/DomainVerification/Unverify/invoke';

    //Delete: (domain base64 enc) http://wikicentral.cisco.com/display/IDENTITY/Domain+Management+API+-+Delete+Domain
    //DELETE https://<server name>/organization/{orgId}/v1/Domains/<domainValue>
    this._deleteDomainUrl = Config.getDomainManagementUrl(orgId) + 'Domains/';

  }

  get states() {
    return this._states;
  }

  get domainList() {
    return this._domainList;
  }

  refreshDomainList() {
    return this.getVerifiedDomains(false);
  }

  addDomain(domainToAdd) {
    let deferred = this.$q.defer();

    //we always normalize to lowercase.
    domainToAdd = domainToAdd ? domainToAdd.toLowerCase() : domainToAdd;

    let existingDomain = _.find(this._domainList, {text: domainToAdd});

    if ((!domainToAdd) || existingDomain){
      deferred.reject();
      return deferred.promise;
    }

    this._domainList.push({
      text: domainToAdd,
      token: '',
      status: this.states.pending
    });

    return this.getToken(domainToAdd);
  }

  unverifyDomain(domain) {
    let deferred = this.$q.defer();
    if (domain) {

      this.$http.post(this._invokeUnverifyDomainUrl, {
        'domain': domain
      }).then(res => {
        _.remove(this._domainList, {text: domain});
        deferred.resolve();
      }, err => {
        this.Log.error('Failed to unverify domain:' + domain, err);
        deferred.reject(err.statusText?err.statusText:err);
      });
    } else {
      deferred.reject();
    }
    return deferred.promise;
  }

  unclaimDomain(domainToDelete) {
    let deferred = this.$q.defer();
    if (domainToDelete) {

      this.$http.delete(this._deleteDomainUrl).then(res => {
        let claimedDomain = _.find(this._domainList, {text: domainToDelete, status: this.states.claimed});

        if (claimedDomain)
          claimedDomain.status = this.states.verified;

        deferred.resolve();
      }, err => {
        this.Log.error('Failed to unclaim domain:' + domainToDelete, err);
        deferred.reject(err.statusText?err.statusText:err);
      });
    } else {
      deferred.reject();
    }
    return deferred.promise;
  }

  getVerifiedDomains(disableCache) {
    let deferred = this.$q.defer();
    let scomUrl = this._scomUrl + (disableCache ? '?disableCache=true' : '');

    this.$http.get(scomUrl).then(data => {

      this._domainList = [];

      if (!data || (!data.domains && !data.verifiedDomains && !data.pendingDomains)){
        data =
        {
          id: "theid",
          meta:{ created: "adfd"},
          displayName: "org",
          domains: [
            "claimed1.grodum.org",
            "claimed2.grodum.org"
          ],
          verifiedDomains: [
            "claimed1.grodum.org",
            "verified1.grodum.org",
            "verified2.grodum.org"
          ],
          pendingDomains: [
            "verified1.grodum.org",
            "claimed2.grodum.org",
            "pending1.grodum.org",
            "pending2.grodum.org"
          ]
        };
      }

      this.loadDomainlist(data.domains, this.states.claimed, overrideIf => (overrideIf.status != this.states.claimed));

      this.loadDomainlist(data.verifiedDomains, this.states.verified, overrideIf => (overrideIf.status == this.states.pending));

      this.loadDomainlist(data.pendingDomains, this.states.pending, null);

      this.getVerificationTokens();

      deferred.resolve(this._domainList);
    }, error => {
      deferred.reject(error);
    });

    return deferred.promise;
  }

  private loadDomainlist(domainArray, domainStatus, overridePredicate){

    _.each(domainArray, dom => {

      let domLower = dom.toLowerCase();
      let alreadyAddedMatch = _.find(this._domainList, { text: domLower});

      if (!alreadyAddedMatch || (overridePredicate && overridePredicate(alreadyAddedMatch))){

        if (alreadyAddedMatch)
          _.remove(this._domainList, {text: domLower});

        this._domainList.push({
          text: domLower,
          code: '',
          status: domainStatus
        });
      }
    });
  }

  public verifyDomain(domain) {
    let deferred = this.$q.defer();
    let domainInList = _.find(this._domainList, {text: domain.text, status: this.states.pending});
    if (domainInList) {
      domainInList.status = this.states.verified;
      deferred.resolve()
    } else {
      this.Log.error('attempt to delete a domain not in list:' + domain);
      deferred.reject();
    }
    return deferred.promise;
  }

  private getVerificationTokens():void {

    let pendingDomains = _.filter(this._domainList, { status: this.states.pending });

    if (!pendingDomains || pendingDomains.length < 1)
      return;

    _.each(pendingDomains, domain => {
      this.getToken(domain.text);
    });
  }

  private getToken(domain) {
    let deferred = this.$q.defer();

    this.$http.post(this._invokeGetTokenUrl, {
      'domain': domain
    }).then(res => {

     let pendingDomain = _.find(this._domainList, {text: domain, status: this.states.pending});
     pendingDomain.token = res.data.token;

      deferred.resolve(res.data.token);
    }, error => {
      deferred.reject(error);
    });

    return deferred.promise;
  }
}
angular.module('Core')
  .service('DomainManagementService', DomainManagementService);
