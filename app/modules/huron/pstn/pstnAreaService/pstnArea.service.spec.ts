import pstnAreaService from './index';
import {
  IAreaData,
  CCODE_CA,
  CCODE_US,
} from './index';

describe('Service: PstnAreaService', () => {
  const STATES_TOTAL: number  = 59;
  const PROVINCES_TOTAL: number = 13;

  beforeEach(function() {
    this.initModules(pstnAreaService);
    this.injectDependencies(
      'PstnAreaService',
      '$q',
      '$httpBackend',
      '$translate',
    );
  });

  afterEach( function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should create service', function () {
    expect(this.PstnAreaService).toExist();
  });

  it('should get areas for US', function () {
    this.PstnAreaService.getCountryAreas(CCODE_US).then(function (area: IAreaData) {
      expect(area.zipName).toEqual('pstnSetup.zip');
      expect(area.typeName).toEqual('pstnSetup.state');
      expect(area.areas.length).toEqual(STATES_TOTAL);
    });
  });

  it('should get areas for Canada', function () {
    this.PstnAreaService.getCountryAreas(CCODE_CA).then(function (area: IAreaData) {
      expect(area.zipName).toEqual('pstnSetup.postal');
      expect(area.typeName).toEqual('pstnSetup.province');
      expect(area.areas.length).toEqual(PROVINCES_TOTAL);
    });
  });

  it('should get areas for US for unknown countries', function () {
    this.PstnAreaService.getCountryAreas('ZZ').then(function (area: IAreaData) {
      expect(area.zipName).toEqual('pstnSetup.zip');
      expect(area.typeName).toEqual('pstnSetup.state');
      expect(area.areas.length).toEqual(STATES_TOTAL);
    });
  });
});
