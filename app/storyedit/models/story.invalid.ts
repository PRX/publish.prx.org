/**
 * Story field validations
 */
export class StoryInvalid {
  any: boolean = false;
  tags: string = null;

  // Invalid error strings
  title: string = null;
  shortDescription: string = null;
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
    let tagInvalids: string[] = [];
    if (this.genre) {
      tagInvalids.push(`Genre ${this.genre}`);
    }
    if (this.subGenre) {
      tagInvalids.push(`SubGenre ${this.subGenre}`);
    }
    if (this.extraTags) {
      tagInvalids.push(`Tags ${this.extraTags}`);
    }
    this.tags = tagInvalids.length ? tagInvalids.join('; ') : null;

    this.any = false;
    for (let k of this.keys()) {
      if (this[k]) { this.any = true; }
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
