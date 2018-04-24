import { SparkAssistantService } from 'modules/core/settings/spark-assistant';
import { Notification } from 'modules/core/notifications';
import { IToolkitModalService } from 'modules/core/modal';
enum ActivationStatusEnum  {
  ENABLED = 'ENABLED',
  PROCESSING = 'PROCESSING',
  DISABLED = 'DISABLED',
  UNKNOWN = 'UNKNOWN',
}
export class SparkAssistantSettingController {
  private readonly MAX_POLL_COUNT = 10;
  private readonly TIME_IN_MS = 30000;

  public ftsw: boolean;
  public label: string;
  private _sparkAssistantEnabled: boolean = false;
  public inProgress: boolean = true;
  public activationStatus: ActivationStatusEnum.UNKNOWN;
  private pollTimer: ng.IIntervalService;
  private noOfPolls: number;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private SparkAssistantService: SparkAssistantService,
    private Notification: Notification,
    private $modal: IToolkitModalService,
    private $state: ng.ui.IStateService,
    private $interval,
  ) {

  }

  public $onInit() {
    this.SparkAssistantService.getSpeechServiceOptIn()
    .then(response => {
      this._sparkAssistantEnabled = _.get<boolean>(response, 'optIn');
      this.inProgress = _.get<string>(response, 'activationStatus').toUpperCase() === ActivationStatusEnum.PROCESSING;
      if (!_.isUndefined(this.inProgress) && this.inProgress) {
        this.fetchSparkAssistantStatus();
      }
    });
    this.setInputLabel();
  }

  public $onDestroy() {
    this.cancelPollTimer();
  }

  public cancelPollTimer() {
    this.$interval.cancel(this.pollTimer);
  }

  public fetchSparkAssistantStatus() {
    this.noOfPolls = 1;
    this.pollTimer = this.$interval( () => {
      if (this.inProgress) {
        this.SparkAssistantService.getSpeechServiceOptIn()
        .then(response => {
          this._sparkAssistantEnabled = _.get<boolean>(response, 'optIn');
          this.inProgress = (_.get<string>(response, 'activationStatus').toUpperCase() === ActivationStatusEnum.PROCESSING);
        });
      }
      this.noOfPolls++;
      if (!this.inProgress || this.noOfPolls > this.MAX_POLL_COUNT) {
        this.cancelPollTimer();
      }
    }, this.TIME_IN_MS);
  }

  public setInputLabel(): void {
    this.label = this.ftsw ? this.$translate.instant('globalSettings.sparkAssistant.subsectionLabel') : this.$translate.instant('globalSettings.sparkAssistant.description');
  }

  get sparkAssistantEnabled(): boolean {
    return this._sparkAssistantEnabled;
  }

  set sparkAssistantEnabled(value: boolean) {
    this._sparkAssistantEnabled = value;
    if (this._sparkAssistantEnabled || this.ftsw) {
      this.updateSparkAssistantEnabled();
    } else {
      this.optOutModal();
    }
  }

  public updateSparkAssistantEnabled() {
    if (this._sparkAssistantEnabled !== undefined) {
      this.SparkAssistantService.updateSpeechService(this._sparkAssistantEnabled)
      .then(() => {
        this.getSparkAssistantStatus();
      }).catch((error) => {
        this.Notification.errorWithTrackingId(error, 'globalSettings.sparkAssistant.failure');
      }).finally(() => {
        this.$state.go(this.$state.current, {}, {
          reload: true,
        });
      });
    }
  }

  public getSparkAssistantStatus(): void {
    this.SparkAssistantService.getSpeechServiceOptIn()
    .then(response => {
      this._sparkAssistantEnabled = _.get<boolean>(response, 'optIn');
      const status: string = _.get<string>(response, 'activationStatus').toUpperCase();
      this.inProgress = (status === ActivationStatusEnum.UNKNOWN);
      if (this.inProgress) {
        this.Notification.warning('globalSettings.sparkAssistant.progress');
        this.$state.go(this.$state.current, {}, {
          reload: true,
        });
      } else if (status === ActivationStatusEnum.ENABLED || status === ActivationStatusEnum.DISABLED) {
        this.Notification.success('globalSettings.sparkAssistant.success');
      } else if (status === 'UNKNOWN') {
        //TO-DO REMOVE this check once Api is ready, keeping current behavior
        this.Notification.success('globalSettings.sparkAssistant.success');
      }
    }).catch((error) => {
      this.Notification.errorWithTrackingId(error, 'globalSettings.sparkAssistant.failureGet');
    });
  }

  public optOutModal(): void {
    this.$modal.open({
      template: require('./spark-assistant-confirm.tpl.html'),
      type: 'dialog',
    })
      .result.then(() => {
        this.updateSparkAssistantEnabled();
      }).catch(() => {
        this._sparkAssistantEnabled = true;
      });
  }
}
