import { ICertificate, IformattedCertificate, CertificateFormatterService } from 'modules/hercules/services/certificate-formatter-service';
import { IToolkitModalService } from 'modules/core/modal';
import { CertService } from 'modules/hercules/services/cert-service';
import { Notification } from 'modules/core/notifications';

export class CiscoCollaborationCloudCertificateService {
  private formattedCertList: IformattedCertificate[];
  private isImporting: boolean = false;
  private uploadedCertIds: string[] = [];

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private CertService: CertService,
    private CertificateFormatterService: CertificateFormatterService,
    private Authinfo,
    private Notification: Notification,
  ) {
  }

  public uploadCertificate(file: File): ng.IPromise<any> {
    this.isImporting = true;
    return this.CertService.uploadCertificate(this.Authinfo.getOrgId(), file)
      .then( (res) => this.readCerts(res))
      .catch (error => {
        this.isImporting = false;
        this.Notification.errorResponse(error, 'servicesOverview.cards.privateTrunk.error.certUploadError');
      });

  }

  public readCerts(res?: any): ng.IPromise<any> {
    this.formattedCertList = [];
    if (res) {
      const certId = _.get(res, 'data.certId', '');
      this.uploadedCertIds.push(certId);
    }
    return this.CertService.getCerts(this.Authinfo.getOrgId())
      .then( res => {
        const certificates: ICertificate[] = res || [];
        this.formattedCertList = this.CertificateFormatterService.formatCerts(certificates);
        this.isImporting = false;
        return ({ formattedCertList: this.formattedCertList, isImporting: this.isImporting });
      }, error => {
        this.Notification.errorResponse(error, 'hercules.settings.call.certificatesCannotRead');
        this.isImporting = false;
        return ({ formattedCertList: this.formattedCertList, isImporting: this.isImporting });
      });
  }

  public deleteCert(certId: string): ng.IPromise<any> {
    return this.$modal.open({
      template: require('./certificate-delete-confirm.html'),
      type: 'dialog',
    })
      .result.then(() => {
        return this.CertService.deleteCert(certId)
          .then(() => { return this.getUpdatedCertInfo(certId);
          }).catch(error => {
            this.Notification.errorWithTrackingId(error, 'hercules.settings.call.certificatesCannotDelete');
          });
      });
  }

  public deleteCerts(): ng.IPromise<any> {
    return this.$modal.open({
      template: require('./all-certificates-delete-confirm.html'),
      type: 'dialog',
    })
      .result.then(() => {
        _.forEach(this.formattedCertList, (cert) => {
          this.CertService.deleteCert(cert.certId);
        });
        this.formattedCertList = [];
      });
  }

  public deleteUploadedCerts(): void {
    _.forEach(this.uploadedCertIds, (certId) => {
      this.CertService.deleteCert(certId);
    });
    this.formattedCertList = [];
  }

  public getUpdatedCertInfo(certId: string): ng.IPromise<any> {
    this.uploadedCertIds.splice(_.indexOf(this.uploadedCertIds, certId));
    return this.readCerts();
  }
}
