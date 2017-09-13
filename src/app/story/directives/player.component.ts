import { Component, OnDestroy, DoCheck } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { StoryModel, DistributionModel } from '../../shared';
import { TabService } from 'ngx-prx-styleguide';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Env } from '../../core/core.env';
import { AuthService } from 'ngx-prx-styleguide';

const DEFAULT_SUBSCRIPTION = 'https://www.prx.org';
const DEFAULT_IMAGE = '//s3.amazonaws.com/production.mediajoint.prx.org/public/comatose_files/4625/prx-logo_large.png';
const DEFAULT_AUDIO = '//s3.amazonaws.com/production.mediajoint.prx.org/public/comatose_files/0000/meet-prx.mp3';

@Component({
  styleUrls: ['player.component.css'],
  templateUrl: 'player.component.html'
})

export class PlayerComponent implements OnDestroy, DoCheck {

  private tabSub: Subscription;
  private feedUrl: string;
  private episodeGuid: string;
  private enclosureUrl: string;
  private enclosurePrefix: string;
  private authToken: string;
  private title: string;
  private subtitle: string;
  private audioUrl: string;
  private imageUrl: string;
  private subscriptionUrl: string;

  story: StoryModel;
  shouldUseFeeder: boolean;
  previewingUnpublished: boolean;
  loadError: string;

  previewUrl: string;
  previewSafe: SafeResourceUrl;
  copyUrl: string;
  copyIframe: string;

  constructor(tab: TabService, private sanitizer: DomSanitizer, auth: AuthService) {
    this.tabSub = tab.model.subscribe((story: StoryModel) => {
      this.story = story;
      story.getSeriesDistribution('podcast').subscribe(distDoc => {
        this.shouldUseFeeder = distDoc ? true : false;
        this.fromStory(story);
        if (distDoc) {
          this.fromFeeder(story, new DistributionModel(story.parent, distDoc));
        }
      });
    });
    auth.token.subscribe(token => this.authToken = token);
  }

  ngOnDestroy(): any {
    this.tabSub.unsubscribe();
  }

  ngDoCheck() {
    let hasCmsParams = this.title && this.subtitle && this.audioUrl && this.imageUrl && this.subscriptionUrl;
    let hasFeederParams = this.feedUrl && this.episodeGuid;
    if (this.shouldUseFeeder === false && hasCmsParams) {
      this.previewingUnpublished = false;
      this.setCmsLoadError();
      this.buildPlayer(false, false);
    }
    if (this.shouldUseFeeder === true && hasFeederParams) {
      if (this.story.isPublished(60)) {
        this.previewingUnpublished = false;
        this.buildPlayer(true, true);
      } else {
        this.previewingUnpublished = true;
        this.buildPlayer(true, true); // preview via cms params
      }
    }
  }

  fromStory(story: StoryModel) {
    story.loadRelated().subscribe(() => {
      this.title = story.title || '(Untitled)';
      if (story.parent) {
        this.subtitle = story.parent['title'] || '(No Series Title)';
      } else {
        this.subtitle = story.shortDescription || '(No Teaser)';
      }

      if (story.doc.has('alternate')) {
        this.subscriptionUrl = story.doc.expand('alternate');
      } else {
        this.subscriptionUrl = DEFAULT_SUBSCRIPTION;
      }

      // TODO: also the series image for background image
      let img = story.images.find(i => !i.isDestroy);
      this.imageUrl = img ? img.enclosureHref : DEFAULT_IMAGE;

      // TODO: figure out the correct audio version to use
      let version = story.versions.find(v => !v.isDestroy);
      if (version) {
        version.loadRelated('files').subscribe(() => {
          let audio = version.files.find(f => !f.isDestroy);
          this.audioUrl = audio ? audio.enclosureHref : DEFAULT_AUDIO;
        });
      } else {
        this.audioUrl = DEFAULT_AUDIO;
      }
    });
  }

  fromFeeder(story: StoryModel, dist: DistributionModel) {
    dist.loadRelated('podcast').subscribe(() => {
      if (dist.podcast && (dist.podcast.publicFeedUrl || dist.podcast.publishedUrl)) {
        this.feedUrl = dist.podcast.publicFeedUrl || dist.podcast.publishedUrl;
        this.enclosurePrefix = dist.podcast.enclosurePrefix;
      } else {
        this.loadError = 'Error - unable to find the public URL of your podcast!';
      }
    });
    story.loadRelated('distributions').subscribe(() => {
      let storyDistribution = story.distributions.find(d => d.kind === 'episode');
      if (storyDistribution) {
        storyDistribution.loadRelated('episode').subscribe(() => {
          if (storyDistribution.episode && storyDistribution.episode.guid) {
            this.episodeGuid = storyDistribution.episode.guid;
            this.enclosureUrl = storyDistribution.episode.enclosureUrl;
          } else {
            this.loadError = 'Error - unable to find the guid of this podcast episode!';
          }
        });
      } else {
        this.loadError = 'Error - no podcast episode set for this story!';
      }
    });
  }

  buildPlayer(previewFeeder: boolean, copyFeeder: boolean) {
    let cms: string[] = [];
    cms.push(`tt=${this.encode(this.title)}`);
    cms.push(`ts=${this.encode(this.subtitle)}`);
    cms.push(`ua=${this.encode(this.audioUrl)}`);
    cms.push(`ui=${this.encode(this.imageUrl)}`);
    if (this.feedUrl) {
      cms.push(`us=${this.encode(this.feedUrl)}`);
    } else {
      cms.push(`us=${this.encode(this.subscriptionUrl)}`);
    }
    let cmsUrl = `${Env.PLAY_HOST}/e?${cms.join('&')}`;

    let feeder: string[] = [];
    feeder.push(`uf=${this.encode(this.feedUrl)}`);
    feeder.push(`ge=${this.encode(this.episodeGuid)}`);

    if (this.previewingUnpublished) {
      let encUrl = this.previewEnclosure(this.enclosureUrl);
      feeder.push(`ua=${this.encode(encUrl)}`);
    }

    let feederUrl = `${Env.PLAY_HOST}/e?${feeder.join('&')}`;

    // only change the safe resource when the url actually changes
    let newPreview = previewFeeder ? feederUrl : cmsUrl;
    if (this.previewUrl !== newPreview) {
      this.previewUrl = newPreview;
      this.previewSafe = this.sanitizer.bypassSecurityTrustResourceUrl(newPreview);
    }
    this.copyUrl = copyFeeder ? feederUrl : cmsUrl;
    this.copyIframe = this.getIframeHtml(this.copyUrl, 200, 650);
  }

  private setCmsLoadError() {
    if (this.audioUrl === DEFAULT_AUDIO && this.imageUrl === DEFAULT_IMAGE) {
      this.loadError = 'Warning: no audio or image - go back to the basic info tab to set them.';
    } else if (this.audioUrl === DEFAULT_AUDIO) {
      this.loadError = 'Warning: no audio - go back to the basic info tab to add some.';
    } else if (this.imageUrl === DEFAULT_IMAGE) {
      this.loadError = 'Warning: no image - go back to the basic info tab to add one.';
    } else {
      this.loadError = null;
    }
  }

  private getIframeHtml(url: string, width: number, height: number) {
    return `<iframe frameborder="0" height="${height}" width="${width}" src="${url}"></iframe>`;
  }

  private encode (str: string) {
    return encodeURIComponent(str)
      .replace(/[!'()*]/g, (c) => (`%${c.charCodeAt(0).toString(16)}`));
  }

  private previewEnclosure(url: string) {
    if (this.enclosurePrefix) {
      let pre = this.enclosurePrefix.replace(/^http(s*):\/\//, '');
      pre = url.replace(pre, '');
      return `${pre}?_t=${this.encode(this.authToken)}`;
    }
    return url;
  }
}
