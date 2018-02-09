import deviceBrandingModule from './index';

describe('DeviceBrandingSettingCtrl', () => {
  beforeEach(function () {
    this.superhash = 2;
    this.initModules(deviceBrandingModule);
    this.injectDependencies('$scope', '$controller', '$q', '$httpBackend', 'Notification', 'Authinfo', 'LogMetricsService', 'UrlConfig', '$rootScope', 'Upload');
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'errorResponse');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  function initComponent(bindings) {
    this.compileComponent('deviceBrandingSetting', _.assignIn({}, bindings));
    this.$httpBackend.flush();
  }

  const imageFile = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUp/hOeZ81YAAAACklEQVQIW2NgAAAAAgABYkBPaAAAAABJRU5ErkJggg==';

  describe('with existing branding', () => {
    let lightLogoUrl, darkLogoUrl, halfwakeLogoUrl, notifyUrl;
    beforeEach(function () {
      lightLogoUrl = this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/config/files/8AAFF7C25CCE77B2015CCE77E5050001';
      darkLogoUrl = this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/config/files/8AAFF7C25CCE77B2015CCE77E5050003';
      halfwakeLogoUrl = this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/config/files/8AAFF7C25CCE77B2015CCE77E5050009';
      notifyUrl = this.UrlConfig.getCsdmServiceUrl() + '/organization/' + this.Authinfo.getOrgId() + '/devices/update';
      this.$httpBackend.whenGET(this.UrlConfig.getLyraServiceUrl() + '/configuration/rules/organization/' + this.Authinfo.getOrgId() + '/userinterface.halfwakebackground')
        .respond(200, {
          value: { url: halfwakeLogoUrl },
        });
      this.$httpBackend.whenGET(this.UrlConfig.getLyraServiceUrl() + '/configuration/rules/organization/' + this.Authinfo.getOrgId() + '/userinterface.halfwakebranding')
        .respond(200, {
          value: { url: lightLogoUrl },
        });
      this.$httpBackend.whenGET(this.UrlConfig.getLyraServiceUrl() + '/configuration/rules/organization/' + this.Authinfo.getOrgId() + '/userinterface.branding')
        .respond(200, {
          value: { url: darkLogoUrl },
        });
      this.$httpBackend.whenGET(lightLogoUrl + '/tempUrl').respond(200, { tempURL: 'light URL' });
      this.$httpBackend.whenGET(darkLogoUrl + '/tempUrl').respond(200, { tempURL: 'dark URL' });
      this.$httpBackend.whenGET(halfwakeLogoUrl + '/tempUrl').respond(200, { tempURL: 'halfwake URL' });
    });
    describe('on init', () => {
      beforeEach(function () {
        initComponent.apply(this);
      });
      it('should fetch settings and set imgFileUrls', function () {
        expect(this.controller.logolight.origUrl).toBe(lightLogoUrl);
        expect(this.controller.logodark.origUrl).toBe(darkLogoUrl);
        expect(this.controller.halfwakeBackground.origUrl).toBe(halfwakeLogoUrl);

        expect(this.controller.logolight.tempDownloadUrl).toBe('light URL');
        expect(this.controller.logodark.tempDownloadUrl).toBe('dark URL');
        expect(this.controller.halfwakeBackground.tempDownloadUrl).toBe('halfwake URL');
      });

      it('should set use partner to false', function () {
        expect(this.controller.useDefaultBranding).toBe(false);
      });

      describe('-> set to use partner', () => {
        beforeEach(function () {
          this.controller.useDefaultBranding = false;
        });
      });

      describe('add images', () => {
        beforeEach(function () {
          this.controller.useDefaultBranding = false;
          this.controller.logodark.file = imageFile;
          this.controller.logolight.file = imageFile;
          this.controller.halfwakeBackground.file = imageFile;
        });

        it('should set changed to true', function () {
          expect(this.controller.changeInBranding()).toBe(true);
          expect(this.controller.applyAllowed()).toBe(true);
        });

        describe('-> save setting', () => {

          describe('with full success', () => {

            beforeEach(function () {
              [1, 2, 3].forEach((i) => {
                //should fetch 3x url
                const uploadUrl = '8AAFF7C25CCE77B2015CCE77E505001' + i + 'up';
                this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/config/files/').respond(204, {
                  tempURL: '8AAFF7C25CCE77B2015CCE77E505001' + i + 'temp',
                  downloadUrl: '8AAFF7C25CCE77B2015CCE77E505001' + i + 'down',
                  uploadUrl: uploadUrl,
                });

                //should upload 3x images
                this.$httpBackend.whenPUT(uploadUrl).respond(204);
              });

              // should save branding
              this.$httpBackend.expectPUT(this.UrlConfig.getLyraServiceUrl() + '/configuration/rules/organization/' + this.Authinfo.getOrgId() + '/userinterface.halfwakebackground')
                .respond(204, {
                  value: { url: 'halfwakelogo2' },
                });
              this.$httpBackend.expectPUT(this.UrlConfig.getLyraServiceUrl() + '/configuration/rules/organization/' + this.Authinfo.getOrgId() + '/userinterface.halfwakebranding')
                .respond(204, {
                  value: { url: 'lightlogo2' },
                });
              this.$httpBackend.expectPUT(this.UrlConfig.getLyraServiceUrl() + '/configuration/rules/organization/' + this.Authinfo.getOrgId() + '/userinterface.branding')
                .respond(204, {
                  value: { url: 'darklogo2' },
                });

              //should delete old files
              this.$httpBackend.expectDELETE(halfwakeLogoUrl).respond(204);
              this.$httpBackend.expectDELETE(lightLogoUrl).respond(204);
              this.$httpBackend.expectDELETE(darkLogoUrl).respond(204);

              //should notify all devices
              this.$httpBackend.expectPOST(notifyUrl).respond(200);

              //perform
              this.controller.applyBranding();
              this.$httpBackend.flush();
            });

            it('should delete old files and not show error1', function () {
              expect(this.Notification.errorResponse).not.toHaveBeenCalled();
            });
          });
        });
      });

      describe('add one image', () => {
        beforeEach(function () {
          this.controller.useDefaultBranding = false;
          this.controller.logodark.file = imageFile;
        });

        it('should set changed to true', function () {
          expect(this.controller.changeInBranding()).toBe(true);
          expect(this.controller.applyAllowed()).toBe(true);
        });

        describe('-> save setting', () => {

          describe('with full success', () => {

            beforeEach(function () {
              [1].forEach((i) => {
                //should fetch 3x url
                const uploadUrl = '8AAFF7C25CCE77B2015CCE77E505001' + i + 'up';
                this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/config/files/').respond(204, {
                  tempURL: '8AAFF7C25CCE77B2015CCE77E505001' + i + 'temp',
                  downloadUrl: '8AAFF7C25CCE77B2015CCE77E505001' + i + 'down',
                  uploadUrl: uploadUrl,
                });

                //should upload 3x images
                this.$httpBackend.expectPUT(uploadUrl).respond(204);
              });

              // should save branding
              this.$httpBackend.expectPUT(this.UrlConfig.getLyraServiceUrl() + '/configuration/rules/organization/' + this.Authinfo.getOrgId() + '/userinterface.branding')
                .respond(204, {
                  value: { url: 'darklogo2' },
                });

              //should delete old files
              this.$httpBackend.expectDELETE(darkLogoUrl).respond(204);

              //should notify all devices
              this.$httpBackend.expectPOST(notifyUrl).respond(200);

              //perform
              this.controller.applyBranding();
              this.$httpBackend.flush();
            });

            it('should delete one old files and not show error', function () {
              expect(this.Notification.errorResponse).not.toHaveBeenCalled();
            });
          });
        });
      });

      describe('remove one image', () => {
        beforeEach(function () {
          this.controller.useDefaultBranding = false;
          this.controller.logodark.removeFile();
        });

        it('should set changed to true', function () {
          expect(this.controller.changeInBranding()).toBe(true);
          expect(this.controller.applyAllowed()).toBe(true);
        });

        describe('-> save setting', () => {

          describe('with full success', () => {
            beforeEach(function () {
              // should save branding without logoDark
              this.$httpBackend.expectPUT(this.UrlConfig.getLyraServiceUrl() + '/configuration/rules/organization/' + this.Authinfo.getOrgId() + '/userinterface.halfwakebackground',
                {
                  value: {
                    source: 'Spark',
                    url: halfwakeLogoUrl,
                  },
                  enforced: false,
                })
                .respond(204, {
                  value: { url: 'halfwakelogo2' },
                });
              this.$httpBackend.expectPUT(this.UrlConfig.getLyraServiceUrl() + '/configuration/rules/organization/' + this.Authinfo.getOrgId() + '/userinterface.halfwakebranding',
                {
                  value: {
                    source: 'Spark',
                    url: lightLogoUrl,
                  },
                  enforced: false,
                })
                .respond(204, {
                  value: { url: lightLogoUrl },
                });
              this.$httpBackend.expectDELETE(this.UrlConfig.getLyraServiceUrl() + '/configuration/rules/organization/' + this.Authinfo.getOrgId() + '/userinterface.branding').respond(204)

              //should delete old files
              this.$httpBackend.expectDELETE(darkLogoUrl).respond(204);

              //should notify all devices
              this.$httpBackend.expectPOST(notifyUrl).respond(200);

              //perform
              this.controller.applyBranding();
              this.$httpBackend.flush();
            });

            it('should save to lyra with no errors', function () {
              expect(this.Notification.errorResponse).not.toHaveBeenCalled();
            });
          });
        });
      });
    });
  });

  describe('with no existing branding', () => {
    beforeEach(function () {
      this.$httpBackend.whenGET(this.UrlConfig.getLyraServiceUrl() + '/configuration/rules/organization/' + this.Authinfo.getOrgId() + '/userinterface.branding').respond(404, {});
      this.$httpBackend.whenGET(this.UrlConfig.getLyraServiceUrl() + '/configuration/rules/organization/' + this.Authinfo.getOrgId() + '/userinterface.halfwakebranding').respond(404, {});
      this.$httpBackend.whenGET(this.UrlConfig.getLyraServiceUrl() + '/configuration/rules/organization/' + this.Authinfo.getOrgId() + '/userinterface.halfwakebackground').respond(404, {});
    });

    describe('on init', () => {
      beforeEach(function () {
        initComponent.apply(this);
      });

      it('should fetch settings and set imgFileUrls to empty', function () {
        expect(this.controller.logolight.origUrl).toBeUndefined();
        expect(this.controller.logodark.origUrl).toBeUndefined();
        expect(this.controller.halfwakeBackground.origUrl).toBeUndefined();

        expect(this.controller.logolight.tempDownloadUrl).toBeUndefined();
      });

      describe('-> add images', () => {
        beforeEach(function () {
          this.controller.useDefaultBranding = false;
          this.controller.logodark.file = imageFile;
          this.controller.logolight.file = imageFile;
          this.controller.halfwakeBackground.file = imageFile;
        });

        it('should set changed to true', function () {
          expect(this.controller.changeInBranding()).toBe(true);
          expect(this.controller.applyAllowed()).toBe(true);
        });

        describe('-> save setting', () => {

          describe('with full success', () => {

            beforeEach(function () {
              [1, 2, 3].forEach((i) => {
                //should fetch 3x url
                const uploadUrl = '8AAFF7C25CCE77B2015CCE77E505001' + i + 'up';
                this.$httpBackend.whenPOST(this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/config/files/').respond(204, {
                  tempURL: '8AAFF7C25CCE77B2015CCE77E505001' + i + 'temp',
                  downloadUrl: '8AAFF7C25CCE77B2015CCE77E505001' + i + 'down',
                  uploadUrl: uploadUrl,
                });

                //should upload 3x images
                this.$httpBackend.whenPUT(uploadUrl).respond(204);
              });

              // should save branding
              this.$httpBackend.expectPUT(this.UrlConfig.getLyraServiceUrl() + '/configuration/rules/organization/' + this.Authinfo.getOrgId() + '/userinterface.halfwakebackground')
                .respond(204, {
                  value: { url: 'halfwakelogo2' },
                });
              this.$httpBackend.expectPUT(this.UrlConfig.getLyraServiceUrl() + '/configuration/rules/organization/' + this.Authinfo.getOrgId() + '/userinterface.halfwakebranding')
                .respond(204, {
                  value: { url: 'lightlogo2' },
                });
              this.$httpBackend.expectPUT(this.UrlConfig.getLyraServiceUrl() + '/configuration/rules/organization/' + this.Authinfo.getOrgId() + '/userinterface.branding')
                .respond(204, {
                  value: { url: 'darklogo2' },
                });

              const notifyUrl = this.UrlConfig.getCsdmServiceUrl() + '/organization/' + this.Authinfo.getOrgId() + '/devices/update';
              //should notify all devices
              this.$httpBackend.expectPOST(notifyUrl).respond(200);

              //perform
              this.controller.applyBranding();
              this.$httpBackend.flush();
            });

            it('should set changed to false when done', function () {
              expect(this.controller.changeInBranding()).toBe(false);
            });

            it('should set the images url to the new ones', function () {
              expect(this.controller.logolight.origUrl).toBe('lightlogo2');
              expect(this.controller.logodark.origUrl).toBe('darklogo2');
              expect(this.controller.halfwakeBackground.origUrl).toBe('halfwakelogo2');
            });

            it('should have no errors', function () {
              expect(this.Notification.errorResponse).not.toHaveBeenCalled();
            });
          });

          describe('with one failing get upload url', () => {

            beforeEach(function () {
              this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/config/files/').respond(500);
              [1, 3].forEach((i) => {
                //should fetch 3x url
                const uploadUrl = '8AAFF7C25CCE77B2015CCE77E505001' + i + 'up';
                this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/config/files/').respond(204, {
                  tempURL: '8AAFF7C25CCE77B2015CCE77E505001' + i + 'temp',
                  downloadUrl: '8AAFF7C25CCE77B2015CCE77E505001' + i + 'down',
                  uploadUrl: uploadUrl,
                });

                //should allow 2x images upload
                this.$httpBackend.whenPUT(uploadUrl).respond(204);
              });

              //perform
              this.controller.applyBranding();
              this.$httpBackend.flush();
            });

            it('should display error notification', function () {
              expect(this.Notification.success).not.toHaveBeenCalled();
              expect(this.Notification.errorResponse).toHaveBeenCalledWith(jasmine.anything(), 'globalSettings.deviceBranding.failedToSave');
            });
          });

          describe('with one failing image upload', () => {
            beforeEach(function () {
              const uploadUrls: string[] = [];
              [1, 2, 3].forEach((i) => {
                //should fetch 3x url
                const uploadUrl = '8AAFF7C25CCE77B2015CCE77E505001' + i + 'up';
                this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/config/files/').respond(204, {
                  tempURL: '8AAFF7C25CCE77B2015CCE77E505001' + i + 'temp',
                  downloadUrl: '8AAFF7C25CCE77B2015CCE77E505001' + i + 'down',
                  uploadUrl: uploadUrl,
                });

                uploadUrls.push(uploadUrl);
              });

              //should upload 3x images, first two succeed, last fails
              spyOn(this.Upload, 'http').and.callFake((arg) => {
                return (arg.url === uploadUrls[2]) ? this.$q.reject(401) : this.$q.resolve(204);
              });

              //perform
              this.controller.applyBranding();
              this.$httpBackend.flush();
            });

            it('should display error notification', function () {
              expect(this.Notification.success).not.toHaveBeenCalled();
              expect(this.controller.logodark.status || this.controller.logolight.status || this.controller.halfwakeBackground.status).toBe('globalSettings.deviceBranding.uploadFailed');
              expect(this.Notification.errorResponse).toHaveBeenCalledWith(jasmine.anything(), 'globalSettings.deviceBranding.uploadFailedWithReason'); //consider this, double notification..
              expect(this.Notification.errorResponse).toHaveBeenCalledWith(jasmine.anything(), 'globalSettings.deviceBranding.failedToSave');
              expect(this.Notification.errorResponse).toHaveBeenCalledTimes(2);
            });

            // it('should clean up the uploaded images which worked', function () {
            //   //not implemented yet.
            // });
          });
        });
      });

      describe('-> add one image', () => {
        beforeEach(function () {
          this.controller.useDefaultBranding = false;
          this.controller.logolight.file = imageFile;
        });

        it('should set changed to true', function () {
          expect(this.controller.changeInBranding()).toBe(true);
          expect(this.controller.applyAllowed()).toBe(true);
        });

        describe('-> save setting', () => {

          describe('with full success', () => {

            beforeEach(function () {
              const uploadUrl = '8AAFF7C25CCE77B2015CCE77E5050019up';
              const downloadUrl = '8AAFF7C25CCE77B2015CCE77E5050019down';
              this.$httpBackend.expectPOST(this.UrlConfig.getAdminServiceUrl() + 'organizations/' + this.Authinfo.getOrgId() + '/config/files/').respond(204, {
                tempURL: '8AAFF7C25CCE77B2015CCE77E5050019temp',
                downloadUrl: downloadUrl,
                uploadUrl: uploadUrl,
              });

              //should upload 1x images
              this.$httpBackend.expectPUT(uploadUrl).respond(204);

              // should save branding
              this.$httpBackend
                .expectPUT(this.UrlConfig.getLyraServiceUrl() + '/configuration/rules/organization/' + this.Authinfo.getOrgId() + '/userinterface.halfwakebranding'
                  , {
                    value: {
                      source: 'Spark',
                      url: downloadUrl,
                    }, enforced: false,
                  })
                .respond(204, {
                  value: { url: 'lightlogo2' },
                });

              const notifyUrl = this.UrlConfig.getCsdmServiceUrl() + '/organization/' + this.Authinfo.getOrgId() + '/devices/update';
              //should notify all devices
              this.$httpBackend.expectPOST(notifyUrl).respond(200);

              //perform
              this.controller.applyBranding();
              this.$httpBackend.flush();
            });

            it('should set changed to false when done', function () {
              expect(this.controller.changeInBranding()).toBe(false);
            });
            it('should have no errors', function () {
              expect(this.Notification.errorResponse).not.toHaveBeenCalled();
            });
          });
        });
      });
    });
  });
});
