export interface IVoicemail {
  dtmfAccessId: string;
}

export class Voicemail {
  public dtmfAccessId: string;
  constructor(dtmfAccessId: string) {
    this.dtmfAccessId = dtmfAccessId;
  }
}

export interface IVoiceMailPayload {
  services: string[];
  voicemail: IVoicemail;
}

export class VoiceMailPayload {
  public services: string[];
  public voicemail: Voicemail;
  constructor(services: string[], voicemail: Voicemail) {
    this.services = services;
    this.voicemail = voicemail;
  }
}

export class BulkEnableVmService {
    /* @ngInject */
    constructor(
    private Authinfo,
    private UserListService,
    private UserServiceCommon,
    private UserServiceCommonV2,
    private $q: ng.IQService,
  ) {
  }

  private maxRetry = 3;
  private maxUserCount = 1000;

  public getSparkCallUserCountRetry(_numTries = this.maxRetry): ng.IPromise<number> {
    return this.$q.when()
      .then(() => { return this._getSparkCallUserCount(); })
      .catch(error => {
        if (this._doRetry(_numTries, error)) {
          return this.getSparkCallUserCountRetry(_numTries - 1);
        }
        return this.$q.reject(error);
      });
  }

  public getUsersRetry(_offset: number, _limit: number, _numTries = this.maxRetry): ng.IPromise<any> {
    return this.$q.when()
      .then(() => { return this._getUsers(_offset, _limit); })
      .catch(error => {
        if (this._doRetry(_numTries, error)) {
          return this.getUsersRetry(_offset, _limit, _numTries - 1);
        }
        return this.$q.reject(error);
      });
  }

  public getUserServicesRetry(_userId: string, _numTries = this.maxRetry): ng.IPromise<string[]> {
    return this.$q.when()
      .then(() => { return this._getUserServices(_userId); })
      .catch(error => {
        if (this._doRetry(_numTries, error)) {
          return this.getUserServicesRetry(_userId, _numTries - 1);
        }
        return this.$q.reject(error);
      });
  }

  public getUserSitetoSiteNumberRetry(_userId: string, _numTries = this.maxRetry): ng.IPromise<string> {
    return this.$q.when()
      .then(() => { return this._getUserSitetoSiteNumber(_userId); })
      .catch(error => {
        if (this._doRetry(_numTries, error)) {
          return this.getUserSitetoSiteNumberRetry(_userId, _numTries - 1);
        }
        return this.$q.reject(error);
      });
  }

  public enableUserVmRetry(_userId: string, _voicemailPayload: IVoiceMailPayload, _numTries = this.maxRetry) {
    return this.$q.when()
      .then(() => { return this._enableUserVm(_userId, _voicemailPayload); })
      .catch(error => {
        if (this._doRetry(_numTries, error)) {
          return this.enableUserVmRetry(_userId, _voicemailPayload, _numTries - 1);
        }
        return this.$q.reject(error);
      });
  }

  private _doRetry(_retryCount: number, _error): boolean {
    if (_retryCount > 0) {
      if (_error && _error.status && (_error.status === 503 || _error.status === 429)) {
        return true;
      }
    }
    return false;
  }

  private _getSparkCallUserCount(): ng.IPromise<number> {
    return this.UserListService.listUsers(0, this.maxUserCount, null, null, _.noop, '', false, 'ciscouc')
      .then(response => {
        return +response.data.totalResults || 0;
      });
  }

  private _getUsers(_offset: number, _limit: number) {
    return this.UserServiceCommon.query({
      customerId: this.Authinfo.getOrgId(),
      offset: _offset,
      limit: _limit,
    }).$promise;
  }

  private _getUserServices(_userId: string): ng.IPromise<string[]> {
    return this.UserServiceCommon.get({
      customerId: this.Authinfo.getOrgId(),
      userId: _userId,
    }).$promise
      .then((commonUser) => {
        if (typeof commonUser === 'undefined') {
          return [];
        }
        return commonUser.services || [];
      });
  }

  private _getUserSitetoSiteNumber(_userId: string): ng.IPromise<string> {
    return this.UserServiceCommonV2.get({
      customerId: this.Authinfo.getOrgId(),
      userId: _userId,
    }).$promise
      .then(commonV2User => {
        if (typeof commonV2User === 'undefined') {
          return null;
        }
        return commonV2User.numbers ? commonV2User.numbers[0].siteToSite : null;
      });
  }

  private _enableUserVm(_userId: string, _voicemailPayload: IVoiceMailPayload) {
    return this.UserServiceCommon.update({
      customerId: this.Authinfo.getOrgId(),
      userId: _userId,
    }, _voicemailPayload).$promise;
  }
}
