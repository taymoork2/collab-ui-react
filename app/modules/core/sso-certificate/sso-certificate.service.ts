import { Notification } from 'modules/core/notifications';

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
  public static readonly METADATA_SCHEMAS = 'urn:cisco:codev:identity:idbroker:metadata:schemas:1.0';
  private objectBlob?: Blob;
  private objectUrl?: string;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $window: IWindowService,
    private Authinfo,
    private UrlConfig,
    private Notification: Notification,
  ) {}

  public getAllCiCertificates(): ng.IPromise<ICertificate[] | void> {
    return this.$http<IGetCertificateResponse>({
      method: 'GET',
      url: `${this.SSO_CERTIFICATE_URL}`,
      data: '',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }).then(response => {
      this.setLatestCertificate(this.getLatestCertificateFromList(response.data.keys));
      return response.data.keys;
    }).catch((response) => {
      this.Notification.errorResponse(response);
    });
  }

  public getOrgCertificates(): ng.IPromise<ICertificate[] | void> {
    return this.$http<IGetCertificateResponse>({
      method: 'GET',
      url: `${this.SSO_ORG_CERTIFICATE_URL}/keys`,
      data: '',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }).then(response => response.data.keys)
    .catch((response) => {
      this.Notification.errorResponse(response);
    });
  }

  public updateMetadata(patchData: IMetadataPatchPayload): ng.IPromise<IMetadata | void> {
    const patchReq: ng.IRequestConfig = {
      method: 'PATCH',
      url: `${this.SSO_ORG_CERTIFICATE_URL}/samlmetadata/hosted/sp`,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      data: patchData,
    };
    return this.$http<IMetadata>(patchReq)
      .then(response => response.data)
      .catch((response) => {
        this.Notification.errorResponse(response);
      });
  }

  public downloadMetadata(isMultipleCertificate: boolean): ng.IPromise<string | void> {
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
    }).then(response => response.data.metadataXml)
    .catch((response) => {
      this.Notification.errorResponse(response);
    });
  }

  public downloadIdpMetadata(): ng.IPromise<IIdpMetadata | void> {
    return this.$http<IIdpMetadataResponse>({
      method: 'GET',
      url: `${this.SSO_ORG_CERTIFICATE_URL}/samlmetadata/remote/idp?attributes=id&attributes=entityId`,
      data: '',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }).then(response => this.getIdpMetadata(response.data.data[0].url!))
    .catch((response) => {
      this.Notification.errorResponse(response);
    });
  }

  private getIdpMetadata(url: string): ng.IPromise<IIdpMetadata | void> {
    return this.$http<IIdpMetadata>({
      method: 'GET',
      url: url,
      data: '',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }).then(response => response.data)
    .catch((response) => {
      this.Notification.errorResponse(response);
    });
  }

  public addLatestCertificateToOrg(): ng.IPromise<IMetadata | void> {
    return this.getOrgCertificates()
      .then((certificates) => {
        const certificateIds: string[] = _.map(<ICertificate[]>certificates, 'id');
        certificateIds.push(this.getLatestCertificate().id);

        const patchData: IMetadataPatchPayload = {
          schemas: [SsoCertificateService.METADATA_SCHEMAS],
          signEncryptCertId: certificateIds,
        };
        return this.updateMetadata(patchData);
      });
  }

  public switchMetadata(): ng.IPromise<IMetadata | void> {
    const patchData: IMetadataPatchPayload = {
      schemas: [SsoCertificateService.METADATA_SCHEMAS],
      primaryCertId: this.getLatestCertificate().id,
    };
    return this.updateMetadata(patchData);
  }

  private get SSO_CERTIFICATE_URL() {
    return `${this.UrlConfig.getSSOSetupUrl()}v1/keys`;
  }

  private get SSO_ORG_CERTIFICATE_URL() {
    return `${this.UrlConfig.getSSOSetupUrl()}${this.Authinfo.getOrgId()}/v1`;
  }

  public getLatestCertificate(): ICertificate {
    return this.latestCertificate;
  }

  public setLatestCertificate(certificate: ICertificate) {
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
