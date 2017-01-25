import testModule from './index';
let base64 = require('base64-js');
let pako = require('pako');

describe('ExtractTarService', () => {

  function init() {
    this.initModules(testModule);
    this.injectDependencies(
      '$q',
      'ExtractTarService',
    );

    initDependencySpies.apply(this);
    installPromiseMatchers();
  }

  function initDependencySpies() {
    let tgz = base64.toByteArray(
      `H4sIAG3vgFgAA+3RQQrCMBCF4a49xVxAeWnT9DwiDQiCYEbQ2xttEdwUXBQR/m/zEjKLN8TH4tt8PI07v3mzDkkpRnvmkPpXqp3us95Cp6iQhi7JFOqxbUwr9flwLb6/1CqH4uf7wlwdy3nhfVrE3vknvP7/5tclAAAAAAAAAAAAAAAAAABfewA2RQ3eACgAAA==`
    );
    this.tarData = pako.inflate(tgz);
    this.tgzBlob = new Blob([tgz], { type: 'application/x-gzip' });
    this.tgzMd5 = '7f5f25b3c30fe90f2c712bdb9d4af034';
    this.tarFileBlob = new Blob(['TEST']);

    class MockFileReader {
      public result: any = _.get(global, 'fileReaderResult', tgz);
      public onloadend: Function = _.noop;
      public readAsArrayBuffer(_blob) {
        this.onloadend();
      }
    }
    this.OriginalFileReader = _.get(global, 'FileReader');
    _.set(global, 'FileReader', MockFileReader);

    this.untarSpy = spyOn(this.ExtractTarService, 'untar').and.callFake((_tarFile) => {
      return this.$q.resolve([
        { blob: this.tarFileBlob },
      ]);
    });
  }

  beforeEach(init);

  ///////////////////////

  it('should return contents of first file in the tar.gz', function (done) {

    let promise = this.ExtractTarService.extractFile(this.tgzBlob, this.tgzMd5)
      .then((fileBlob) => {
        expect(fileBlob).toEqual(this.tarFileBlob);
      })
      .finally(() => {
        _.defer(done);
      });

    expect(promise).toBeResolved();
  });

  it('should reject if checksums dont match', function () {
    let promise = this.ExtractTarService.extractFile(this.tgzBlob, 'invalidchecksum');
    expect(promise).toBeRejectedWith('checksum mismatch');
  });

  it('should reject if file is not valid', function () {
    _.set(global, 'fileReaderResult', []);
    let promise = this.ExtractTarService.extractFile([]);
    expect(promise).toBeRejectedWith('buffer error');
  });

  it('should reject if file not gzipped', function () {
    _.set(global, 'fileReaderResult', this.tarData);
    let promise = this.ExtractTarService.extractFile(this.tarData);
    expect(promise).toBeRejectedWith('incorrect header check');
  });

  it('should reject if file not a tar file', function () {
    let notTarFile = base64.toByteArray('H4sICLcwglgAA3Rlc3QudHh0AAtxDQ7hAgC+14P3BQAAAA==');
    _.set(global, 'fileReaderResult', notTarFile);

    this.untarSpy.and.callFake((_tarFile) => {
      return this.$q.reject('not a tar file');
    });

    let promise = this.ExtractTarService.extractFile(notTarFile);
    expect(promise).toBeRejectedWith('not a tar file');
  });
});
