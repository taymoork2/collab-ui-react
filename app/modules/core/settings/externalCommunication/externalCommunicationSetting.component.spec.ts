import testModuleName from './index';
import { ExternalCommunicationSettingController } from './externalCommunicationSetting.component';
import { ProPackService } from 'modules/core/proPack/proPack.service';

type Test = atlas.test.IComponentTest<ExternalCommunicationSettingController, {
  AccountOrgService,
  Authinfo,
  ProPackService: ProPackService,
}>;

describe('Controller: ExternalCommunicationSettingController', () => {

  beforeEach(function (this: Test) {
    this.initModules(testModuleName);
    this.injectDependencies(
      '$q',
      '$scope',
      'AccountOrgService',
      'Authinfo',
      'ProPackService',
    );

    this.initComponent = () => this.compileComponent('externalCommunicationSetting', {});
    this.initSpies = (spies: {
      getBlockExternalCommunication?,
      setBlockExternalCommunication?,
      hasProPackPurchasedOrNotEnabled?,
    } = {}) => {
      const {
        getBlockExternalCommunication = this.$q.resolve(false),
        setBlockExternalCommunication = this.$q.resolve(false),
        hasProPackPurchasedOrNotEnabled = this.$q.resolve(true),
      } = spies;
      spyOn(this.AccountOrgService, 'getBlockExternalCommunication').and.returnValue(getBlockExternalCommunication);
      spyOn(this.AccountOrgService, 'setBlockExternalCommunication').and.returnValue(setBlockExternalCommunication);
      spyOn(this.ProPackService, 'hasProPackPurchasedOrNotEnabled').and.returnValue(hasProPackPurchasedOrNotEnabled);
    };
  });

  describe('constructor()', () => {

    describe('when getBlockExternalCommunication fail', () => {
      beforeEach(function (this: Test) {
        this.initSpies({
          getBlockExternalCommunication: this.$q.reject(),
        });
        this.initComponent();
      });

      it('should not set dataloaded and no value for isBlockExternalCommunication', function (this: Test) {
        expect(this.controller.isBlockExternalCommunication).toBeFalsy();
        expect(this.controller.isBlockExternalCommunicationSettingLoaded).toBeFalsy();
      });
    });

    describe('when getBlockExternalCommunication return blockExternalCommunications set to true', () => {
      beforeEach(function (this: Test) {
        this.initSpies({
          getBlockExternalCommunication: this.$q.resolve(true),
        });
        this.initComponent();
      });

      it('should set dataloaded and true for isBlockExternalCommunication', function (this: Test) {
        expect(this.controller.isBlockExternalCommunication).toBeTruthy();
        expect(this.controller.isBlockExternalCommunicationSettingLoaded).toBeTruthy();
      });
    });

    describe('when getBlockExternalCommunication return blockExternalCommunications set to false', () => {
      beforeEach(function (this: Test) {
        this.initSpies({
          getBlockExternalCommunication: this.$q.resolve(false),
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
        getBlockExternalCommunication: this.$q.resolve(false),
        setBlockExternalCommunication: this.$q.resolve(),
      });
      this.initComponent();
    });

    it('should call AccountOrgService to save the value true', function (this: Test) {
      this.controller.isBlockExternalCommunication = true;

      this.controller.updateBlockExternalCommunicationSetting();

      expect(this.AccountOrgService.setBlockExternalCommunication)
        .toHaveBeenCalledWith(this.Authinfo.getOrgId(), true);
    });

    it('should call AccountOrgService to save the value false', function (this: Test) {
      this.controller.isBlockExternalCommunication = false;

      this.controller.updateBlockExternalCommunicationSetting();

      expect(this.AccountOrgService.setBlockExternalCommunication)
        .toHaveBeenCalledWith(this.Authinfo.getOrgId(), false);
    });
  });
});
