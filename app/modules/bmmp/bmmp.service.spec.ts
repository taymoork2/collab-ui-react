import bmmpServiceModule from './index';

describe('Service: BmmpService', () => {
  beforeEach(function () {
    this.initModules(bmmpServiceModule);
    this.injectDependencies(
      'BmmpService',
      'Config',
      'SessionStorage',
      'StorageKeys',
    );
    spyOn(this.Config, 'getEnv').and.returnValue('prod');
  });

  afterEach(function () {
    this.SessionStorage.remove(this.StorageKeys.BMMP_ENV);
  });

  it('should return the BTS URL if bmmpEnv = bts', function () {
    this.SessionStorage.put(this.StorageKeys.BMMP_ENV, 'bts');
    expect(this.BmmpService.getBmmpUrl()).toBe('https://bmmpbts.ciscospark.com/api/v1');
  });

  it('should return the production URL for prod env with no bmmpEnv', function () {
    expect(this.BmmpService.getBmmpUrl()).toBe('https://bmmp.ciscospark.com/api/v1');
  });
});
