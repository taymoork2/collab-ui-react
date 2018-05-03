import { SettingSection } from '../../settingSection';
import { Notification } from 'modules/core/notifications';

export class WebexVersionSetting extends SettingSection {
  /* @ngInject */
  public constructor() {
    super('webexVersion');
    this.subsectionLabel = '';
    this.subsectionDescription = '';
  }
}

export class WebexVersionSettingController {
  public useLatestWbxVersion: boolean = false;
  public wbxclientversionselected = '';
  public wbxclientVersionInvalid: boolean = false;
  public wbxclientVersionInvalidError = '';
  public wbxclientversions = [];
  private orgId = this.Authinfo.getOrgId();
  private partnerId: string;
  public wbxclientversionplaceholder = this.$translate.instant('partnerProfile.selectAWbxClientVersion');
  public showClientVersions: boolean = false;

  /* @ngInject */
  constructor (
    private WebexClientVersion,
    private Authinfo,
    private Notification: Notification,
    private $translate: ng.translate.ITranslateService,
  ) { }

  public $onInit() {
    this.getClientVersionData();
  }

  private getClientVersionData() {
    return this.WebexClientVersion.getWbxClientVersions().then((webexClientVersions) => {
      if (webexClientVersions !== null) {
        this.wbxclientversions = webexClientVersions;
      }

      return this.WebexClientVersion.getPartnerIdGivenOrgId(this.orgId).then((partner) => {
        this.partnerId = _.get(partner, 'data.partnerId');

        return this.WebexClientVersion.getTemplate(this.partnerId);
      }).then((template) => {
        let clientVersion: string = _.get(template, 'data.clientVersion') || '';
        let useLatest: boolean = _.get(template, 'data.useLatest') || false;
        let updateDb = false;
        let validClientVersion = false;

        if (clientVersion === 'latest') {
          clientVersion = '';
        }

        if (clientVersion === '') {
          if (!useLatest) {
            useLatest = true;
            updateDb = true;
          }
        } else {
          this.wbxclientversions.forEach((wbxclientversion) => {
            if ((!validClientVersion) && (wbxclientversion === clientVersion)) {
              validClientVersion = true;
            }
          });

          if (!validClientVersion) {
            this.wbxclientVersionInvalid = true;
            this.wbxclientVersionInvalidError = this.$translate.instant('partnerProfile.webExClientVersionInvalid', { clientVersion: clientVersion });
          }
        }

        this.wbxclientversionselected = clientVersion;
        this.useLatestWbxVersion = useLatest;

        if (updateDb) {
          this.WebexClientVersion.postOrPutTemplate(this.partnerId, clientVersion, useLatest);
        }
      });
    });
  }

  public wbxclientversionselectchanged() {
    this.wbxclientVersionInvalid = false;
    this.wbxclientVersionInvalidError = '';

    this.WebexClientVersion.postOrPutTemplate(this.partnerId, this.wbxclientversionselected, this.useLatestWbxVersion).then(() => {
      this.Notification.success('partnerProfile.webexClientVersionUpdated');
    }).catch((response) => {
      this.Notification.errorResponse(response, 'partnerProfile.webexClientVersionUpdatedFailed');
    });
  }

  public toggleWebexSelectLatestVersionAlways() {
    this.WebexClientVersion.postOrPutTemplate(this.partnerId, this.wbxclientversionselected, this.useLatestWbxVersion).then(() => {
      if (this.useLatestWbxVersion) {
        this.Notification.success('partnerProfile.webexVersionUseLatestTrue');
      } else {
        this.Notification.success('partnerProfile.webexVersionUseLatestFalse');
      }
    }).catch((response) => {
      this.Notification.errorResponse(response, 'partnerProfile.webexVersionUseLatestUpdateFailed');
    });
  }
}

export class WebexVersionSettingComponent implements ng.IComponentOptions {
  public controller = WebexVersionSettingController;
  public template = require('./webex-version.html');
  public transclude = true;
}
