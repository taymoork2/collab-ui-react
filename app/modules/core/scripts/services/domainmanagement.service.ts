class DomainManagementService {

  private _domainList = [
    /* {
     text: 'initialDomain.com',
     status: this.states.pending}*/
  ];

  private _states = {
    pending: 'pending',
    verified: 'verified',
    claimed: 'claimed'
  }

  private _scomUrl;

  constructor(private $http, Config, Authinfo, private $q) {


    var _verifiedDomainsUrl = Config.getDomainManagementUrl(Authinfo.getOrgId());  //not used anymore?

    this._scomUrl = Config.getScomUrl() + '/' + Authinfo.getOrgId();

    //Unverify: http://wikicentral.cisco.com/display/IDENTITY/API+-+UnVerify+Domain+Ownership
    //POST https://identity.webex.com/organization/{orgid}/v1/actions/DomainVerification/Unverify/invoke

    //Delete: (domain base64 enc) http://wikicentral.cisco.com/display/IDENTITY/Domain+Management+API+-+Delete+Domain
    //DELETE https://<server name>/organization/{orgId}/v1/Domains/<domainValue>
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

    if (domainToAdd && domainToAdd.endsWith('.com')) {
      this._domainList.push({
        text: domainToAdd,
        code: '234SDSSFVD',
        status: this.states.pending
      });

      deferred.resolve();
    } else {
      deferred.reject("does not end with .com");
    }
    return deferred.promise;
  }

  deleteDomain(domainToDelete) {
    let deferred = this.$q.defer();
    if (domainToDelete && domainToDelete.text && domainToDelete.text.endsWith('.com')) {
      _.remove(this._domainList, {text: domainToDelete.text});
      deferred.resolve();
    } else {
      deferred.reject("does not end with .com");
    }
    return deferred.promise;
  }

  getVerifiedDomains(disableCache) {
    let deferred = this.$q.defer();

    let scomUrl = this._scomUrl + disableCache ? '?disableCache=true' : '';

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

     /* function(domainList, domainStatus, overridePredicate)

      _.each(data.domains, claimedDom => {

        let claimedDomLower = claimedDom.toLowerCase();
        let alreadyAddedMatch = _.find(this._domainList, { text: claimedDomLower});

        if (!alreadyAddedMatch || (alreadyAddedMatch.status != this.states.claimed)){

          if (alreadyAddedMatch)
            _.remove(this._domainList, {text: claimedDomLower});

          this._domainList.push({
              text: claimedDomLower,
              code: '',
              status: this.states.claimed
          });
        }
      });

      _.each(data.verifiedDomains, verifiedDom => {

        let verifiedDomLower = verifiedDom.toLowerCase();
        let alreadyAddedMatch = _.find(this._domainList, { text: verifiedDomLower});

        if (!alreadyAddedMatch || (alreadyAddedMatch.status == this.states.pending)){

          if (alreadyAddedMatch)
            _.remove(this._domainList, {text: verifiedDomLower});

          this._domainList.push({
            text: verifiedDomLower,
            code: '',
            status: this.states.verified
          });
        }
      });

      _.each(data.pendingDomains, pendingDom => {

        let pendingDomLower = pendingDom.toLowerCase();
        let alreadyAddedMatch = _.find(this._domainList, { text: pendingDomLower});

        if (!alreadyAddedMatch){
          this._domainList.push({
            text: pendingDomLower,
            code: 'RNG31337',
            status: this.states.pending
          });
        }
      });*/

      deferred.resolve(this._domainList);
    }, error => {
      deferred.reject(error);
    });


    /*this._domainList.push(
      {
        text: 'getVerifiedDomainspromise.com'.toLowerCase(),
        code: '',
        status: this.states.verified
      });*/


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
    let domainInList = _.find(this._domainList, {text: domain.text});
    if (domainInList) {
      domainInList.status = this.states.verified;
      deferred.resolve()
    } else {
      deferred.reject("not a domain possible to verify");
    }
    return deferred.promise;
  }
}
angular.module('Core')
  .service('DomainManagementService', DomainManagementService);
