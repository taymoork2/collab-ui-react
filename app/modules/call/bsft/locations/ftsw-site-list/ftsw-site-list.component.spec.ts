import testModule from './index';
import { CoreEvent } from 'modules/core/shared/event.constants';

describe('Component: ftsw-site-list', () => {
  const SITE = {
    name: 'Test Site',
    uuid: 'testSite',
  };

  const SITE_LIST = [{
    name: 'site_1',
    licenses: {
      standard: 5,
      places: 5,
    },
  }, {
    name: 'site_2',
    licenses: {
      standard: 5,
      places: 5,
    },
  }];

  const LICENSE_INFO_BEFORE = [{
    name: 'standard',
    total: 100,
  }, {
    name: 'places',
    total: 100,
  }];

  const LICENSE_INFO_AFTER = [{
    name: 'standard',
    available: 90,
    total: 100,
  }, {
    name: 'places',
    available: 90,
    total: 100,
  }];

  beforeEach(function () {
    this.initModules(testModule, 'Core');
    this.injectDependencies(
      '$modal',
      '$translate',
      'FtswConfigService',
      '$scope',
    );

    spyOn(this.$translate, 'instant').and.callThrough();
    spyOn(this.$modal, 'open').and.callThrough();
    spyOn(this.FtswConfigService, 'getSites').and.returnValue(SITE_LIST);
    spyOn(this.FtswConfigService, 'setEditSite');
    spyOn(this.FtswConfigService, 'getLicensesInfo').and.returnValue(LICENSE_INFO_BEFORE);
    this.$scope.ftsw = true;
    this.compileComponent('ftswSiteList', {
      ftsw: 'ftsw',
    });
    spyOn(this.controller.$scope, '$emit').and.callThrough();
    this.$scope.$apply();
  });

  it('get sites should call ftsw configuration function', function () {
    this.controller.getSites();
    expect(this.FtswConfigService.getSites).toHaveBeenCalled();
  });

  it('add location should emit message', function () {
    this.controller.addLocation();
    expect(this.controller.$scope.$emit).toHaveBeenCalledWith(CoreEvent.WIZARD_TO_STEP, 'setupBsft');
  });

  it('cardSelected should set editSite in service and emit message', function () {
    this.controller.cardSelected(SITE);
    expect(this.FtswConfigService.setEditSite).toHaveBeenCalledWith(SITE);
    expect(this.controller.$scope.$emit).toHaveBeenCalledWith(CoreEvent.WIZARD_TO_STEP, 'setupBsft');
  });

  it('getLicensesInfo should call ftsw getLicensesInfo function and the available count needs to be correct', function () {
    const licenseInfo = this.controller.getLicensesInfo();
    expect(this.FtswConfigService.getLicensesInfo).toHaveBeenCalled();
    expect(licenseInfo).toEqual(LICENSE_INFO_AFTER);
  });
});
