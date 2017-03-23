import { IExternalLinkedAccount } from '../../common/ExternalLinkedAccount';

class EditCalendarService implements ng.IComponentController {
  private dismiss: Function;
  public emailOfMailbox: string;
  private initialMailBox: string;
  private wizardData: {
    title: string,
    function: string,
    account: {
      entitlements,
      externalLinkedAccounts: IExternalLinkedAccount[],
      cisUuid,
      externalNumber,
      directoryNumber,
      ussProps,
    },
    atlasHerculesGoogleCalendarFeatureToggle: boolean,
    atlasF237ResourceGroups: boolean,
  };
  private static fusionCal = 'squared-fusion-cal';
  private static fusionGCal = 'squared-fusion-gcal';
  public calService = '';
  private initialCalService: string;
  private isLoading: boolean;
  public externalCalendarIdentifier: string;
  public title: string;
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
  private showGCalService = false;
  private showExchangeService = false;

  public $onInit(): void {
    this.wizardData = this.$stateParams.wizard.state().data;
    this.resourceGroup.init();
    this.title = this.wizardData.title;
    this.initialCalService = this.getCalService(this.wizardData.account.entitlements);
    this.fetchResourceGroups();
  }

  /* @ngInject */
  constructor(private CsdmDataModelService, private $stateParams, private $translate, ServiceDescriptor, private ResourceGroupService, private USSService, private Notification) {
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
          this.initialMailBox = existingCalLinks.accountGUID;
          this.emailOfMailbox = existingCalLinks.accountGUID;
        }
      });
  }

  private getUpdatedEntitlements() {
    let entitlements = (this.wizardData.account.entitlements || ['webex-squared']);
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
    return this.wizardData.atlasF237ResourceGroups && this.resourceGroup && this.resourceGroup.show;
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
          if (this.wizardData.account.cisUuid && this.initialCalService) {
            this.USSService.getUserProps(this.wizardData.account.cisUuid).then((props) => {
              if (props.resourceGroups && props.resourceGroups[this.initialCalService]) {
                let selectedGroup = _.find(this.resourceGroup.options, (group) => {
                  return group.value === props.resourceGroups[this.initialCalService];
                });
                if (selectedGroup) {
                  this.resourceGroup.selected = selectedGroup;
                  this.resourceGroup.current = selectedGroup;
                }
              } else {
              }
            });
          }
          this.resourceGroup.show = true;
        }
      });
    }
  }

  private getCalService(entitlements) {
    return _.head(_.intersection(entitlements || [], [EditCalendarService.fusionCal, EditCalendarService.fusionGCal]));
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
          }])
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

  private getUssProps(): {} | null {
    let props = this.wizardData.account.ussProps || null;
    if (this.resourceGroup.selected) {
      let resourceGroups = (props && props.resourceGroups) || {};
      _.merge(resourceGroups, { 'squared-fusion-cal': this.resourceGroup.selected.value });
      return {
        userId: this.wizardData.account.cisUuid,
        resourceGroups: resourceGroups,
      };
    }
    return props;
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
