'use strict';

// TODO: convert this file to TypeScript

describe('Factory : OverviewCareLicenseNotification', function () {
  beforeEach(angular.mock.module('Core'));

  var notification;
  var $modal;
  var $state;

  beforeEach(inject(function (_$modal_, _$state_, OverviewCareLicenseNotification) {
    notification = OverviewCareLicenseNotification.createNotification();
    $modal = _$modal_;
    $state = _$state_;
    spyOn($state, 'go');
    spyOn($modal, 'open');
  }));

  afterEach(function () {
    $modal = null;
    notification = null;
    $state = null;
  });

  it('should open a care voice feature modal if hybrid toggle is enabled', function () {
    $state.isHybridToggleEnabled = false;
    notification.link();
    expect($state.go).toHaveBeenCalledWith('my-company.subscriptions');
    expect($modal.open).not.toHaveBeenCalledWith({
      template: '<care-voice-features-modal dismiss="$dismiss()" class="care-modal"></care-voice-features-modal>',
    });
  });

  it('should open a care voice feature modal if hybrid toggle is disabled', function () {
    $state.isHybridToggleEnabled = true;
    notification.link();
    expect($state.go).not.toHaveBeenCalledWith('my-company.subscriptions');
    expect($modal.open).toHaveBeenCalledWith({
      template: '<care-voice-features-modal dismiss="$dismiss()" class="care-modal"></care-voice-features-modal>',
    });
  });
});
