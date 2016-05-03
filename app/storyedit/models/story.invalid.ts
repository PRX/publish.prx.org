/**
 * Story field validations
 */
export class StoryInvalid {
  any: boolean = false;

  // Invalid error strings
  title: string = null;
  shortDescription: string = null;
  tags: string = null;
  genre: string = null;
  subGenre: string = null;
  extraTags: string = null;

  constructor(data: any = {}) {
    for (let key of this.keys()) {
      this.set(key, data[key]);
    }
  }

  keys(): string[] {
    return Object.keys(this);
  }

  set(key: string, value: any) {
    if (this.keys().indexOf(key) < 0) {
      console.error(`Validating unknown key ${key}!`);
    }

    // run validations
    switch (key) {
      case 'title':
        this.title = this.require(value) || this.minLength(value, 10);
        break;
      case 'shortDescription':
        this.shortDescription = this.require(value) || this.minLength(value, 10);
        break;
      case 'genre':
        this.genre = this.require(value);
        break;
      case 'subGenre':
        this.subGenre = this.require(value);
        break;
      case 'extraTags':
        this.extraTags = this.tagLength(value, 3);
        break;
      default:
        break;
    }

    // aggregate fields
    this.tags = null;
    if (this.genre) {
      this.tags = `Genre ${this.genre}`;
    } else if (this.subGenre) {
      this.tags = `SubGenre ${this.subGenre}`;
    } else if (this.extraTags) {
      this.tags = `Tags ${this.extraTags}`;
    }

    this.any = false;
    for (let k of this.keys()) {
      this.any = this.any || this[k];
    }
  }

  private require(value: any) {
    return (value && value.length > 0) ? null : 'is required';
  }

  private minLength(value: any, min: number) {
    return (value.length >= min) ? null : 'is too short';
  }

  private tagLength(value: any, min: number) {
    let tags = (value || '').replace(/\s*,\s*/, ',').split(',');
    for (let tag of tags) {
      if (tag && tag.length < 3) {
        return `must contain at least 3 characters per tag (see ${tag})`;
      }
    }
    return null;
  }

}
