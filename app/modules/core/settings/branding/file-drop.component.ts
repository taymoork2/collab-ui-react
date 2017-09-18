import { ImgFile } from './device-branding-setting.controller';

class FiledropCtrl implements ng.IComponentController {
  //bindings
  public imgFile: ImgFile;
}

export class FileDropComponent implements ng.IComponentOptions {
  public controller = FiledropCtrl;
  public template = require('modules/core/settings/branding/file-drop.html');
  public bindings = {
    imgFile: '<',
    header: '<',
  };
}
