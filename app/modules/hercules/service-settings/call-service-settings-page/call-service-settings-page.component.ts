import { Notification } from 'modules/core/notifications/notification.service';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { IformattedCertificate } from 'modules/hercules/services/certificate-formatter-service';
import { CiscoCollaborationCloudCertificateService } from 'modules/hercules/service-settings/cisco-collaboration-cloud-certificate-store/cisco-collaboration-cloud-certificate.service';

class CallServiceSettingsPageComponentCtrl implements ng.IComponentController {

  public callServiceAwareSection = {
    title: 'hercules.serviceNames.squared-fusion-uc.full',
  };
  public callServiceConnectSection = {
    title: 'hercules.serviceNames.squared-fusion-ec',
  };
  public callServiceConnectIsEnabled: boolean = false;
  public isCertificateDefault: boolean = true;
  public isImporting: boolean = false;
  public formattedCertList: IformattedCertificate[];

  /* @ngInject */
  constructor(
    private Analytics,
    private Notification: Notification,
    private CiscoCollaborationCloudCertificateService: CiscoCollaborationCloudCertificateService,
    private ServiceDescriptorService: ServiceDescriptorService,
  ) { }

  public $onInit() {
    this.ServiceDescriptorService.isServiceEnabled('squared-fusion-ec')
      .then((response) => {
        this.callServiceConnectIsEnabled = response;
        if (this.callServiceConnectIsEnabled) {
          this.initCertificateInfo();
        }
      })
      .catch((response) => {
        this.Notification.errorWithTrackingId(response, 'hercules.genericFailure');
      });
    this.Analytics.trackHybridServiceEvent(this.Analytics.sections.HS_NAVIGATION.eventNames.VISIT_CALL_SETTINGS);
  }

  /* Callback from the hs-enable-disable-call-service-connect component  */
  public onCallServiceConnectEnabled = () => {
    this.callServiceConnectIsEnabled = true;
    this.initCertificateInfo();
  }

  /* Callback from the hs-enable-disable-call-service-connect component  */
  public onCallServiceConnectDisabled = () => {
    this.callServiceConnectIsEnabled = false;
  }

  public uploadCertificate(file: File): void {
    if (!file) {
      return;
    }
    this.isImporting = true;
    this.CiscoCollaborationCloudCertificateService.uploadCertificate(file)
      .then( (cert) => {
        if (cert) {
          this.formattedCertList = cert.formattedCertList || [];
          this.isImporting = cert.isImporting;
        }
        this.isImporting = false;
      });
  }

  public onCertificateChanges(isCertificateDefault: boolean): void {
    this.isCertificateDefault = isCertificateDefault;
    if (!this.isCertificateDefault) {
      this.initCertificateInfo();
    }
  }

  public initCertificateInfo(): void {
    this.CiscoCollaborationCloudCertificateService.readCerts()
      .then((cert) => {
        if (!_.isUndefined(cert)) {
          this.formattedCertList = cert.formattedCertList;
        }
      });
  }

}

export class CallServiceSettingsPageComponent implements ng.IComponentOptions {
  public controller = CallServiceSettingsPageComponentCtrl;
  public template = require('./call-service-settings-page.component.html');
}
