import { IExternalLinkedAccount } from '../../common/ExternalLinkedAccount';
export class CallConnectOptions implements ng.IComponentController {
  private dismiss: Function;
  private wizardData: {
    title: string,
    account: {
      cisUuid: string,
      enableCalService: boolean,
      entitlements: string[],
      externalLinkedAccounts: IExternalLinkedAccount[],
    },
    atlasHerculesGoogleCalendarFeatureToggle,
    atlasF237ResourceGroups
    function: string,
  };
  private static hybridCalluc = 'squared-fusion-uc';
  public mailID: string;
  public title: string;
  public isLoading: boolean = false;

  public resourceGroup: {
    selected?: { label: string, value: string },
    current?: { label: string, value: string },
    options: { label: string, value: string }[],
    shouldWarn: boolean,
    init: () => void,
  } = {
    init: () => {
      this.resourceGroup.options = [{
        label: this.$translate.instant('hercules.resourceGroups.noGroupSelected'),
        value: '',
      }];
      this.resourceGroup.selected = this.resourceGroup.current = this.resourceGroup.options[0];
      this.resourceGroup.shouldWarn = false;
    },
    options: [],
    shouldWarn: false,
  };

  /* @ngInject */
  constructor(private $stateParams, private Notification, private CsdmDataModelService, private ResourceGroupService, private USSService, private $translate) {
  }

  public $onInit() {
    this.wizardData = this.$stateParams.wizard.state().data;
    this.resourceGroup.init();
    this.title = this.wizardData.title;

    let existingHybridCallLink: IExternalLinkedAccount = _.head(_.filter(this.wizardData.account.externalLinkedAccounts, (linkedAccount) => {
      return linkedAccount && (linkedAccount.providerID === CallConnectOptions.hybridCalluc);
    }));
    if (existingHybridCallLink) {
      this.mailID = existingHybridCallLink.accountGUID;
    }

    this.fetchResourceGroups();
  }

  public hasNextStep() {
    return this.wizardData.function !== 'editServices' || this.wizardData.account.enableCalService;
  }

  public isNextDisabled() {
    return !(
    this.mailID
    && (this.resourceGroup.selected || !this.resourceGroup.options || this.resourceGroup.options.length === 0));
  }

  public isSaveDisabled() {
    return this.isNextDisabled();
  }

  public getResourceGroupShow() {
    return this.wizardData.atlasF237ResourceGroups && this.resourceGroup && this.resourceGroup.options.length > 0;
  }

  public next() {
    this.$stateParams.wizard.next({
      account: {
        externalHybridCallIdentifier: {
          providerID: CallConnectOptions.hybridCalluc,
          accountGUID: this.mailID,
          status: 'unconfirmed-email',
        },
        ussProps: this.getUssProps(),
      },
    }, this.wizardData.account.enableCalService ? 'calendar' : 'next');

  }

  public save() {
    this.isLoading = true;
    this.CsdmDataModelService.getPlacesMap().then((list) => {
      let place = _.find(_.values(list), { cisUuid: this.wizardData.account.cisUuid });
      if (place) {
        this.CsdmDataModelService.updateCloudberryPlace(
          place,
          this.wizardData.account.entitlements,
          null,
          null,
          [{
            providerID: CallConnectOptions.hybridCalluc,
            accountGUID: this.mailID,
            status: 'unconfirmed-mailid',
          }],
          null)
          .then(() => {
            let props = this.getUssProps();
            if (props) {
              this.USSService.updateUserProps(props).then(() => {
                this.dismiss();
                this.Notification.success('addDeviceWizard.editServices.servicesSaved');
              }, (error) => {
                this.isLoading = false;
                this.Notification.errorResponse(error, 'hercules.addResourceDialog.CouldNotSaveResourceGroup');
              });
            } else {
              this.dismiss();
              this.Notification.success('addDeviceWizard.editServices.servicesSaved');
            }
          }, (error) => {
            this.isLoading = false;
            this.Notification.errorResponse(error, 'addDeviceWizard.assignPhoneNumber.placeEditError');
          });
      } else {
        this.isLoading = false;
        this.Notification.warning('addDeviceWizard.assignPhoneNumber.placeNotFound');
      }
    }, (error) => {
      this.Notification.errorResponse(error, 'addDeviceWizard.assignPhoneNumber.placeEditError');
    });
  }

  public back() {
    this.$stateParams.wizard.back();
  }

  public close() {
    this.dismiss();
  }

  private fetchResourceGroups() {
    if (this.wizardData.atlasF237ResourceGroups) {
      this.ResourceGroupService.getAllAsOptions().then((options) => {
        if (options.length > 0) {
          this.resourceGroup.options = this.resourceGroup.options.concat(options);
          // if (this.wizardData.account.cisUuid) {
          //   this.USSService.getUserProps(this.wizardData.account.cisUuid).then((props) => {
          //     if (props.resourceGroups && props.resourceGroups[this.initialCalService]) {
          //       // this.resourceGroup.setSelectedResourceGroup(props.resourceGroups[this.initialCalService]);
          //     } else {
          //       // this.resourceGroup.displayWarningIfNecessary();
          //     }
          //   });
          // }
          //this.resourceGroup.updateShow();
        }
      });
    }
  }

  private getUssProps(): {}|null {
    if (this.resourceGroup.selected) {
      return {
        userId: this.wizardData.account.cisUuid,
        resourceGroups: { 'squared-fusion-uc': this.resourceGroup.selected.value },
      };
    }
    return null;
  }
}

export class CallConnectOptionsComponent implements ng.IComponentOptions {
  public controller = CallConnectOptions;
  public controllerAs = 'callConnectOptions';
  public templateUrl = 'modules/squared/places/callConnect/CallConnectOptions.tpl.html';
  public bindings = {
    dismiss: '&',
  };
}
