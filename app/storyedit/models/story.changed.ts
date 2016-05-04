/**
 * Track changeable attributes
 */
export class StoryChanged {
  any: boolean = false;
  tags: boolean = false;

  // Change-able values (must have default = false)
  title: boolean = false;
  shortDescription: boolean = false;
  genre: boolean = false;
  subGenre: boolean = false;
  extraTags: boolean = false;

  // Initial values
  initial: any = {};

  constructor(data: any = {}) {
    for (let key of this.keys()) {
      this.initial[key] = data[key];
    }
  }

  keys(): string[] {
    return Object.keys(this).filter((key) => {
      return key !== 'initial';
    });
  }

  set(key: string, value: any) {
    if (this.keys().indexOf(key) < 0) {
      console.error(`Changing unknown key ${key}!`);
    }
    this[key] = this.initial[key] !== value;

    // aggregate fields
    this.tags = (this.genre || this.subGenre || this.extraTags);

    this.any = false;
    for (let k of this.keys()) {
      if (this[k]) { this.any = true; }
    }
  }

}
