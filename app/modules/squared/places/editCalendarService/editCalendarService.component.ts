interface IExternalLinkedAccount {
  providerID: string;
  accountGUID: string;
}

class EditCalendarService implements ng.IComponentController {
  private dismiss: Function;
  public emailOfMailbox: string;
  private wizardData: {
    title: string,
    function: string,
    account: {
      entitlements,
      externalLinkedAccounts: IExternalLinkedAccount[],
      cisUuid,
      externalNumber,
      directoryNumber,
    },
    atlasHerculesGoogleCalendarFeatureToggle: boolean,
    atlasF237ResourceGroups: boolean,
  };
  private static fusionCal = 'squared-fusion-cal';
  private static fusionGCal = 'squared-fusion-gcal';
  public calService = '';
  private initialCalService;
  private isLoading: boolean;
  public externalCalendarIdentifier: string;
  public title: string;
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
  private showGCalService = false;
  private showExchangeService = false;

  public $onInit(): void {
    this.wizardData = this.$stateParams.wizard.state().data;
    this.resourceGroup.init();
    this.title = this.wizardData.title;
    this.initialCalService = this.getCalServiceEnabled(this.wizardData.account.entitlements);
    this.fetchResourceGroups();
  }

  /* @ngInject */
  constructor(private CsdmDataModelService, private $stateParams, private $translate, ServiceDescriptor, private ResourceGroupService, private Notification) {
    ServiceDescriptor.getServices()
      .then((services) => {
        let enabledServices: Array<{ id: string }> = ServiceDescriptor.filterEnabledServices(services);
        let calendarExchange = _.head(_.filter(enabledServices, x => x.id === EditCalendarService.fusionCal));
        let googleCal = _.head(_.filter(enabledServices, x => x.id === EditCalendarService.fusionGCal));
        this.showGCalService = !!googleCal && this.wizardData.atlasHerculesGoogleCalendarFeatureToggle;
        this.showExchangeService = !!calendarExchange;

        let existingCalLinks: IExternalLinkedAccount = _.head(_.filter(this.wizardData.account.externalLinkedAccounts, (linkedAccount) => {
          return linkedAccount && (linkedAccount.providerID === EditCalendarService.fusionCal || linkedAccount.providerID === EditCalendarService.fusionGCal);
        }));

        if (calendarExchange && this.showGCalService) {
          this.calService = '';
        } else {
          this.calService = this.showGCalService ? EditCalendarService.fusionGCal : EditCalendarService.fusionCal;
          this.showGCalService = false;
          this.showExchangeService = false;
        }
        if (existingCalLinks) {
          this.calService = existingCalLinks.providerID;
          this.emailOfMailbox = existingCalLinks.accountGUID;
        }
      });
  }

  private getUpdatedEntitlements() {
    let entitlements = (this.wizardData.account.entitlements || ['webex-squared', 'spark']);
    entitlements = _.difference(entitlements, [EditCalendarService.fusionCal, EditCalendarService.fusionGCal]);
    if (this.calService === EditCalendarService.fusionCal) {
      entitlements.push(EditCalendarService.fusionCal);
    } else if (this.calService === EditCalendarService.fusionGCal) {
      entitlements.push(EditCalendarService.fusionGCal);
    }
    return entitlements;
  }

  public getShowGCalService() {
    return this.showGCalService;
  }

  public getResourceGroupShow() {
    return this.wizardData.atlasF237ResourceGroups && this.resourceGroup && this.resourceGroup.options.length > 0;
  }

  public getShowCalService() {
    return this.showExchangeService;
  }

  public getShowServiceOptions() {
    return this.showExchangeService || this.showGCalService;
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

  public getCalServiceEnabled(entitlements) {
    let serviceEnabled = false;
    _.intersection(entitlements || [], [EditCalendarService.fusionCal, EditCalendarService.fusionGCal]).forEach((entitlement) => {
      switch (entitlement) {
        case EditCalendarService.fusionGCal:
        case EditCalendarService.fusionCal:
          serviceEnabled = true;
          break;
        default:
      }
    });
    return serviceEnabled;
  }

  public next() {
    this.$stateParams.wizard.next({
      account: {
        entitlements: this.getUpdatedEntitlements(),
        externalCalendarIdentifier: {
          providerID: this.calService,
          accountGUID: this.emailOfMailbox,
          status: 'unconfirmed-email',
        },
        ussProps: this.getUssProps(),
      },
    });
  }

  public isNextDisabled() {
    return !(
      this.calService
      && this.emailOfMailbox
      && (this.resourceGroup.selected || !this.resourceGroup.options || this.resourceGroup.options.length === 0)
    );
  }

  public isSaveDisabled() {
    return this.isNextDisabled();
  }

  public close() {
    this.dismiss();
  }

  public hasNextStep() {
    return this.wizardData.function !== 'editServices';
  }

  public back() {
    this.$stateParams.wizard.back();
  }

  public save() {
    this.isLoading = true;
    let directoryNumber = this.wizardData.account.directoryNumber || null;
    let externalNumber = this.wizardData.account.externalNumber || null;

    if (this.calService !== this.initialCalService) {
      this.CsdmDataModelService.getPlacesMap().then((list) => {
        let place = _.find(_.values(list), { cisUuid: this.wizardData.account.cisUuid });
        if (place) {
          this.CsdmDataModelService.updateCloudberryPlace(
            place,
            this.getUpdatedEntitlements(),
            directoryNumber,
            externalNumber,
            [{
              providerID: this.calService,
              accountGUID: this.emailOfMailbox,
              status: 'unconfirmed-email',
            }],
            this.getUssProps() || null)
            .then(() => {
              this.dismiss();
              this.Notification.success('addDeviceWizard.editServices.servicesSaved');
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
    } else {
      //TODO check if the email is the same.
      this.dismiss();
    }
  }

  private getUssProps(): {}|null {
    if (this.resourceGroup.selected) {
      return {
        userId: this.wizardData.account.cisUuid,
        resourceGroups: { 'squared-fusion-cal': this.resourceGroup.selected.value },
      };
    }
    return null;
  }
}

export class EditCalendarServiceOverviewComponent implements ng.IComponentOptions {
  public controller = EditCalendarService;
  public controllerAs = 'editCalendarService';
  public templateUrl = 'modules/squared/places/editCalendarService/editCalendarService.tpl.html';
  public bindings = {
    dismiss: '&',
  };
}
