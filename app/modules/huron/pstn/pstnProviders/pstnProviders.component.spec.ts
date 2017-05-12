import pstnProviders from './index';
import { PstnCarrier } from './pstnCarrier';

describe('Component: PstnProvidersComponent', () => {
  let pstnCarriers: Array<PstnCarrier>;

  beforeEach( function () {
    this.initModules(pstnProviders);
    this.injectDependencies(
      '$q',
      'PstnModel',
      'PstnProvidersService',
    );

    pstnCarriers = [];
    pstnCarriers.push(new PstnCarrier());
    pstnCarriers[0].name = 'Tester Carrier 1';
    pstnCarriers[0].title = pstnCarriers[0].name;

    pstnCarriers.push(new PstnCarrier());
    pstnCarriers[1].name = 'Tester Carrier 2';
    pstnCarriers[1].title = pstnCarriers[1].name;
    spyOn(this.PstnProvidersService, 'getCarriers').and.returnValue(this.$q.resolve(pstnCarriers));

    this.compileComponent('ucPstnProviders', {});
  });

  it('should initialize correctly', function () {
    expect(this.controller.show).toEqual(true);
  });

  it('should set a provider', function () {
    this.controller.onSetProvider(pstnCarriers[0]);
    expect(pstnCarriers[0].selected).toEqual(true);
    expect(pstnCarriers[1].selected).toEqual(false);
    expect(this.PstnModel.getProvider()).toEqual(pstnCarriers[0]);
  });

});
