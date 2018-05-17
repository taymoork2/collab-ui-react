import testModuleName from './index';
import { ExternalCommunicationSettingController } from './externalCommunicationSetting.component';
import { OrgSettingsService } from 'modules/core/shared/org-settings/org-settings.service';
import { ProPackService } from 'modules/core/proPack/proPack.service';

type Test = atlas.test.IComponentTest<ExternalCommunicationSettingController, {
  Authinfo,
  OrgSettingsService: OrgSettingsService,
  ProPackService: ProPackService,
}>;

describe('Controller: ExternalCommunicationSettingController', () => {

  beforeEach(function (this: Test) {
    this.initModules(testModuleName);
    this.injectDependencies(
      '$q',
      '$scope',
      'OrgSettingsService',
      'Authinfo',
      'ProPackService',
    );

    this.initComponent = () => this.compileComponent('externalCommunicationSetting', {});
    this.initSpies = (spies: {
      getBlockExternalCommunications?,
      setBlockExternalCommunications?,
      hasProPackPurchasedOrNotEnabled?,
    } = {}) => {
      const {
        getBlockExternalCommunications = this.$q.resolve(false),
        setBlockExternalCommunications = this.$q.resolve(false),
        hasProPackPurchasedOrNotEnabled = this.$q.resolve(true),
      } = spies;
      spyOn(this.OrgSettingsService, 'getBlockExternalCommunications').and.returnValue(getBlockExternalCommunications);
      spyOn(this.OrgSettingsService, 'setBlockExternalCommunications').and.returnValue(setBlockExternalCommunications);
      spyOn(this.ProPackService, 'hasProPackPurchasedOrNotEnabled').and.returnValue(hasProPackPurchasedOrNotEnabled);
    };
  });

  describe('constructor()', () => {

    describe('when getBlockExternalCommunications fail', () => {
      beforeEach(function (this: Test) {
        this.initSpies({
          getBlockExternalCommunications: this.$q.reject(),
        });
        this.initComponent();
      });

      it('should not set dataloaded and no value for isBlockExternalCommunication', function (this: Test) {
        expect(this.controller.isBlockExternalCommunication).toBeFalsy();
        expect(this.controller.isBlockExternalCommunicationSettingLoaded).toBeFalsy();
      });
    });

    describe('when getBlockExternalCommunications return blockExternalCommunications set to true', () => {
      beforeEach(function (this: Test) {
        this.initSpies({
          getBlockExternalCommunications: this.$q.resolve(true),
        });
        this.initComponent();
      });

      it('should set dataloaded and true for isBlockExternalCommunication', function (this: Test) {
        expect(this.controller.isBlockExternalCommunication).toBeTruthy();
        expect(this.controller.isBlockExternalCommunicationSettingLoaded).toBeTruthy();
      });
    });

    describe('when getBlockExternalCommunications return blockExternalCommunications set to false', () => {
      beforeEach(function (this: Test) {
        this.initSpies({
          getBlockExternalCommunications: this.$q.resolve(false),
        });
        this.initComponent();
      });

      it('should set dataloaded and true for isBlockExternalCommunication', function (this: Test) {
        expect(this.controller.isBlockExternalCommunication).toBeFalsy();
        expect(this.controller.isBlockExternalCommunicationSettingLoaded).toBeTruthy();
      });
    });
  });

  describe('updateBlockExternalCommunicationSetting', () => {
    beforeEach(function (this: Test) {
      this.initSpies({
        getBlockExternalCommunications: this.$q.resolve(false),
        setBlockExternalCommunications: this.$q.resolve(),
      });
      this.initComponent();
    });

    it('should call OrgSettingsService to save the value true', function (this: Test) {
      this.controller.isBlockExternalCommunication = true;

      this.controller.updateBlockExternalCommunicationSetting();

      expect(this.OrgSettingsService.setBlockExternalCommunications)
        .toHaveBeenCalledWith(this.Authinfo.getOrgId(), true);
    });

    it('should call OrgSettingsService to save the value false', function (this: Test) {
      this.controller.isBlockExternalCommunication = false;

      this.controller.updateBlockExternalCommunicationSetting();

      expect(this.OrgSettingsService.setBlockExternalCommunications)
        .toHaveBeenCalledWith(this.Authinfo.getOrgId(), false);
    });
  });
});
