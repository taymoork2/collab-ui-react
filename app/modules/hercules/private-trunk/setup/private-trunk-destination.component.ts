import { PrivateTrunkPrereqService } from 'modules/hercules/private-trunk/prereq/private-trunk-prereq.service';
import { PrivateTrunkResource, Destination } from 'modules/hercules/private-trunk/setup/private-trunk-setup';
export interface IDestination {
  address: string;
  name: string;
}

export enum DestinationRadioType {
  NEW = <any>'new',
  HYBRID = <any>'hybrid',
}

const DOMAIN_MAXLENGTH = 253;

export class PrivateTrunkDestinationCtrl implements ng.IComponentController {
  public privateTrunkResource: PrivateTrunkResource;
  public destinationRadio: DestinationRadioType = DestinationRadioType.NEW;
  public errorMessages: { required: string, maxlength: string, pattern: string };
  public onChangeFn: Function;
  private error: { required: string };
  /* @ngInject */
  constructor(
    private PrivateTrunkPrereqService: PrivateTrunkPrereqService,
    private $translate: ng.translate.ITranslateService,
    private USSService,
    private Authinfo,
   ) {
    this.errorMessages = {
      required: this.$translate.instant('common.invalidRequired'),
      maxlength: this.$translate.instant('common.invalidMaxLength', {
        max: DOMAIN_MAXLENGTH,
      }),
      pattern: this.$translate.instant('servicesOverview.cards.privateTrunk.invalidChars'),
    };
    this.error = {
      required: this.$translate.instant('servicesOverview.cards.privateTrunk.hybridRequiredError'),
    };
  }
  public $onInit(): void {
    if (_.isUndefined(this.privateTrunkResource)) {
      this.privateTrunkResource = new PrivateTrunkResource();
      this.addDestination();
    }
    this.USSService.getOrg(this.Authinfo.getOrgId()).then(response => {
      this.privateTrunkResource.hybridDestination.address = response.sipDomain;
    });
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { privateTrunkResource } = changes;

    if (!_.isUndefined(privateTrunkResource)) {
      this.setPrivateTrunkResource(privateTrunkResource);
    }
  }

  public setPrivateTrunkResource(privateTrunkResource: ng.IChangesObject): void {
    this.privateTrunkResource = _.cloneDeep(privateTrunkResource.currentValue);
    if (!_.isUndefined(this.privateTrunkResource) && !_.isEmpty(this.privateTrunkResource.hybridDestination.name)) {
      this.destinationRadio = DestinationRadioType.HYBRID;
    }
  }

  public addDestination(): void {
    let dest = new Destination();
    this.privateTrunkResource.destinations.push(dest);
  }

  public delete(index): void {
    this.privateTrunkResource.destinations.splice(index, 1);
  }

  public dismiss(): void {
    this.PrivateTrunkPrereqService.dismissModal();
  }

  public changeDestination(index: number): void {
    if (this.privateTrunkResource.destinations[index].address) {
      let destination = this.privateTrunkResource.destinations[index];
      if ( !_.isEmpty(destination.address) && !_.isEmpty(destination.name)) {
        this.change();
      }
    }
  }

  public change(): void {
    if (this.destinationRadio === DestinationRadioType.NEW) {
      this.privateTrunkResource.hybridDestination.name = '';
    } else {
      this.privateTrunkResource.destinations.splice(0);
      this.addDestination();
    }
    this.onChangeFn ({
      privateTrunkResource: this.privateTrunkResource,
    });
  }

}
export class PrivateTrunkDestinationComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkDestinationCtrl;
  public templateUrl = 'modules/hercules/private-trunk/setup/private-trunk-destination.html';
  public bindings = {
    privateTrunkResource: '<',
    onChangeFn: '&',
  };
}
