import { OrgSettingsService } from 'modules/core/shared/org-settings/org-settings.service';
import { SipAddressModel } from './sip-address.model';
import { IDomainResponse, ISaveResponse, IValidateResponse } from './sip-address.types';

export class SipAddressService {
  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private Authinfo,
    private Config,
    private FeatureToggleService,
    private OrgSettingsService: OrgSettingsService,
    private UrlConfig,
  ) {}

  public loadSipAddressModel(): ng.IPromise<SipAddressModel> {
    return this.$q.all({
      atlasJ9614SipUriRebranding: this.FeatureToggleService.atlasJ9614SipUriRebrandingGetStatus(),
      sipCloudDomain: this.OrgSettingsService.getSipCloudDomain(this.Authinfo.getOrgId()),
    })
      .then(promises => new SipAddressModel({
        atlasJ9614SipUriRebranding: promises.atlasJ9614SipUriRebranding,
        isProd: this.Config.isProd(),
        sipCloudDomain: promises.sipCloudDomain,
      }));
  }

  public validateSipAddress(model: SipAddressModel): ng.IPromise<IValidateResponse> {
    return this.postSipAddress({
      model,
      isVerifyDomainOnly: true,
    }).then(response => ({
      isDomainAvailable: response.isDomainAvailable,
      isDomainInvalid: false,
      model: model.createNewModel(),
    })).catch<IValidateResponse>(response => {
      if (response.status === 400) {
        return {
          isDomainAvailable: false,
          isDomainInvalid: true,
          model: model.createNewModel(),
        };
      }
      return this.$q.reject(response);
    });
  }

  public saveSipAddress(model: SipAddressModel): ng.IPromise<ISaveResponse> {
    return this.postSipAddress({
      model,
    }).then(response => ({
      isDomainReserved: response.isDomainReserved,
      model: model.createNewModel(),
    }));
  }

  private postSipAddress(options: {
    model: SipAddressModel,
    isVerifyDomainOnly?: boolean,
  }): ng.IPromise<IDomainResponse> {
    const {
      model,
      isVerifyDomainOnly = false,
    } = options;
    const name = model.sipCloudDomain;
    const payload = {
      name,
      isVerifyDomainOnly,
    };
    return this.$http.post<IDomainResponse>(this.url, payload)
      .then(response => response.data);
  }

  private get url(): string {
    return `${this.UrlConfig.getAdminServiceUrl()}organizations/${this.Authinfo.getOrgId()}/settings/domain`;
  }
}
