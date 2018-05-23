import { XmlService } from 'modules/core/shared/xml-service/xml-service.service';

export interface ICertificate {
  primary?: string;
  id: string;
  expirationDate: string;
}

export interface IGetCertificateResponse {
  keys: ICertificate[];
}

export interface IMetadataPatchPayload {
  schemas: string[];
  signEncryptCertId?: string[];
  primaryCertId?: string;
}

export interface IMetadata {
  metadataXml: string;
}

export interface IIdpMetadata {
  metadataXml?: string;
  entityId: string;
  id: string;
  url?: string;
}

export interface IIdpMetadataResponse {
  data: IIdpMetadata[];
}

interface IWindowService extends ng.IWindowService {
  webkitURL: any;
}

export class SsoCertificateService {
  private latestCertificate: ICertificate;
  public readonly METADATA_SCHEMAS = 'urn:cisco:codev:identity:idbroker:metadata:schemas:1.0';
  public readonly SINGLE_SIGN_ON_SERVICE = 'SingleSignOnService';
  public readonly HTTP_POST_BINDINGS = 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST';
  private objectBlob?: Blob;
  private objectUrl?: string;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $window: IWindowService,
    private Authinfo,
    private UrlConfig,
    private XmlService: XmlService,
  ) {}

  public getAllCiCertificates(): ng.IPromise<ICertificate[]> {
    return this.$http<IGetCertificateResponse>({
      method: 'GET',
      url: `${this.SSO_CERTIFICATE_URL}`,
      data: '', // to add the Content-Type header in GET, need to add this empty data
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }).then(response => {
      this.setLatestCertificate(this.getLatestCertificateFromList(response.data.keys));
      return response.data.keys;
    });
  }

  public getOrgCertificates(): ng.IPromise<ICertificate[]> {
    return this.$http<IGetCertificateResponse>({
      method: 'GET',
      url: `${this.SSO_ORG_CERTIFICATE_URL}/keys`,
      data: '',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }).then(response => response.data.keys);
  }

  public updateMetadata(patchData: IMetadataPatchPayload): ng.IPromise<IMetadata> {
    const patchReq: ng.IRequestConfig = {
      method: 'PATCH',
      url: `${this.SSO_ORG_CERTIFICATE_URL}/samlmetadata/hosted/sp`,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      data: patchData,
    };
    return this.$http<IMetadata>(patchReq)
      .then(response => response.data);
  }

  public downloadMetadata(isMultipleCertificate: boolean): ng.IPromise<string> {
    const url = isMultipleCertificate ?
    `${this.SSO_ORG_CERTIFICATE_URL}/samlmetadata/hosted/sp?returnLatestCert=false` :
    `${this.SSO_ORG_CERTIFICATE_URL}/samlmetadata/hosted/sp?returnLatestCert=true`;

    return this.$http<IMetadata>({
      method: 'GET',
      url: url,
      data: '',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }).then(response => response.data.metadataXml);
  }

  public downloadIdpMetadata(): ng.IPromise<IIdpMetadata> {
    return this.$http<IIdpMetadataResponse>({
      method: 'GET',
      url: `${this.SSO_ORG_CERTIFICATE_URL}/samlmetadata/remote/idp?attributes=id&attributes=entityId`,
      data: '',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }).then(response => this.getIdpMetadata(response.data.data[0].url!));
  }

  private getIdpMetadata(url: string): ng.IPromise<IIdpMetadata> {
    return this.$http<IIdpMetadata>({
      method: 'GET',
      url: url,
      data: '',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }).then(response => response.data);
  }

  public addLatestCertificateToOrg(): ng.IPromise<IMetadata | void> {
    return this.getOrgCertificates()
      .then((certificates) => {
        const certificateIds = _.map(certificates, certificate => certificate.id);
        certificateIds.push(this.getLatestCertificate().id);

        const patchData: IMetadataPatchPayload = {
          schemas: [this.METADATA_SCHEMAS],
          signEncryptCertId: certificateIds,
        };
        return this.updateMetadata(patchData);
      });
  }

  public switchMetadata(): ng.IPromise<IMetadata> {
    const patchData: IMetadataPatchPayload = {
      schemas: [this.METADATA_SCHEMAS],
      primaryCertId: this.getLatestCertificate().id,
    };
    return this.updateMetadata(patchData);
  }

  private get SSO_CERTIFICATE_URL(): string {
    return `${this.UrlConfig.getSSOSetupUrl()}v1/keys`;
  }

  private get SSO_ORG_CERTIFICATE_URL(): string {
    return `${this.UrlConfig.getSSOSetupUrl()}${this.Authinfo.getOrgId()}/v1`;
  }

  public getLatestCertificate(): ICertificate {
    return this.latestCertificate;
  }

  public setLatestCertificate(certificate: ICertificate): void {
    this.latestCertificate = certificate;
  }

  public getLatestCertificateFromList(certificates: ICertificate[]): ICertificate {
    const today = moment();
    return _.maxBy(certificates, (cert) => {
      const expirationDate = moment(cert.expirationDate, moment.ISO_8601);
      return expirationDate.diff(today);
    });
  }

  public getOldestCertificateFromList(certificates: ICertificate[]): ICertificate {
    const today = moment();
    return _.minBy(certificates, (cert) => {
      const expirationDate = moment(cert.expirationDate, moment.ISO_8601);
      return expirationDate.diff(today);
    });
  }

  // Get the reqBinding param in the XML
  public getReqBinding(metadataXml: string): string {
    // Get the SingleSignOnService keys into an array
    const ssoServices = this.XmlService.filterKeyInXml(metadataXml, this.SINGLE_SIGN_ON_SERVICE);
    if (_.isEmpty(ssoServices)) {
      return '';
    }

    const hasPostBinding = _.some(ssoServices, (i) => {
      return i['_Binding'] === this.HTTP_POST_BINDINGS;
    });
    if (hasPostBinding) {
      return `&reqBinding=${this.HTTP_POST_BINDINGS}`;
    } else {
      return '';
    }
  }

  // Blob and URL creation methods
  public createObjectUrl(data: any) {
    const blob = new this.$window.Blob([data], { type: 'text/plain' });
    const oUrl = (this.$window.URL || this.$window.webkitURL).createObjectURL(blob);
    this.objectBlob = blob;
    this.objectUrl = oUrl;
    return oUrl;
  }

  public revokeObjectUrl() {
    if (!_.isUndefined(this.objectBlob) && !_.isUndefined(this.objectUrl)) {
      (this.$window.URL || this.$window.webkitURL).revokeObjectURL(this.objectUrl!);
      this.objectUrl = undefined;
      this.objectBlob = undefined;
    }
  }
}
