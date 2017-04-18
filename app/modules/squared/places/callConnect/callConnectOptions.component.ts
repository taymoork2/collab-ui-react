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
  private isFirstStep: boolean = false;

  public resourceGroup: {
    selected?: { label: string, value: string },
    current?: { label: string, value: string },
    options: { label: string, value: string }[],
    shouldWarn: boolean,
    show: boolean,
    init: () => void,
  } = {
    init: () => {
      this.resourceGroup.options = [{
        label: this.$translate.instant('hercules.resourceGroups.noGroupSelectedOnPlace'),
        value: '',
      }];
      this.resourceGroup.selected = this.resourceGroup.current = this.resourceGroup.options[0];
      this.resourceGroup.shouldWarn = false;
    },
    options: [],
    shouldWarn: false,
    show: false,
  };

  /* @ngInject */
  constructor(private $stateParams, private Notification, private CsdmDataModelService, private ResourceGroupService, private USSService, private $translate) {
  }

  public $onInit() {
    let state = this.$stateParams.wizard.state();
    this.wizardData = state.data;
    this.resourceGroup.init();
    this.title = this.wizardData.title;

    let existingHybridCallLink: IExternalLinkedAccount = _.head(_.filter(this.wizardData.account.externalLinkedAccounts, (linkedAccount) => {
      return linkedAccount && (linkedAccount.providerID === CallConnectOptions.hybridCalluc);
    }));
    if (existingHybridCallLink) {
      this.mailID = existingHybridCallLink.accountGUID;
    }

    this.fetchResourceGroups();

    this.isFirstStep = _.get(state, 'history.length') === 0;
  }

  public hasNextStep() {
    return this.wizardData.function !== 'editServices' || this.wizardData.account.enableCalService;
  }

  public hasBackStep() {
    return !this.isFirstStep;
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
    return this.wizardData.atlasF237ResourceGroups && this.resourceGroup && this.resourceGroup.show;
  }

  public submitForm() {
    if (this.hasNextStep()) {
      if (!this.isNextDisabled()) {
        this.next();
      }
    } else if (!this.isSaveDisabled()) {
      this.save();
    }
  }

  public next() {
    this.$stateParams.wizard.next(
      {
        account: {
          externalHybridCallIdentifier: this.getExtLinkedAccount(),
          ussProps: this.getUssProps(),
        },
      },
      this.wizardData.account.enableCalService ? 'calendar' : 'next');

  }

  private getExtLinkedAccount(): IExternalLinkedAccount[] {
    let newExtLink = {
      providerID: CallConnectOptions.hybridCalluc,
      accountGUID: this.mailID,
      status: 'unconfirmed-email',
    };
    let links: IExternalLinkedAccount[] = [];

    _.map(_.filter(this.wizardData.account.externalLinkedAccounts, (linkedAccount) => {
      return linkedAccount && (linkedAccount.providerID === CallConnectOptions.hybridCalluc);
    }), (link) => {
      link.operation = 'delete';
      links.push(link);
    });
    links.push(newExtLink);

    return links;
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
          this.getExtLinkedAccount(),
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
          if (this.wizardData.account.cisUuid) {
            this.USSService.getUserProps(this.wizardData.account.cisUuid).then((props) => {
              if (props.resourceGroups && props.resourceGroups[CallConnectOptions.hybridCalluc]) {
                let selectedGroup = _.find(this.resourceGroup.options, (group) => {
                  return group.value === props.resourceGroups[CallConnectOptions.hybridCalluc];
                });
                if (selectedGroup) {
                  this.resourceGroup.selected = selectedGroup;
                  this.resourceGroup.current = selectedGroup;
                }
              }
            });
          }
          this.resourceGroup.show = true;
        }
      });
    }
  }

  public setResourceGroup(group: string) {
    if (!group) {
      let selectedGroup = _.find(this.resourceGroup.options, (rgroup) => {
        return rgroup.value === '';
      });
      if (selectedGroup) {
        this.resourceGroup.selected = selectedGroup;
      }
    }
  }

  private getUssProps(): { userId: string, resourceGroups: { 'squared-fusion-uc': string } } | null {
    let isExistingPlaceOrNonEmptyRGroup = this.wizardData.account.cisUuid || (this.resourceGroup.selected && this.resourceGroup.selected.value);
    if (this.resourceGroup.selected && isExistingPlaceOrNonEmptyRGroup) {
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
