import { Domain, IParsedSipCloudDomain, SubdomainType } from './sip-address.types';

export class SipAddressModel {
  public subdomain: string;

  private atlasJ9614SipUriRebranding: boolean;
  private callSubdomain: SubdomainType;
  private domain: Domain;
  private isProd: boolean;
  private origSipCloudDomain?: string;
  private origSubdomain: string;
  private roomSubdomain: SubdomainType;

  constructor(
    options: {
      atlasJ9614SipUriRebranding: boolean,
      isProd: boolean,
      sipCloudDomain?: string,
    },
  ) {
    const {
      atlasJ9614SipUriRebranding,
      isProd,
      sipCloudDomain,
    } = options;
    this.atlasJ9614SipUriRebranding = atlasJ9614SipUriRebranding;
    this.isProd = isProd;
    this.origSipCloudDomain = sipCloudDomain;
    if (sipCloudDomain) {
      this.initSipCloudDomain(sipCloudDomain);
    } else {
      this.initNewSipCloudDomain();
    }
  }

  public createNewModel(): SipAddressModel {
    return new SipAddressModel({
      atlasJ9614SipUriRebranding: this.atlasJ9614SipUriRebranding,
      isProd: this.isProd,
      sipCloudDomain: this.sipCloudDomain,
    });
  }

  public get callFQDN(): string {
    return this.getFQDN({
      subdomainType: this.callSubdomain,
    });
  }

  public get roomFQDN(): string {
    return this.getFQDN({
      subdomainType: this.roomSubdomain,
    });
  }

  public get sipCloudDomain(): string {
    return this.getFQDN({
      domain: this.getNewDomain(),
      subdomain: this.subdomain,
    });
  }

  public isChanged(): boolean {
    return this.origSipCloudDomain !== this.sipCloudDomain;
  }

  public hasDomainMigrated(): boolean {
    return _.includes([Domain.WEBEX, Domain.KOALABAIT], this.domain);
  }

  public reset(): void {
    this.subdomain = this.origSubdomain;
  }

  private getFQDN(options: {
    domain?: Domain,
    subdomain?: string,
    subdomainType?: SubdomainType,
  } = {}): string {
    const {
      domain = this.domain,
      subdomain = this.origSubdomain,
      subdomainType = '',
    } = options;
    return `${subdomain}${subdomainType}${domain}`;
  }

  private getNewDomain(): Domain {
    if (!this.atlasJ9614SipUriRebranding || _.includes([Domain.WEBEX, Domain.KOALABAIT], this.domain)) {
      return this.domain;
    }

    if (this.domain === Domain.WBX2) {
      return Domain.KOALABAIT;
    }

    return Domain.WEBEX;
  }

  private initNewSipCloudDomain(): void {
    this.subdomain = '';
    this.origSubdomain = '';

    if (this.atlasJ9614SipUriRebranding) {
      this.callSubdomain = SubdomainType.CALLS;
      this.roomSubdomain = SubdomainType.ROOMS;
      if (this.isProd) {
        this.domain = Domain.WEBEX;
      } else {
        this.domain = Domain.KOALABAIT;
      }
    } else {
      this.callSubdomain = SubdomainType.CALL;
      this.roomSubdomain = SubdomainType.ROOM;
      if (this.isProd) {
        this.domain = Domain.CISCOSPARK;
      } else {
        this.domain = Domain.WBX2;
      }
    }
  }

  private initSipCloudDomain(sipCloudDomain: string): void {
    const existingDomain = _.find([
      Domain.WEBEX,
      Domain.CISCOSPARK,
      Domain.KOALABAIT,
      Domain.WBX2,
    ], domain => _.endsWith(sipCloudDomain, domain));
    const parsedSipCloudDomain = this.parseSipCloudDomain(sipCloudDomain, existingDomain);

    this.domain = parsedSipCloudDomain.domain;
    this.subdomain = parsedSipCloudDomain.subdomain;
    this.origSubdomain = parsedSipCloudDomain.subdomain;
    this.initSubdomains(parsedSipCloudDomain.atlasJ9614SipUriRebranding);
  }

  private parseSipCloudDomain(sipCloudDomain: string, existingDomain: Domain): IParsedSipCloudDomain {
    return {
      atlasJ9614SipUriRebranding: _.includes([Domain.WEBEX, Domain.KOALABAIT], existingDomain),
      domain: existingDomain,
      subdomain: _.replace(sipCloudDomain, existingDomain, ''),
    };
  }

  private initSubdomains(atlasJ9614SipUriRebranding: boolean): void {
    if (atlasJ9614SipUriRebranding) {
      this.callSubdomain = SubdomainType.CALLS;
      this.roomSubdomain = SubdomainType.ROOMS;
    } else {
      this.callSubdomain = SubdomainType.CALL;
      this.roomSubdomain = SubdomainType.ROOM;
    }
  }
}
