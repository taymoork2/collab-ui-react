export class SettingSetupInitService {
  public selected;
  public location;
  public setSelected(index) {
    this.selected = index;
  }

  public getSelected() {
    return this.selected;
  }

  public setDefaultLocation(_location) {
    this.location = _location;
  }

  public hasDefaultLocation() {
    return this.location;
  }
}
