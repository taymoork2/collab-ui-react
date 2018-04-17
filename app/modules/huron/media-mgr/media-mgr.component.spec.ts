import mediaMgrModule from './index';
import { IMedia } from './media-mgr.component';
import { ModalView } from './media-mgr.component';

describe('Component: mediaMgrModal', () => {

  const MODAL_TITLE = '.modal-header';
  const MODAL_BODY = '.modal-body';
  const MODAL_NAV = '.mb-nav';
  const NAV_MEDIA = 'button.icon.icon-music.icon-lg';
  const NAV_TRASH = 'button.icon.icon-trash.icon-lg';
  const NAV_ACTIVE = 'active';
  const MEDIA_CONTENT = '.mb-panel-left .mb-panel-body .row.collapse';
  const MEDIA_ITEM = '.mb-rows';
  const MEDIA_SELECTED = '.mb-panel-right';
  const TRASH_TITLE = '.mb-panel .mb-title.text-center';
  const TRASH_CONTENT = '.mb-panel .mb-panel-body .row.collapse';
  const TRASH_BUTTON = '.icon.icon-trash.icon-lg';
  const RESTORE_BUTTON = '.icon.icon-back.icon-lg';
  const EMPTY_TRASH = '.mb-panel button.btn';
  const SEARCH_FILTER = 'cs-searchfilter';
  const FILE_UPLOAD = 'i.icon.icon-plus.icon-2x';
  const DROPDOWN_OPTIONS = '.dropdown-menu li';

  const mediaList: IMedia[] = [
    { mediaId : 'a16db6c1-08e8-4386-87c0-477917b03c27', mediaState : 'PROCESSING', filename : 'fall-ads-2017.mp3', description : '', displayName : 'fall-ads-2017', duration : '', lastModifyTime : { nano : 203000000, epochSecond : 1497548448 }, size : 1769392, errorInfo : '' },
    { mediaId : '207970b0-b9cc-426c-af09-155f9af0d877', mediaState : 'PROCESSING', filename : 'winter-ads-2017.mp3', description : '', displayName : 'winter-ads-2017', duration : '', lastModifyTime : { nano : 199000000, epochSecond : 1497307219 }, size : 5321000, errorInfo : '' },
    { mediaId : 'd57ec625-bd8f-4e4b-8eee-268f2ef49b47', mediaState : 'PROCESSING', filename : 'spring-ads-2017.mp3', description : '', displayName : 'spring-ads-2017', duration : '', lastModifyTime : { nano : 221000000, epochSecond : 1497288720 }, size : 5321000, errorInfo : '' },
    { mediaId : 'e9a158d4-9688-48eb-850a-cb7faf574667', mediaState : 'PROCESSING', filename : 'summer-ads-2017.mp3', description : '', displayName : 'summer-ads-2017', duration : '', lastModifyTime : { nano : 253000000, epochSecond : 1496904731 }, size : 3593157, errorInfo : '' },
    { mediaId : 'a16db6c1-08e8-4386-87c0-477917b03c26', mediaState : 'READY', filename : 'fall-ads-2016.mp3', description : '', displayName : 'fall-ads-2016', duration : '', lastModifyTime : { nano : 662000000, epochSecond : 1497288876 }, size : 1769392, errorInfo : '' },
    { mediaId : '207970b0-b9cc-426c-af09-155f9af0d876', mediaState : 'READY', filename : 'winter-ads-2016.mp3', description : '', displayName : 'winter-ads-2016', duration : '', lastModifyTime : { nano : 317000000, epochSecond : 1497599958 }, size : 5321000, errorInfo : '' },
    { mediaId : 'd57ec625-bd8f-4e4b-8eee-268f2ef49b46', mediaState : 'READY', filename : 'spring-ads-2016.mp3', description : '', displayName : 'spring-ads-2016', duration : '', lastModifyTime : { nano : 661000000, epochSecond : 1497599210 }, size : 5321000, errorInfo : '' },
    { mediaId : 'e9a158d4-9688-48eb-850a-cb7faf574666', mediaState : 'READY', filename : 'summer-ads-2016.mp3', description : '', displayName : 'summer-ads-2016', duration : '', lastModifyTime : { nano : 264000000, epochSecond : 1497288553 }, size : 3593157, errorInfo : '' },
    { mediaId : 'a16db6c1-08e8-4386-87c0-477917b03c25', mediaState : 'DELETED', filename : 'fall-ads-2015.mp3', description : '', displayName : 'fall-ads-2015', duration : '', lastModifyTime : { nano : 174000000, epochSecond : 1496947328 }, size : 1769392, errorInfo : '' },
    { mediaId : '207970b0-b9cc-426c-af09-155f9af0d875', mediaState : 'DELETED', filename : 'winter-ads-2015.mp3', description : '', displayName : 'winter-ads-2015', duration : '', lastModifyTime : { nano : 964000000, epochSecond : 1497042791 }, size : 5321000, errorInfo : '' },
    { mediaId : 'd57ec625-bd8f-4e4b-8eee-268f2ef49b45', mediaState : 'DELETED', filename : 'spring-ads-2015.mp3', description : '', displayName : 'spring-ads-2015', duration : '', lastModifyTime : { nano : 246000000, epochSecond : 1497260355 }, size : 5321000, errorInfo : '' },
    { mediaId : 'e9a158d4-9688-48eb-850a-cb7faf574665', mediaState : 'DELETED', filename : 'summer-ads-2015.mp3', description : '', displayName : 'summer-ads-2015', duration : '', lastModifyTime : { nano : 458000000, epochSecond : 1497548366 }, size : 3593157, errorInfo : '' },
  ];

  beforeEach(function() {
    this.initModules(mediaMgrModule);
    this.injectDependencies(
      '$scope',
      '$q',
      'MediaMgrService',
    );

    this.$scope.close = jasmine.createSpy('close');
    this.$scope.dismiss = jasmine.createSpy('dismiss');
    spyOn(this.MediaMgrService, 'getMedia').and.returnValue(this.$q.resolve(mediaList));
    spyOn(this.MediaMgrService, 'uploadMedia').and.returnValue(this.$q.resolve());
    spyOn(this.MediaMgrService, 'deleteMedia').and.returnValue(this.$q.resolve());
    spyOn(this.MediaMgrService, 'deletePermMedia').and.returnValue(this.$q.resolve());
    spyOn(this.MediaMgrService, 'restoreMedia').and.returnValue(this.$q.resolve());
    spyOn(this.MediaMgrService, 'deletePermAll').and.returnValue(this.$q.resolve());

    this.compileComponent('mediaMgr', {
      close: 'close()',
      dismiss: 'dismiss()',
    });
  });

  describe('mediaMgr modal at init', () => {

    it('should have modal title, body, navigation panel and options', function() {
      expect(this.view.find(MODAL_TITLE)).toExist();
      expect(this.view.find(MODAL_BODY)).toExist();
      expect(this.view.find(MODAL_NAV)).toExist();
      expect(this.view.find(MODAL_NAV).find(NAV_MEDIA)).toExist();
      expect(this.view.find(MODAL_NAV).find(NAV_TRASH)).toExist();
    });

  });

  describe('mediaMgr modal navigation', () => {
    it('when media panel selected', function() {
      spyOn(this.controller, 'setModal').and.callThrough();
      const navButton = this.view.find(NAV_MEDIA);
      navButton.click();
      expect(this.view.find(MODAL_NAV).find(NAV_MEDIA)).toHaveClass(NAV_ACTIVE);
      expect(this.view.find(MODAL_NAV).find(NAV_TRASH)).not.toHaveClass(NAV_ACTIVE);
      expect(this.controller.setModal).toHaveBeenCalledWith(ModalView.Media);
      expect(this.MediaMgrService.getMedia).toHaveBeenCalled();
      expect(this.view.find(MEDIA_CONTENT)).toHaveLength(8);
    });
    it('when trash panel selected', function() {
      spyOn(this.controller, 'setModal').and.callThrough();
      const navButton = this.view.find(NAV_TRASH);
      navButton.click();
      expect(this.view.find(MODAL_NAV).find(NAV_MEDIA)).not.toHaveClass(NAV_ACTIVE);
      expect(this.view.find(MODAL_NAV).find(NAV_TRASH)).toHaveClass(NAV_ACTIVE);
      expect(this.controller.setModal).toHaveBeenCalledWith(ModalView.Trash);
      expect(this.MediaMgrService.getMedia).toHaveBeenCalled();
      expect(this.view.find(TRASH_CONTENT)).toHaveLength(4);
    });
  });

  describe('media panel', () => {
    beforeEach(function() {
      const navButton = this.view.find(MODAL_NAV).find(NAV_MEDIA);
      navButton.click();
    });
    it('should have search and upload operations on left panel', function() {
      expect(this.view.find(SEARCH_FILTER)).toExist();
      expect(this.view.find(MEDIA_CONTENT)).toHaveLength(8);
      this.controller.searchByString('2017');
      this.$scope.$apply();
      expect(this.view.find(MEDIA_CONTENT)).toHaveLength(4);
      expect(this.view.find(FILE_UPLOAD)).toExist();
      this.controller.mohUploadInProgress = true;
      this.$scope.$apply();
      expect(this.view.find(FILE_UPLOAD)).not.toExist();
    });
    it('should have edit and delete operations when media is selected', function() {
      spyOn(this.controller, 'setActiveMedia').and.callThrough();
      spyOn(this.controller, 'deleteMedia').and.callThrough();
      const media = this.view.find(MEDIA_CONTENT);
      media.eq(0).find(MEDIA_ITEM).click();
      expect(this.controller.setActiveMedia).toHaveBeenCalled();
      const selectedMedia = this.view.find(MEDIA_SELECTED);
      expect(selectedMedia.find(DROPDOWN_OPTIONS).get(0)).toHaveText('mediaMgrModal.edit');
      expect(selectedMedia.find(DROPDOWN_OPTIONS).get(1)).toHaveText('mediaMgrModal.delete');
      selectedMedia.find(DROPDOWN_OPTIONS).get(1).click();
      expect(this.controller.deleteMedia).toHaveBeenCalledWith(mediaList[5]);
      expect(this.MediaMgrService.deleteMedia).toHaveBeenCalledWith(mediaList[5]);
      expect(this.MediaMgrService.getMedia).toHaveBeenCalled();
    });
  });

  describe('trash panel', () => {
    beforeEach(function() {
      const navButton = this.view.find(MODAL_NAV).find(NAV_TRASH);
      navButton.click();
    });
    it('should have title', function() {
      expect(this.view.find(TRASH_TITLE)).toExist();
    });
    it('when media is selected and deleted', function() {
      spyOn(this.controller, 'deletePermMedia').and.callThrough();
      const trash = this.view.find(TRASH_CONTENT);
      trash.eq(0).find(TRASH_BUTTON).click();
      expect(this.controller.deletePermMedia).toHaveBeenCalled();
      //expect(this.MediaMgrService.deletePermMedia).toHaveBeenCalled();
      expect(this.MediaMgrService.getMedia).toHaveBeenCalled();
    });
    it('when media is selected and restored', function() {
      spyOn(this.controller, 'restoreMedia').and.callThrough();
      const trash = this.view.find(TRASH_CONTENT);
      trash.eq(0).find(RESTORE_BUTTON).click();
      expect(this.controller.restoreMedia).toHaveBeenCalled();
      expect(this.MediaMgrService.restoreMedia).toHaveBeenCalled();
      expect(this.MediaMgrService.getMedia).toHaveBeenCalled();
    });
    it('when trash is emptied', function() {
      spyOn(this.controller, 'deletePermAll').and.callThrough();
      const trashButton = this.view.find(EMPTY_TRASH);
      expect(trashButton).not.toBeDisabled();
      trashButton.click();
      expect(this.controller.deletePermAll).toHaveBeenCalled();
      //expect(this.MediaMgrService.deletePermAll).toHaveBeenCalled();
      expect(this.MediaMgrService.getMedia).toHaveBeenCalled();
      this.controller.mediaList = [];
      this.$scope.$apply();
      expect(trashButton).toBeDisabled();
    });
  });
});
