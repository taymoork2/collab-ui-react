import pstnNumberSearchName from './index';
import { NumberModel } from './number.model';
import { NUMTYPE_DID } from '../pstn.const';
import { CCODE_US, CCODE_CA, IAreaData } from '../pstnAreaService';

describe('Component: PstnNumberSearchComponent', () => {
  const customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  const customerCarrierList = getJSONFixture('huron/json/pstnSetup/customerCarrierList.json');
  const areas = getJSONFixture('../../app/modules/huron/pstn/pstnAreaService/states.json');
  const ADD_BUTTON = '.btn--people';
  const CHECKBOX = 'label.cs-checkbox';

  const areaData: IAreaData = {
    zipName: '_zipName',
    typeName: '_typeName',
    areas: areas,
  };

  beforeEach(function () {
    this.initModules(pstnNumberSearchName);
    this.injectDependencies(
      '$q',
      '$scope',
      '$rootScope',
      'PstnModel',
      'PstnAreaService',
    );
    this.$scope.model = new NumberModel();
    this.$scope.search = jasmine.createSpy('search');
    this.$scope.addToCart = jasmine.createSpy('addToCart');
    this.$scope.countryCode = CCODE_US;
  });

  function initComponent() {
    const bindings = {
      model: 'model',
      search: 'search(value)',
      addToCart: 'addToCart(searchResultModel)',
      numberType: NUMTYPE_DID,
      countryCode: 'countryCode',
    };
    this.compileComponent('ucPstnNumberSearch', bindings);
  }

  function initSpies() {
    this.PstnModel.setCustomerId(customer.uuid);
    this.PstnModel.setCustomerName(customer.name);
    this.PstnModel.setProvider(customerCarrierList[0]);
    spyOn(this.PstnAreaService, 'getCountryAreas').and.returnValue(this.$q.resolve(areaData));
  }

  describe('General CCODE_US -', function () {
    beforeEach(function () {
      this.$scope.countryCode = CCODE_US;
      this.$scope.model.searchResults = ['+1817-932-1111', '+1817-932-1112'];
    });
    beforeEach(initSpies);
    beforeEach(initComponent);

    it('should create component', function () {
      expect(this.controller).toExist();
    });

    it('should show detailed search', function () {
      expect(this.controller.isDetailSearchEnabled()).toEqual(true);
    });

    it('should call parent\'s addToCart from onAddToCart method', function () {
      this.view.find(CHECKBOX).get(0).click();
      this.view.find(ADD_BUTTON).get(0).click();
      this.controller.onAddToCart('NUMBER_ORDER');
      expect(this.$scope.addToCart).toHaveBeenCalled();
    });
  });

  describe('General CCODE_CA -', function () {
    beforeEach(function () {
      this.$scope.countryCode = CCODE_CA;
    });
    beforeEach(initSpies);
    beforeEach(initComponent);

    it('should show detailed search', function () {
      expect(this.controller.isDetailSearchEnabled()).toEqual(true);
    });
  });

  describe('General EU -', function () {
    beforeEach(function () {
      this.$scope.countryCode = 'ZZ';
    });
    beforeEach(initSpies);
    beforeEach(initComponent);

    it('should NOT show detailed search', function () {
      expect(this.controller.isDetailSearchEnabled()).toEqual(false);
    });
  });


});
