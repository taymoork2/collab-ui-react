import { IServerTime } from './partner-search.interfaces';
import { PartnerSearchService } from './partner-search.service';
import { AdminType, TrackUsageEvent } from './track-usage.enum';

export class TrackUsageService {
  private url: string;
  private type = 'diagnostic_usage';

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private PartnerSearchService: PartnerSearchService,
    private UrlConfig,
  ) {
    const qbsDomain = this.getQbsDomain(this.UrlConfig.getQlikServiceUrl());
    const qbsPackage = 'qlik-gtwy-server-1.0-SNAPSHOT';
    this.url = this.UrlConfig.getQlikUsageLogUrl(qbsDomain, qbsPackage);
  }

  public track(evt: TrackUsageEvent): void {
    const usage = {
      logType: this.type,
      timestamp: 0,
      api: evt,
      user: this.Authinfo.getUserName(),
      email: this.Authinfo.getPrimaryEmail(),
      orgId: this.Authinfo.getOrgId(),
      orgName: this.Authinfo.getOrgName(),
      adminType: this.getAdminType(),
    };

    this.PartnerSearchService.getServerTime().then((serverTime: IServerTime) => {
      usage.timestamp = serverTime.dateLong;
      this.$http.post(this.url, usage);
    });
  }

  private getQbsDomain(url: string): string {
    let qbsUrl = url;
    if (_.startsWith(qbsUrl, 'http')) {
      qbsUrl = url.split('/')[2];
    }
    return qbsUrl;
  }

  private getAdminType(): AdminType {
    if ((this.Authinfo.isPartner() && !this.Authinfo.isCustomerLaunchedFromPartner()) || this.Authinfo.isPartnerSalesAdmin()) {
      return AdminType.PARTNER;
    } else {
      return AdminType.CUSTOMER;
    }
  }
}
