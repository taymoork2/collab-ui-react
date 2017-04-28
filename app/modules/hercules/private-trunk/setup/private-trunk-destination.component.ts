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
const DOMAIN_MAX_LENGTH = 253;
const MIN_PORT = 0;
const MAX_PORT = 65535;
export class PrivateTrunkDestinationCtrl implements ng.IComponentController {
  public privateTrunkResource: PrivateTrunkResource;
  public destinationRadio: DestinationRadioType = DestinationRadioType.NEW;
  public onChangeFn: Function;
  public errorMessages: Object;
  public privateTrunkDestinationform: ng.IFormController;
  public validators: Object;
  public validationMessages: Object;
  public isSetupFirstTime: boolean;

  /* @ngInject */
  constructor(
    private PrivateTrunkPrereqService: PrivateTrunkPrereqService,
    private $translate: ng.translate.ITranslateService,
    private USSService,
    private Authinfo,
  ) {}

  public $onInit(): void {
    this.isSetupFirstTime = false;
    if (_.isUndefined(this.privateTrunkResource)) {
      this.privateTrunkResource = new PrivateTrunkResource();
      this.addDestination();
      this.isSetupFirstTime = true;
    }
    this.USSService.getOrg(this.Authinfo.getOrgId()).then(response => {
      this.privateTrunkResource.hybridDestination.address = response.sipDomain;
    });

    this.errorMessages = {
      newAddress: {
        required: this.$translate.instant('common.invalidRequired'),
        pattern: this.$translate.instant('servicesOverview.cards.privateTrunk.error.invalidChars'),
        unique: this.$translate.instant('servicesOverview.cards.privateTrunk.error.invalidUniqueEntry'),
        maxlength: this.$translate.instant('servicesOverview.cards.privateTrunk.error.invalidMaxLength', {
          max: DOMAIN_MAX_LENGTH,
        }),
        portrange: this.$translate.instant('servicesOverview.cards.privateTrunk.error.invalidPort', {
          min: MIN_PORT,
          max: MAX_PORT,
        }),
      },
      name: {
        required: this.$translate.instant('common.invalidRequired'),
      },
      hybrid: {
        required: this.$translate.instant('servicesOverview.cards.privateTrunk.error.hybridRequired'),
      },
    };

    this.validators = {
      pattern: this.invalidCharactersValidation,
      // use arrow function here to auto-bind this
      unique: (viewValue: string) => this.uniqueDomainValidation(viewValue),
      maxlength: (viewValue: string) => this.domainlengthValidation(viewValue),
      portrange: (viewValue: string) => this.portValidation(viewValue),
    };

  }

  public isEmptyHybridAddress() {
    return _.isEmpty(this.privateTrunkResource.hybridDestination.address);
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
    this.isSetupFirstTime = true;
    this.privateTrunkResource.destinations.push(dest);
  }

  public delete(index): void {
    this.privateTrunkResource.destinations.splice(index, 1);
    this.changeSIPDestination();
  }

  public dismiss(): void {
    this.PrivateTrunkPrereqService.dismissModal();
  }

  public changeDestination(index: number): void {
    if (this.privateTrunkResource.destinations[index].address) {
      let destination = this.privateTrunkResource.destinations[index];
      if ( !_.isEmpty(destination.address) && !_.isEmpty(destination.name)) {
        this.isSetupFirstTime = true;
        this.changeSIPDestination();
      }
    }
  }

  public invalidCharactersValidation(viewValue: string) {
    let value = _.split(viewValue, ':', 2);
    let regex = new RegExp(/^[0-9a-zA-Z-_.]+$/g);
    return regex.test(value[0]);
  }

  public uniqueDomainValidation(viewValue: string): boolean {
    let isUnique = true;
    if (this.isSetupFirstTime) {
      isUnique =  _.indexOf(_.map(this.privateTrunkResource.destinations, (dest) => dest.address), viewValue) === -1;
    }
    return isUnique;
  }

  public portValidation(viewValue: string) {
    let port = _.split(viewValue, ':');
    return ((!_.isUndefined(port) && port.length > 1) ? _.inRange(_.toNumber(port[1]), 0, 65525) : true );
  }

  public domainlengthValidation(viewValue) {
    let value = _.split(viewValue, ':', 2);
    return value[0].length <= DOMAIN_MAX_LENGTH;
  }

  public changeSIPDestination(): void {
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
