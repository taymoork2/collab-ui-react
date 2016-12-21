let pako = require('pako');
let md5 = require('js-md5');

/**
 * Service for extracting files from a tar.gz archive
 */
export class ExtractTarService {

  public untar: any;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private Log,
  ) {
    this.untar = require('js-untar');
  }

  // extract file from tar.gz file passed in the Blob, and compare it to the passed md5 checksum
  public extractFile(blob: Blob, expectedChecksum: string): ng.IPromise<any> {

    let promise = this.$q((resolve, reject) => {
      // decompress the tar.gz file
      try {
        let reader: FileReader = new FileReader();
        reader.onloadend = () => {
          let tarGz = new Uint8Array(reader.result);
          // calculate the md5 checksum for the tar.gz and make sure it matches what we expect
          let checksum = md5(tarGz);
          if (expectedChecksum && checksum !== expectedChecksum) {
            this.Log.error('Checksum mismatch on download');
            reject('checksum mismatch');
          } else {
            // reader.result has our gzip data as an ArrayBuffer. Decompress into our tar file
            let tarData = pako.inflate(tarGz);
            this.untar(tarData.buffer).then(
              (extractedFiles) => {
                // todo - handle multiple files. Currently, only the first file in the archive is saved
                let fileData = extractedFiles[0].blob;
                resolve(fileData);
              },
              (error) => {
                reject(error);
              }
            );
          }
        };
        reader.readAsArrayBuffer(blob);
      } catch (error) {
        reject(error);
      }
    });
    return promise;
  }

}
