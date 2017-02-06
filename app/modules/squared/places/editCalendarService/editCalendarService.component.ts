class EditCalendarService implements ng.IComponentController {
  private dismiss: Function;
  public emailOfMailbox: string;
  private wizardData;
  private static fusionCal = 'squared-fusion-cal';
  private static fusionGCal = 'squared-fusion-gcal';
  public calService = '';
  private initialCalService;
  private isLoading: boolean;
  public externalCalendarIdentifier: string;
  // private Notification;
  public title: string;
  public resourceGroup = '';
  public resourceGroupPlaceHolder = 'Select resource group';
  public availResourceGroups = [];
  public noAvailResourceGroups = true;
  private showGcalService = false;
  private showExchangeService = false;

  public $onInit(): void {
    this.wizardData = this.$stateParams.wizard.state().data;
    this.title = 'T e s t 1';
    this.title = this.wizardData.title;
    this.initialCalService = this.getCalServiceEnabled(this.wizardData.account.entitlements);
  }

  /* @ngInject */
  constructor(private CsdmDataModelService, private $stateParams, ServiceDescriptor) {
    ServiceDescriptor.getServices()
      .then((services) => {
        let enabledServices: Array<{ id: string }> = ServiceDescriptor.filterEnabledServices(services);
        let calendarExchange = _.head(_.filter(enabledServices, x => x.id === EditCalendarService.fusionCal));
        let googleCal = _.head(_.filter(enabledServices, x => x.id === EditCalendarService.fusionGCal));
        this.showGcalService = !!googleCal;
        this.showExchangeService = !!calendarExchange;
        if (!this.showGcalService || !this.showExchangeService) {
          this.calService = this.showExchangeService ? EditCalendarService.fusionCal : EditCalendarService.fusionGCal;
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

  public updateResourceGroup() {
    this.resourceGroup = this.resourceGroup;
  }

  public getShowGCalService() {
    return true; //this.showGcalService;
  }

  public getResourceGroupShow() {
    return true;
  }

  public getShowCalService() {
    return this.showExchangeService;
  }

  public getCalServiceEnabled(entitlements) {
    let serviceEnabled = false;
    _.intersection(entitlements || [], [EditCalendarService.fusionCal, EditCalendarService.fusionGCal]).forEach(function (entitlement) {
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
        externalCalendarIdentifier: { type: this.calService, email: this.emailOfMailbox }, //TODO email is wrong
        ussProps: { resourceGroup: this.resourceGroup },
      },
    });
  }

  public isNextDisabled() {
    return !(this.calService && this.emailOfMailbox && (this.resourceGroup || this.noAvailResourceGroups));
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
    if (this.calService !== this.initialCalService) {
      this.CsdmDataModelService.getPlacesMap().then(function (list) {
        let place = _.find(_.values(list), { cisUuid: this.wizardData.account.cisUuid });
        if (place) {
          this.CsdmDataModelService.updateCloudberryPlace(place, this.getUpdatedEntitlements())
            .then(function () {
              //TODO save email
              this.dismiss();
              this.Notification.success('addDeviceWizard.editServices.servicesSaved');
            }, function (error) {
              this.Notification.errorResponse(error, 'addDeviceWizard.assignPhoneNumber.placeEditError');
            });
        } else {
          this.isLoading = false;
          this.Notification.warning('addDeviceWizard.assignPhoneNumber.placeNotFound');
        }
      }, function (error) {
        this.Notification.errorResponse(error, 'addDeviceWizard.assignPhoneNumber.placeEditError');
      });
    } else {
      //TODO check if the email is the same.
      this.dismiss();
    }
  }
}

export class EditCalendarServiceOverviewComponent implements ng
  .
  IComponentOptions {
  public controller = EditCalendarService;
  public controllerAs = 'editCalendarService';
  public templateUrl = 'modules/squared/places/editCalendarService/editCalendarService.tpl.html';
  public bindings = {
    dismiss: '&',
    $stateParams: '<',
  };
}
