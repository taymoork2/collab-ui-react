import { IHttpService } from 'angular';

export class WifiProximityService {
  private wifiProximityPolicyUrl: string;
  private _wifiProximityOptInState: boolean | null;

  /* @ngInject  */
  constructor(private $http: IHttpService, Authinfo, UrlConfig) {
    const orgId = Authinfo.getOrgId();
    this.wifiProximityPolicyUrl = UrlConfig.getProximityServiceUrl() + `/wifi/policies/organization/${orgId}`;
  }

  private getOptInStatus(): angular.IHttpPromise<IProximityPolicy> {
    return this.$http
      .get<IProximityPolicy>(this.wifiProximityPolicyUrl);
  }

  public getOptInStatusEverSet(): angular.IPromise<boolean> {
    return this.getOptInStatus().then(result => {
      this.processPolicy(result);
      return result.data.enabled || !!result.data.updatedAt;
    }).catch(() => {
      return false;
    });
  }

  public get wifiProximityOptInState(): boolean | null {
    return this._wifiProximityOptInState;
  }

  public setWifiProximityPolicy(newValue: boolean): angular.IHttpPromise<IProximityPolicy> {
    this._wifiProximityOptInState = newValue;
    return this.$http
      .put<IProximityPolicy>(this.wifiProximityPolicyUrl, { enabled: newValue });
  }

  public fetchWifiProximityPolicy(): angular.IPromise<void> {
    return this.getOptInStatus()
      .then(policy => this.processPolicy(policy));
  }

  private processPolicy(policy: angular.IHttpResponse<IProximityPolicy>) {
    if (policy && policy.data) {
      if (policy.data.enabled) {
        this._wifiProximityOptInState = true;
      } else {
        this._wifiProximityOptInState = policy.data.updatedAt ? false : null;
      }
    } else {
      this._wifiProximityOptInState = null;
    }
  }
}

export interface IProximityPolicy {
  enabled: boolean;
  updatedAt: Date;
  updatedBy: 'string'; //cisUid
}
