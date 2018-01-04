import { SparkAssistantService } from 'modules/core/settings/spark-assistant';
import { Notification } from 'modules/core/notifications';

export class SparkAssistantSettingController {
  public ftsw: boolean;
  public label: string;
  private _sparkAssistantEnabled: boolean = false;
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private SparkAssistantService: SparkAssistantService,
    private Notification: Notification,
  ) {
  }

  public $onInit() {
    this.SparkAssistantService.getSpeechServiceOptIn()
      .then(response => {
        this._sparkAssistantEnabled = _.get<boolean>(response, 'optIn');
      });
    this.setInputLabel();
  }

  public setInputLabel(): void {
    this.label = this.ftsw ? this.$translate.instant('globalSettings.sparkAssistant.subsectionLabel') : this.$translate.instant('globalSettings.sparkAssistant.description');
  }

  get sparkAssistantEnabled(): boolean {
    return this._sparkAssistantEnabled;
  }

  set sparkAssistantEnabled(value: boolean) {
    this._sparkAssistantEnabled = value;
    this.updateSparkAssistantEnabled();
  }

  public updateSparkAssistantEnabled() {
    if (this._sparkAssistantEnabled !== undefined) {
      this.SparkAssistantService.updateSpeechService(this._sparkAssistantEnabled)
        .then(() => {
          this.Notification.success('globalSettings.sparkAssistant.success');
        })
        .catch((response) => {
          this.Notification.errorWithTrackingId(response, 'globalSettings.sparkAssistant.failure');
        });
    }
  }
}
