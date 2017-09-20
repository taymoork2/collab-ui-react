import mediaMgrModule from './index';
import { IMedia } from './media-mgr.component';
import { IMediaUpload } from './media-mgr.component';
import { IVariantMetaDataResponse } from './media-mgr.service';

describe('Service: mediaMgrService', () => {
  beforeEach(function() {
    this.initModules(mediaMgrModule);
    this.injectDependencies(
      'MediaMgrService',
      'Authinfo',
      'HuronConfig',
      '$httpBackend',
      '$q',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');

  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Upload Functionality', function () {
    it('getMedia gets the response', function () {
      this.getMediaResponse = <IMedia> {
        mediaId: 'abcd-1234',
        mediaState: 'PROCESSING',
        filename: 'mock-file.mp3',
        description: 'mockdesc',
        displayName: 'mockfile',
        duration: '1:10',
        size: 571258,
        errorInfo: 'error code',
      };
      this.$httpBackend.expectGET(this.HuronConfig.getMmsUrl() + '/organizations/' + this.Authinfo.getOrgId() + '/media')
        .respond(200, this.getMediaResponse);
      this.MediaMgrService.getMedia()
        .then(response => {
          expect(response.mediaId).toEqual('abcd-1234');
        });
      this.$httpBackend.flush();
    });

    it('getUploadURL should POST and get AWS Url', function () {
      this.postMediaUpload = <IMediaUpload> {
        filename: 'media-upload.mp3',
        filesize: 31243,
        checksum: '2ca80224c6de3f27c3db8ebc8a7444b3',
      };
      this.postMediaUploadResponse = {
        orgId: '12345',
        mediaId: 'abcd-5678',
        filename: 'media-upload.mp3',
        displayName: 'media-upload',
        createTime: '2017-06-05T17:19:22.294Z',
        uploadUrlTtl: 900,
        uploadUrl: 'https://sparkcall-mms-int-us-east-1.s3.amazonaws.com/12345/abcd-5678/abcd-5678.raw?X-Amz-Credential=A2DA%2F205',
      };
      this.$httpBackend.expectPOST(this.HuronConfig.getMmsUrl() + '/organizations/' + this.Authinfo.getOrgId() + '/media')
        .respond(200, this.postMediaUploadResponse);
      this.MediaMgrService.getUploadUrl(this.postMediaUpload)
        .then(response => {
          expect(response.data.filename).toEqual(this.postMediaUploadResponse.filename);
        });
      this.$httpBackend.flush();
    });

    it('transcodeMedia should POST to variants', function () {
      this.$httpBackend.expectPOST(this.HuronConfig.getMmsUrl() + '/organizations/' + this.Authinfo.getOrgId() + '/media/abcd-5678/variants')
        .respond([200, {}]);
      this.MediaMgrService.transcodeMedia('abcd-5678', '2ca80224c6de3f27c3db8ebc8a7444b3')
        .then(response => {
          expect(response.status).toBe(200);
        });
      this.$httpBackend.flush();
    });

    it('upload file to url', function () {
      const blob = new Blob([''], { type: 'text/html' });
      const file = <File>blob;
      const uploadUrl = 'https://sparkcall-mms-int-us-east-1.s3.amazonaws.com/12345/abcd-5678/abcd-5678.raw?X-Amz-Credential=A2DA%2F205';
      this.$httpBackend.expectPUT(uploadUrl)
      .respond(200);
      this.MediaMgrService.uploadToUrl(file, uploadUrl)
        .then(response => {
          expect(response.status).toBe(200);
        });
      this.$httpBackend.flush();
    });

    it('UploadMedia Function', function () {
      const blob = new Blob([''], { type: 'text/html' });
      this.mediaUpload = <IMediaUpload> {
        file: <File>blob,
        filename: 'media-upload-file.mp3',
        filesize: 31243,
        checksum: '5fa90136c6de3f27c3db7sbw9q7491m2',
      };

      this.uploadMetaDataResponse = {
        data: {
          file: <File>blob,
          mediaId: 'abcd-5678',
          orgId: '12345',
          filename: 'media-upload.mp3',
          displayName: 'media-upload',
          createTime: '2017-06-05T17:19:22.294Z',
          uploadUrlTtl: 900,
          uploadUrl: 'https://sparkcall-mms-int-us-east-1.s3.amazonaws.com/12345/abcd-5678/abcd-5678.raw?X-Amz-Credential=A2DA%2F205',
        },
      };

      spyOn(this.MediaMgrService, 'getUploadUrl').and.returnValue(this.$q.resolve(this.uploadMetaDataResponse));
      spyOn(this.MediaMgrService, 'uploadToUrl').and.returnValue(this.$q.resolve());
      spyOn(this.MediaMgrService, 'transcodeMedia').and.returnValue(this.$q.resolve());

      this.MediaMgrService.uploadMedia(this.mediaUpload);
      expect(this.MediaMgrService.getUploadUrl).toHaveBeenCalledWith(this.mediaUpload);

    });
  });

  describe('Download Functionality', function () {
    afterEach(function () {
      this.$httpBackend.flush();
    });
    it('downloadFromUrl Function', function () {

      this.media = <IMedia> {
        mediaId: 'abcd-5678',
        mediaState: 'AVAILABLE',
        filename: 'media-upload.mp3',
        description: 'This is my media that was uploaded.',
        displayName: 'media-upload',
        duration: '1:10',
        size: 31243,
        errorInfo: 'error code',
      };

      this.getVariantData = <IVariantMetaDataResponse> {
        createTime: 'Fri Jul 28 17:46:13 UTC 2017',
        downloadUrl: 'https://sparkcall-mms-int-us-east-1.s3.amazonaws.com/12345/abcd-5678/abcd-5678.raw?X-Amz-Credential=A2DA%2F205',
        encoding: 'raw',
        lastModifyTime: 'Fri Jul 28 17:46:17 UTC 2017',
        locale: 'en_US',
        md5Sum: '2ca80224c6de3f27c3db8ebc8a7444b3',
        mediaId: 'abcd-5678',
        size: 31243,
        state: 'UPLOADED',
        transcodeJobId: '',
        variantId: 'abcd-5678',
      };

      const data = new ArrayBuffer(31243);

      this.$httpBackend.expectGET(this.HuronConfig.getMmsUrl() + '/organizations/' + this.Authinfo.getOrgId() + '/media/abcd-5678/variants/abcd-5678')
        .respond(200, this.getVariantData);
      this.$httpBackend.expectGET(this.getVariantData.downloadUrl)
        .respond(200, data);

      this.MediaMgrService.downloadFromUrl(this.media)
      .then(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Delete Functionality', function () {
    beforeEach(function () {
      this.deleteMedia = {
        mediaId: 'abcd-4040',
      };
    });
    afterEach(function () {
      this.$httpBackend.flush();
    });

    it('deleteMedia should delete a specific media', function () {
      this.$httpBackend.expectDELETE(this.HuronConfig.getMmsUrl() + '/organizations/' + this.Authinfo.getOrgId() + '/media/abcd-4040')
        .respond([200, {}]);
      this.MediaMgrService.deleteMedia(this.deleteMedia)
        .then(response => {
          expect(response.status).toBe(200);
        });
    });

    it('deletePermAll should permanently delete all media', function () {
      this.$httpBackend.expectDELETE(this.HuronConfig.getMmsUrl() + '/organizations/' + this.Authinfo.getOrgId() + '/media')
        .respond(204);
      this.MediaMgrService.deletePermAll()
        .then(response => {
          expect(response.status).toBe(204);
        });
    });

    it('deletePermMedia should permanently delete a media', function () {
      this.$httpBackend.expectDELETE(this.HuronConfig.getMmsUrl() + '/organizations/' + this.Authinfo.getOrgId() + '/media/abcd-4040?permanent=true')
        .respond(204);
      this.MediaMgrService.deletePermMedia(this.deleteMedia)
        .then(response => {
          expect(response.status).toBe(204);
        });
    });
  });
});
