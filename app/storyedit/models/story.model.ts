import {CmsService} from '../../shared/cms/cms.service';

export class StoryModel {

  isLoaded: boolean = false;

  id: number;
  title: string;
  shortDescription: string;
  modifiedAt: Date;

  constructor(cms: CmsService, id?: string) {
    if (id) {
      this.id = parseInt(id, 10);
      cms.follow('prx:story', {id: id}).subscribe((doc) => {
        this.title = doc['title'];
        this.shortDescription = doc['shortDescription'];
        this.modifiedAt = new Date();
        this.isLoaded = true;
      });
    } else {
      this.isLoaded = true;
    }
  }

}
