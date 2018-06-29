import testModule from './index';
import { HcsSetupModalSelect } from 'modules/hcs/hcs-shared';

describe('Component: upgrade-sftp-list', () => {
  const SW_PROFILE_LIST = getJSONFixture('hcs/hcs-upgrade/hcs-sw-profiles-list.json');
  const DELETE_BUTTON = 'button.close';
  const CARD = 'article';

  beforeEach(function () {
    this.initModules(testModule, 'Core');
    this.injectDependencies(
      '$translate',
      '$modal',
      '$state',
      '$q',
      'HcsUpgradeService',
      'HcsSetupModalService',
      'CardUtils',
    );

    spyOn(this.$state, 'go').and.returnValue(undefined);
    spyOn(this.$modal, 'open').and.callThrough();
    spyOn(this.HcsUpgradeService, 'listSoftwareProfiles').and.returnValue(this.$q.resolve({
      softwareProfiles: SW_PROFILE_LIST,
    }));

    this.compileComponent('hcsUpgradeSwprofileList', {});

    spyOn(this.controller, 'reInstantiateMasonry').and.callThrough();
    spyOn(this.CardUtils, 'resize').and.callThrough();
    spyOn(this.HcsSetupModalService, 'openSetupModal').and.returnValue(undefined);
  });

  it('should initialize with expected defaults', function () {
    expect(this.controller.currentList.length).toEqual(2);
  });

  it('search feature should work as expected', function () {
    this.controller.filteredList('test_sw_Profile1');
    expect(this.controller.currentList.length).toEqual(1);
    expect(this.controller.reInstantiateMasonry).toHaveBeenCalled();
    expect(this.CardUtils.resize).toHaveBeenCalled();
    this.controller.filteredList('abcs');
    expect(this.controller.currentList.length).toEqual(0);
    expect(this.controller.reInstantiateMasonry).toHaveBeenCalled();
    expect(this.CardUtils.resize).toHaveBeenCalled();
    this.controller.filteredList('');
    expect(this.controller.currentList.length).toEqual(2);
    expect(this.controller.reInstantiateMasonry).toHaveBeenCalled();
    expect(this.CardUtils.resize).toHaveBeenCalled();
  });

  it('add sftp feature should work as expected', function () {
    this.controller.addSwProfile();
    expect(this.HcsSetupModalService.openSetupModal).toHaveBeenCalledWith(false, HcsSetupModalSelect.SoftwareProfileSetup);
  });

  it('delete feature should work as expected', function () {
    this.view.find(DELETE_BUTTON).click();
    expect(this.$modal.open).toHaveBeenCalled();
  });
  it('edit feature should work as expected', function () {
    this.view.find(CARD).click();
    expect(this.$state.go).toHaveBeenCalled();
  });
});
