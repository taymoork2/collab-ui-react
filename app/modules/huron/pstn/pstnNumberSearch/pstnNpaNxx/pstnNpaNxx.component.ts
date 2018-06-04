import {
  NumberModel, IAreaCodeOption, INxxOption,
} from '../number.model';
import {
  PstnAreaService, IAreaData, IArea, Area,
} from '../../pstnAreaService';
import { PstnService } from '../../pstn.service';
import { PstnModel } from '../../pstn.model';
import {
  NXX_EMPTY, MIN_BLOCK_QUANTITY, MAX_BLOCK_QUANTITY,
  NUMTYPE_TOLLFREE, NUMTYPE_DID,
} from '../../pstn.const';
import { Notification } from 'modules/core/notifications';


class PstnNpaNxxCtrl implements ng.IComponentController {
  //Passed-in Properties
  public model: NumberModel;
  public search: Function;
  public addToCart: Function;
  public numberType: string;
  public countryCode: string;
  //Ctrl Properties
  public area: IArea|null;
  public areas: IArea [];
  public areaLabel: string;

  /* @ngInject */
  constructor(
    private PstnModel: PstnModel,
    private PstnAreaService: PstnAreaService,
    private PstnService: PstnService,
    private Notification: Notification,
  ) {}

  public $onInit(): void {
    //load all the possiable areas
    this.PstnAreaService.getCountryAreas(this.countryCode).then((areaData: IAreaData) => {
      this.model.quantity = MIN_BLOCK_QUANTITY;
      this.areaLabel = areaData.typeName;
      this.areas = areaData.areas;
      if (this.numberType === NUMTYPE_DID) {
        //Try to set default Area Code (npa)
        const stateCode: string|undefined = _.get<string>(this.PstnModel.getServiceAddress(), 'state');
        if (stateCode) {
          const name: string = _.result<string>(_.find(this.areas, {
            abbreviation: stateCode,
          }), 'name');
          this.area = new Area(name, stateCode);
          this.getNpaInventory();
        }
      }
    });
  }

  public getNpaInventory(): void {
    if (this.area) {
      if (this.numberType === NUMTYPE_DID) {
        this.PstnService.getCarrierInventory(this.PstnModel.getProviderId(), this.area.abbreviation)
          .then((response) => this.setNpaModel(response))
          .catch((error) => this.Notification.errorResponse(error, 'pstnSetup.errors.states'));
      }
      if (this.numberType === NUMTYPE_TOLLFREE) {
        this.PstnService.getCarrierTollFreeInventory(this.PstnModel.getProviderId())
          .then(response => this.setNpaModel(response))
          .catch(error => this.Notification.errorResponse(error, 'pstnSetup.errors.states'));
      }
    }
  }

  private setNpaModel(response): void {
    this.model.areaCodeOptions = _.sortBy<IAreaCodeOption>(response.areaCodes, 'code');
    this.model.areaCode = null;
    this.model.areaCodeEnable = true;
    this.model.nxxOptions = null;
    this.model.nxx = null;
    this.model.nxxEnable = false;
    this.model.searchEnable = false;
    this.model.searchResults = [];
    this.model.showAdvancedOrder = false;
  }

  public getNxxInventory() {
    if (this.area && this.model.areaCode) {
      this.model.searchEnable = true;
      if (this.numberType === NUMTYPE_DID) {
        this.PstnService.getCarrierInventory(this.PstnModel.getProviderId(),
          this.area.abbreviation, this.model.areaCode.code)
          .then(response => this.setNxxModel(response))
          .catch(error => this.Notification.errorResponse(error, 'pstnSetup.errors.states'));
      }
    }
  }

  private setNxxModel(response): void {
    if (!_.isEmpty(response)) {
      this.model.nxxOptions = _.sortBy<INxxOption>(response.exchanges, 'code');
      this.model.nxxOptions.unshift({ code: NXX_EMPTY });
      this.model.nxx = this.model.nxxOptions[0];
      this.model.nxxEnable = true;
      this.model.searchResults = [];
      this.model.showAdvancedOrder = false;
    }
  }

  public onBlockClick() {
    if (this.model.block) {
      if (this.model.quantity == null) {
        this.model.quantity = MIN_BLOCK_QUANTITY;
      } else if (!(this.model.quantity >= MIN_BLOCK_QUANTITY && this.model.quantity <= MAX_BLOCK_QUANTITY)) {
        this.model.quantity = MIN_BLOCK_QUANTITY;
      }
    } else {
      this.model.quantity = MIN_BLOCK_QUANTITY;
      this.model.consecutive = false;
    }
  }

  public getNxxValue(): string | null {
    if (this.model.nxx) {
      if (this.model.nxx.code !== NXX_EMPTY) {
        return this.model.nxx.code;
      }
    }
    return null;
  }

  public getSearchValue(): string {
    let search: string = '';
    if (this.model.areaCode) {
      search = this.model.areaCode.code;
      const nxx = this.getNxxValue();
      if (nxx) {
        search += nxx;
      }
    }
    return search;
  }

  public getStateAbbreviation(): string {
    if (this.area) {
      this.model.stateAbbreviation = this.area.abbreviation;
    }
    return this.model.stateAbbreviation;
  }

  public onSearch(): void {
    this.search({
      value: this.getSearchValue(),
      block: this.model.block,
      quantity: this.model.quantity,
      consecutive: this.model.consecutive,
      stateAbbreviation: this.getStateAbbreviation(),
    });
  }
}

export class PstnNpaNxxComponent implements ng.IComponentOptions {
  public controller = PstnNpaNxxCtrl;
  public template = require('modules/huron/pstn/pstnNumberSearch/pstnNpaNxx/pstnNpaNxx.html');
  public bindings = {
    model: '<',
    search: '&',
    simple: '<',
    numberType: '<',
    countryCode: '<',
  };
}
