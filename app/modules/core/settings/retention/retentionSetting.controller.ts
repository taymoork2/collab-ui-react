
export enum RETENTION_TYPES {
  INDEFINITE,
  DEFAULT,
  CUSTOM_MONTH,
}

export class RetentionSettingController {
  public dataLoaded = false;
  private orgId: string;
  public proPackPurchased = false;
  public RETENTION_TYPES = RETENTION_TYPES;

  // default is to keep until storage is full => -1
  public RETENTION_DEFAULT: string = '-1';

  public initialRetention: string = '';
  public selectedRetention: string = '';

  public selectedRetentionMonths: number | undefined = undefined;
  public selectedRetentionDefault: {
    value: string,
    label: string,
  };

  public validationMessages = {
    month: {
      required: this.$translate.instant('common.required'),
      min: this.$translate.instant('globalSettings.retention.monthInvalid'),
      max: this.$translate.instant('globalSettings.retention.monthInvalid'),
    },
  };

  public selectedRetentionType: RETENTION_TYPES;

  public retentionOptions = [{
    value: '90',
    label: this.$translate.instant('globalSettings.retention.retentionOption', { number: 3 }),
  }, {
    value: '180',
    label: this.$translate.instant('globalSettings.retention.retentionOption', { number: 6 }),
  }, {
    value: '360',
    label: this.$translate.instant('globalSettings.retention.retentionOption', { number: 12 }),
  }, {
    value: '720',
    label: this.$translate.instant('globalSettings.retention.retentionOption', { number: 24 }),
  }, {
    value: '1800',
    label: this.$translate.instant('globalSettings.retention.retentionOption', { number: 60 }),
  }];

  /* @ngInject */
  constructor(
    private $modal,
    private $q,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private Notification,
    private RetentionService,
    private ProPackService,
  ) {
    this.orgId = this.Authinfo.getOrgId();

    const promises = {
      retention: this.RetentionService.getRetention(this.orgId),
      proPackPurchased: this.ProPackService.hasProPackPurchasedOrNotEnabled(),
    };

    this.$q.all(promises)
      .then((response) => {
        this.proPackPurchased = response.proPackPurchased;
        const sparkDataRetentionDays = response.retention.sparkDataRetentionDays || this.RETENTION_DEFAULT;
        this.populateRetention(sparkDataRetentionDays);
      })
      .catch(_.noop)
      .finally(() => {
        this.dataLoaded = true;
      });
  }

  public resetSelectedRetention() {
    this.selectedRetentionDefault = {
      value: '',
      label: '',
    };
    this.selectedRetentionMonths = undefined;
    if (this.selectedRetentionType === RETENTION_TYPES.INDEFINITE) {
      this.updateRetention();
    }
  }
  private populateRetention(sparkDataRetentionDays) {

    this.selectedRetentionDefault = {
      value: '',
      label: '',
    };
    this.selectedRetentionMonths = undefined;
    this.selectedRetentionType = RETENTION_TYPES.INDEFINITE;
    this.initialRetention = this.RETENTION_DEFAULT;

    // default state - indefinite
    if (!sparkDataRetentionDays || _.isNaN(parseInt(sparkDataRetentionDays, 10)) || sparkDataRetentionDays === '-1') {
      return;
    }

    const retentionGuiOption = _.find(this.retentionOptions, { value: sparkDataRetentionDays });
    this.initialRetention = sparkDataRetentionDays;

    // matches the value in the dropdown of default options
    if (retentionGuiOption) {
      this.selectedRetentionType = RETENTION_TYPES.DEFAULT;
      this.selectedRetentionDefault = retentionGuiOption;
    } else {
      //custom months
      this.selectedRetentionMonths = (Math.floor(parseInt(sparkDataRetentionDays, 10) / 30));
      this.selectedRetentionType = RETENTION_TYPES.CUSTOM_MONTH;
    }
  }

  private getSelectedRetention(retentionType) {
    switch (retentionType) {
      case RETENTION_TYPES.DEFAULT: {
        return this.selectedRetentionDefault.value;
      }
      case RETENTION_TYPES.CUSTOM_MONTH: {
        return (Math.floor(this.selectedRetentionMonths || 0) * 30);
      }
      default: {
        return '-1';
      }
    }

  }

  private isNewRetentionShorter() {
    // if new retention indefinite -- we are good
    if (this.selectedRetentionType === RETENTION_TYPES.INDEFINITE) {
      return false;
    }
    // if old retention indefinite -- new must be shorter
    if (this.initialRetention === '-1') {
      return true;
    }
    // otherwise compare nnumbers
    return (Number(this.selectedRetention) < Number(this.initialRetention));
  }

  public updateRetention() {
    this.selectedRetention = this.getSelectedRetention(this.selectedRetentionType).toString();
    if (this.dataLoaded && this.selectedRetention && this.initialRetention) {
      // confirm if the selected time period is shorter
      if (this.isNewRetentionShorter()) {
        this.$modal.open({
          type: 'dialog',
          template: require('modules/core/settings/retention/confirmLowerRetention.tpl.html'),
          controllerAs: 'ctrl',
        }).result
          .then(() => { this.updateRetentionValue(); })
          .catch(() => {
            this.populateRetention(this.initialRetention); // revert changes if they close the modal
          });
      } else {
        this.updateRetentionValue();
      }
    }
  }

  private updateRetentionValue() {
    this.RetentionService.setRetention(this.orgId, this.selectedRetention)
      .then(() => {
        this.initialRetention = this.selectedRetention; // now initial is selected
        this.Notification.success('globalSettings.retention.notificationSuccess');
      })
      .catch((response) => {
        this.populateRetention(this.initialRetention); // revert the changes
        this.Notification.errorWithTrackingId(response, 'globalSettings.retention.notificationFailure');
      });
  }
}
