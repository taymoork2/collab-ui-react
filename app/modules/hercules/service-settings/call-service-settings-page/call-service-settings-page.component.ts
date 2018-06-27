import { Notification } from 'modules/core/notifications/notification.service';
import { CiscoCollaborationCloudCertificateService } from 'modules/hercules/service-settings/cisco-collaboration-cloud-certificate-store/cisco-collaboration-cloud-certificate.service';
import { IformattedCertificate } from 'modules/hercules/services/certificate-formatter-service';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

class CallServiceSettingsPageComponentCtrl implements ng.IComponentController {

  public callServiceAwareSection = {
    title: 'hercules.serviceNames.squared-fusion-uc.full',
  };
  public callServiceConnectSection = {
    title: 'hercules.serviceNames.squared-fusion-ec',
  };
  public callServiceConnectIsEnabled = false;
  public isCertificateDefault = true;
  public isImporting = false;
  public formattedCertList: IformattedCertificate[];

  private isAtlasJ9614SipUriRebrandingEnabled = false;

  /* @ngInject */
  constructor(
    private Analytics,
    private CiscoCollaborationCloudCertificateService: CiscoCollaborationCloudCertificateService,
    private FeatureToggleService,
    private Notification: Notification,
    private ServiceDescriptorService: ServiceDescriptorService,
  ) { }

  public $onInit() {
    this.initServices();
    this.initFeatureToggles();
    this.Analytics.trackHybridServiceEvent(this.Analytics.sections.HS_NAVIGATION.eventNames.VISIT_CALL_SETTINGS);
  }

  public get showMigrateSipAddressSection(): boolean {
    return this.callServiceConnectIsEnabled && this.isAtlasJ9614SipUriRebrandingEnabled;
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

  private initCertificateInfo(): void {
    this.CiscoCollaborationCloudCertificateService.readCerts()
      .then((cert) => {
        if (!_.isUndefined(cert)) {
          this.formattedCertList = cert.formattedCertList;
        }
      });
  }

  private initServices(): void {
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
  }

  private initFeatureToggles(): void {
    this.FeatureToggleService.atlasJ9614SipUriRebrandingGetStatus()
      .then(isEnabled => this.isAtlasJ9614SipUriRebrandingEnabled = isEnabled);
  }

}

export class CallServiceSettingsPageComponent implements ng.IComponentOptions {
  public controller = CallServiceSettingsPageComponentCtrl;
  public template = require('./call-service-settings-page.component.html');
}
