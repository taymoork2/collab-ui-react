import './_video.scss';
import { VideoModalComponent } from './video.component';

export default angular
  .module('core.video', [])
  .component('crVideoModal', new VideoModalComponent())
  .name;
