import {Component} from 'angular2/core';

@Component({
  selector: 'publish-footer',
  styleUrls: ['app/footer/footer.component.css'],
  template: `
    <footer>
      <div class="columns">
        <section>
          <div class="beta-notice">
            <p>
              You're seeing a beta preview of prx.org.
              <a href="http://help.prx.org/anonymous_requests/new">Let us know</a>
              what you think.
            </p>
            <a class="old-version" [href]="desktopUrl()">Use Old Version</a>
          </div>
        </section>
        <section>
          <h3>Company</h3>
          <a href="//www.prx.org/about-us/what-is-prx">About Us</a>
          <a href="//blog.prx.org/">Blog</a>
          <a href="//www.prx.org/about-us/organization">Team</a>
          <a href="//www.prx.org/about-us/press">Press</a>
          <a href="//www.prx.org/about-us/funding">Funding</a>
          <a href="//www.prx.org/donate">Donate</a>
        </section>
        <section>
          <h3>Support</h3>
          <a href="http://help.prx.org/">Help</a>
          <a href="http://status.prx.org/">Status</a>
          <a href="//www.prx.org/terms-of-use">Terms</a>
          <a href="//www.prx.org/privacy-policy">Privacy</a>
        </section>
        <section>
          <h3>Projects</h3>
          <a href="http://www.radiotopia.fm">Radiotopia</a>
          <a href="http://www.matter.vc">Matter Ventures</a>
        </section>
      </div>
      <ul class="social">
        <li><a href="//www.prx.org/newsletters" class="icon-mail-alt"></a></li>
        <li><a href="https://www.twitter.com/prx" class="icon-twitter"></a></li>
        <li>
          <a href="https://www.facebook.com/publicradioexchange" class="icon-facebook-official"></a>
        </li>
      </ul>
    </footer>
    `
})

export class FooterComponent {

  locationPath(): string {
    return window.location.pathname;
  }

  desktopUrl(): string {
    return `http://www.prx.org${this.locationPath()}?m=false`;
  }

}
