import pstnNpaNxxName from './index';
import { NumberModel } from '../number.model';
import {
  NUMTYPE_DID, MIN_BLOCK_QUANTITY, MAX_BLOCK_QUANTITY, NXX_EMPTY,
} from '../../pstn.const';
import { IAreaData } from '../../pstnAreaService';
import { CCODE_US } from '../../pstnAreaService';

describe('Component: PstnNpaNxxComponent', () => {
  const customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  const customerCarrierList = getJSONFixture('huron/json/pstnSetup/customerCarrierList.json');
  const areas = getJSONFixture('../../app/modules/huron/pstn/pstnAreaService/states.json');

  const inventory = {
    areaCodes: [{
      code: '123',
      count: 15,
    }, {
      code: '456',
      count: 30,
    }],
    exchanges: [{
      code: '987',
    }, {
      code: '789',
    }],
  };

  const areaData: IAreaData = {
    zipName: '_zipName',
    typeName: '_typeName',
    areas: areas,
  };

  const serviceAddress = {
    address1: '123 example st',
    address2: '',
    city: 'Sample',
    state: 'TX',
    zip: '77777',
  };

  beforeEach(function () {
    this.initModules(pstnNpaNxxName);
    this.injectDependencies(
      '$q',
      '$scope',
      '$rootScope',
      '$translate',
      'PstnModel',
      'PstnService',
      'PstnAreaService',
      'Notification',
    );
    this.$scope.model = new NumberModel();
    this.$scope.search = jasmine.createSpy('search');
    this.$scope.addToCart = jasmine.createSpy('addToCart');
    this.$scope.numberType = NUMTYPE_DID;
    this.$scope.countryCode = CCODE_US;
  });

  function initComponent() {
    this.compileComponent('ucPstnNpaNxx', {
      model: 'model',
      search: 'search(value)',
      addToCart: 'addToCart(searchResultModel)',
      numberType: 'numberType',
      countryCode: 'countryCode',
    });
  }

  function initSpies() {
    this.PstnModel.setCustomerId(customer.uuid);
    this.PstnModel.setCustomerName(customer.name);
    this.PstnModel.setProvider(customerCarrierList[0]);
    this.PstnModel.setCountryCode(CCODE_US);
    this.PstnModel.setServiceAddress(serviceAddress);
    spyOn(this.PstnService, 'getCarrierInventory').and.returnValue(this.$q.resolve(inventory));
    spyOn(this.PstnAreaService, 'getCountryAreas').and.returnValue(this.$q.resolve(areaData));
    spyOn(this.Notification, 'errorResponse');
  }

  describe('General -', function () {
    beforeEach(initSpies);
    beforeEach(initComponent);

    it('should create component', function () {
      expect(this.controller).toExist();
    });

    it('should set default area', function () {
      expect(this.controller.area.abbreviation).toEqual(serviceAddress.state);
    });

    it('should get NPA inventory', function () {
      this.controller.getNpaInventory();
      expect(this.PstnService.getCarrierInventory).toHaveBeenCalled();
      this.$rootScope.$digest();
      expect(this.controller.model.areaCodeOptions.length).toEqual(inventory.areaCodes.length);
    });

    it('should report an error on get NPA inventory', function () {
      this.PstnService.getCarrierInventory.and.returnValue(this.$q.reject());
      this.controller.getNpaInventory();
      expect(this.PstnService.getCarrierInventory).toHaveBeenCalled();
      this.$rootScope.$digest();
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });

    it('should get NXX inventory', function () {
      this.controller.model.areaCode = inventory.areaCodes[0];
      this.controller.getNxxInventory();
      expect(this.PstnService.getCarrierInventory).toHaveBeenCalled();
      this.$rootScope.$digest();
      expect(this.controller.model.nxxOptions.length).toEqual(inventory.exchanges.length + 1);
    });

    it('should report an error on get NXX inventory', function () {
      this.controller.model.areaCode = inventory.areaCodes[0];
      this.PstnService.getCarrierInventory.and.returnValue(this.$q.reject());
      this.controller.getNxxInventory();
      expect(this.PstnService.getCarrierInventory).toHaveBeenCalled();
      this.$rootScope.$digest();
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });

    it('should reset the quantity if invalid values are entered', function () {
      this.controller.model.block = true;
      this.controller.model.quantity = MIN_BLOCK_QUANTITY - 1;
      this.controller.onBlockClick();
      expect(this.controller.model.quantity).toEqual(MIN_BLOCK_QUANTITY);

      this.controller.model.quantity = MAX_BLOCK_QUANTITY + 1;
      this.controller.onBlockClick();
      expect(this.controller.model.quantity).toEqual(MIN_BLOCK_QUANTITY);

      this.controller.model.block = false;
      this.controller.model.quantity = MAX_BLOCK_QUANTITY;
      this.controller.onBlockClick();
      expect(this.controller.model.quantity).toEqual(MIN_BLOCK_QUANTITY);
    });

    it('should call search', function () {
      this.controller.onSearch();
      expect(this.$scope.search).toHaveBeenCalled();
    });

    it('should create correct search value', function () {
      let searchValue = inventory.areaCodes[1].code + inventory.exchanges[0].code;
      this.controller.model.areaCode = inventory.areaCodes[1];
      this.controller.model.nxx = { code: inventory.exchanges[0].code };
      expect(this.controller.getSearchValue()).toEqual(searchValue);

      searchValue = inventory.areaCodes[1].code;
      this.controller.model.areaCode = inventory.areaCodes[1];
      this.controller.model.nxx = { code: NXX_EMPTY };
      expect(this.controller.getSearchValue()).toEqual(searchValue);

      searchValue = inventory.areaCodes[0].code;
      this.controller.model.areaCode = inventory.areaCodes[0];
      this.controller.model.nxx = null;
      expect(this.controller.getSearchValue()).toEqual(searchValue);
    });
  });

});
