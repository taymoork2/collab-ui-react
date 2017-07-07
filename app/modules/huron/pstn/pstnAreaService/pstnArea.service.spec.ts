import pstnAreaService from './index';
import {
  IArea,
  IAreaData,
  JSON_CA,
  JSON_US,
  CCODE_CA,
  CCODE_US,
} from './index';

const areas: IArea[] = [{
  name: 'Alabama',
  abbreviation: 'AL',
}, {
  name: 'Alaska',
  abbreviation: 'AK',
}];

describe('Service: PstnAreaService', () => {
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
    this.$httpBackend.expectGET(JSON_US).respond(200, areas);
    this.PstnAreaService.getCountryAreas(CCODE_US).then(function (area: IAreaData) {
      expect(area.zipName).toEqual('pstnSetup.zip');
      expect(area.typeName).toEqual('pstnSetup.state');
      expect(area.areas.length).toEqual(areas.length);
    });
    this.$httpBackend.flush();
  });

  it('should get areas for Canada', function () {
    this.$httpBackend.expectGET(JSON_CA).respond(200, areas);
    this.PstnAreaService.getCountryAreas(CCODE_CA).then(function (area: IAreaData) {
      expect(area.zipName).toEqual('pstnSetup.postal');
      expect(area.typeName).toEqual('pstnSetup.province');
      expect(area.areas.length).toEqual(areas.length);
    });
    this.$httpBackend.flush();
  });

  it('should get areas for US for unknown countries', function () {
    this.$httpBackend.expectGET(JSON_US).respond(200, areas);
    this.PstnAreaService.getCountryAreas('ZZ').then(function (area: IAreaData) {
      expect(area.zipName).toEqual('pstnSetup.zip');
      expect(area.typeName).toEqual('pstnSetup.state');
      expect(area.areas.length).toEqual(areas.length);
    });
    this.$httpBackend.flush();
  });
});
