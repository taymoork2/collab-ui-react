import mediaMgrModule from './index';
import { IMedia } from 'modules/huron/media-mgr/media-mgr.component';
import { ModalView } from 'modules/huron/media-mgr/media-mgr.component';

describe('Component: mediaMgrModal', () => {

  const MODAL_TITLE = 'div#mediaMgrTitle';
  const MODAL_BODY = 'div#mediaMgrBody';
  const MODAL_NAV = 'div#mediaMgrNav';
  const NAV_MEDIA = 'button#mediaNav';
  const NAV_TRASH = 'button#trashNav';
  const NAV_ACTIVE = 'active-icon';
  const MEDIA_CONTENT = 'div#mediaContent';
  const MEDIA_ITEM = 'div#mediaItem';
  const MEDIA_SELECTED = 'div#mediaSelected';
  const TRASH_TITLE = 'div#trashTitle';
  const TRASH_DESC = 'div#trashDesc';
  const TRASH_CONTENT = 'div#trashContent';
  const TRASH_BUTTON = '.icon-trash';
  const EMPTY_TRASH = 'button#emptyTrash';
  const SEARCH_FILTER = 'cs-searchfilter';
  const FILE_UPLOAD = 'i#fileUpload';

  const mediaList: IMedia[] = [
    { mediaId : 'a16db6c1-08e8-4386-87c0-477917b03c27', mediaState : 'PROCESSING', filename : 'fall-ads-2017.mp3', description : '', displayName : 'fall-ads-2017', duration : '', size : 1769392, errorInfo : '' },
    { mediaId : '207970b0-b9cc-426c-af09-155f9af0d877', mediaState : 'PROCESSING', filename : 'winter-ads-2017.mp3', description : '', displayName : 'winter-ads-2017', duration : '', size : 5321000, errorInfo : '' },
    { mediaId : 'd57ec625-bd8f-4e4b-8eee-268f2ef49b47', mediaState : 'PROCESSING', filename : 'spring-ads-2017.mp3', description : '', displayName : 'spring-ads-2017', duration : '', size : 5321000, errorInfo : '' },
    { mediaId : 'e9a158d4-9688-48eb-850a-cb7faf574667', mediaState : 'PROCESSING', filename : 'summer-ads-2017.mp3', description : '', displayName : 'summer-ads-2017', duration : '', size : 3593157, errorInfo : '' },
    { mediaId : 'a16db6c1-08e8-4386-87c0-477917b03c26', mediaState : 'READY', filename : 'fall-ads-2016.mp3', description : '', displayName : 'fall-ads-2016', duration : '', size : 1769392, errorInfo : '' },
    { mediaId : '207970b0-b9cc-426c-af09-155f9af0d876', mediaState : 'READY', filename : 'winter-ads-2016.mp3', description : '', displayName : 'winter-ads-2016', duration : '', size : 5321000, errorInfo : '' },
    { mediaId : 'd57ec625-bd8f-4e4b-8eee-268f2ef49b46', mediaState : 'READY', filename : 'spring-ads-2016.mp3', description : '', displayName : 'spring-ads-2016', duration : '', size : 5321000, errorInfo : '' },
    { mediaId : 'e9a158d4-9688-48eb-850a-cb7faf574666', mediaState : 'READY', filename : 'summer-ads-2016.mp3', description : '', displayName : 'summer-ads-2016', duration : '', size : 3593157, errorInfo : '' },
    { mediaId : 'a16db6c1-08e8-4386-87c0-477917b03c25', mediaState : 'DELETED', filename : 'fall-ads-2015.mp3', description : '', displayName : 'fall-ads-2015', duration : '', size : 1769392, errorInfo : '' },
    { mediaId : '207970b0-b9cc-426c-af09-155f9af0d875', mediaState : 'DELETED', filename : 'winter-ads-2015.mp3', description : '', displayName : 'winter-ads-2015', duration : '', size : 5321000, errorInfo : '' },
    { mediaId : 'd57ec625-bd8f-4e4b-8eee-268f2ef49b45', mediaState : 'DELETED', filename : 'spring-ads-2015.mp3', description : '', displayName : 'spring-ads-2015', duration : '', size : 5321000, errorInfo : '' },
    { mediaId : 'e9a158d4-9688-48eb-850a-cb7faf574665', mediaState : 'DELETED', filename : 'summer-ads-2015.mp3', description : '', displayName : 'summer-ads-2015', duration : '', size : 3593157, errorInfo : '' },
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
    spyOn(this.MediaMgrService, 'removeMedia').and.returnValue(this.$q.resolve());
    spyOn(this.MediaMgrService, 'deleteAll').and.returnValue(this.$q.resolve());

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
      this.controller.activeModal = ModalView.Media;
      this.$scope.$apply();
      expect(this.view.find(NAV_MEDIA)).toHaveClass(NAV_ACTIVE);
      expect(this.view.find(NAV_TRASH)).not.toHaveClass(NAV_ACTIVE);
    });

  });

  describe('mediaMgr modal navigation', () => {
    it('when media panel selected', function() {
      spyOn(this.controller, 'setModal');
      const navButton = this.view.find(NAV_MEDIA);
      navButton.click();
      this.controller.activeModal = ModalView.Media;
      this.$scope.$apply();
      expect(this.controller.setModal).toHaveBeenCalledWith(ModalView.Media);
      expect(this.MediaMgrService.getMedia).toHaveBeenCalled();
      expect(this.view.find(MEDIA_CONTENT)).toHaveLength(8);
    });
    it('when trash panel selected', function() {
      spyOn(this.controller, 'setModal');
      const navButton = this.view.find(NAV_TRASH);
      navButton.click();
      this.controller.activeModal = ModalView.Trash;
      this.$scope.$apply();
      expect(this.controller.setModal).toHaveBeenCalledWith(ModalView.Trash);
      expect(this.MediaMgrService.getMedia).toHaveBeenCalled();
      expect(this.view.find(TRASH_CONTENT)).toHaveLength(4);
    });
  });

  describe('media panel', () => {
    beforeEach(function() {
      const navButton = this.view.find(NAV_MEDIA);
      navButton.click();
      this.controller.activeModal = ModalView.Media;
      this.$scope.$apply();
    });
    it('should have search and upload operations', function() {
      expect(this.view.find(SEARCH_FILTER)).toExist();
      expect(this.view.find(MEDIA_CONTENT)).toHaveLength(8);
      this.controller.searchStr = '2017';
      this.$scope.$apply();
      expect(this.view.find(MEDIA_CONTENT)).toHaveLength(4);
      expect(this.view.find(FILE_UPLOAD)).toExist();
      this.controller.mohUploadInProgress = true;
      this.$scope.$apply();
      expect(this.view.find(FILE_UPLOAD)).not.toExist();
    });
    it('when media is selected and deleted', function() {
      spyOn(this.controller, 'setActiveMedia');
      spyOn(this.controller, 'deleteMedia').and.callThrough();
      const media = this.view.find(MEDIA_CONTENT);
      media.eq(0).find(MEDIA_ITEM).click();
      this.controller.activeMedia = mediaList[0];
      this.$scope.$apply();
      expect(this.controller.setActiveMedia).toHaveBeenCalled();
      const selectedMedia = this.view.find(MEDIA_SELECTED);
      selectedMedia.find(TRASH_BUTTON).click();
      this.$scope.$apply();
      expect(this.controller.deleteMedia).toHaveBeenCalledWith(this.controller.activeMedia);
      expect(this.MediaMgrService.deleteMedia).toHaveBeenCalledWith(this.controller.activeMedia);
      expect(this.MediaMgrService.getMedia).toHaveBeenCalled();
    });
  });

  describe('trash panel', () => {
    beforeEach(function() {
      const navButton = this.view.find(NAV_TRASH);
      navButton.click();
      this.controller.activeModal = ModalView.Trash;
      this.$scope.$apply();
    });
    it('should have title and desc', function() {
      expect(this.view.find(TRASH_TITLE)).toExist();
      expect(this.view.find(TRASH_DESC)).toExist();
    });
    it('when media is selected and deleted', function() {
      spyOn(this.controller, 'removeMedia').and.callThrough();
      const trash = this.view.find(TRASH_CONTENT);
      trash.eq(0).find(TRASH_BUTTON).click();
      this.$scope.$apply();
      expect(this.controller.removeMedia).toHaveBeenCalled();
      expect(this.MediaMgrService.removeMedia).toHaveBeenCalled();
      expect(this.MediaMgrService.getMedia).toHaveBeenCalled();
    });
    it('when trash is emptied', function() {
      spyOn(this.controller, 'deleteAll').and.callThrough();
      const navButton = this.view.find(EMPTY_TRASH);
      expect(navButton).not.toBeDisabled();
      navButton.click();
      this.$scope.$apply();
      expect(this.controller.deleteAll).toHaveBeenCalled();
      expect(this.MediaMgrService.deleteAll).toHaveBeenCalled();
      expect(this.MediaMgrService.getMedia).toHaveBeenCalled();
      this.controller.mediaList = [];
      this.$scope.$apply();
      expect(navButton).toBeDisabled();
    });
  });
});
