import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {StravaService} from "../../services/strava/strava.service";


export enum StravaToken {
  'accessToken' = 'strava_accessToken',
  'refreshToken' = 'strava_refreshToken',
  'expires_at' = 'strava_expiresAt'
}
export interface Tokens {
  token_type: string
  expires_at: number
  expires_in: number
  refresh_token: string
  access_token: string
}

@Component({
  selector: 'app-authorize',
  templateUrl: './authorize.component.html',
  styleUrls: ['./authorize.component.scss']
})
export class AuthorizeComponent implements OnInit {

  private authorizationHasFailed = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private http: HttpClient,
              private strava: StravaService) {
  }

  ngOnInit() {
    this.route.queryParams
      .subscribe(params => {
          console.log(params);
          if (params['error'] !== undefined && params['error'] !== null) {
            console.error("Error occured:" + params['error']);
          }
          const authorizationCode = params['code'];
          const scopes = params['scope'];
          if (authorizationCode === null) {
            console.error("No authorization found for Strava");
            return;
          }
          if (scopes === undefined || scopes === null || !this.checkIfValidScopes(scopes)) {
            console.error("Invalid scopes given.");
            return;
          }

          console.log("Code has been found: " + authorizationCode);

          // Exchange the authorizationCode for an authentication token and refresh token
          this.http.post<Tokens>(
            this.strava.getTokenRequestURL(),
            this.strava.getTokenRequestBody(authorizationCode))
            .subscribe(
            (data: Tokens) => {
              localStorage.setItem(StravaToken.accessToken, data.access_token);
              localStorage.setItem(StravaToken.refreshToken, data.refresh_token);
              localStorage.setItem(StravaToken.expires_at, data.expires_at.toString());
              this.router.navigate(['']);
            }
          )
        }
      );
  }

  private checkIfValidScopes(scopes: string): boolean {
    let splitted_scopes = scopes.split(',');
    return splitted_scopes.includes('activity:write') && splitted_scopes.includes('activity:read_all');
  }

}

/*
https://www.strava.com/api/v3/oauth/token?client_id=99768&client_secret=e7ed049f182611bcc463cab19e4c720c4edc78c4&code=48e3036741f94d3efd4b05f723bde8c719d726db&grant_type=authorization_code
https://www.strava.com/api/v3/oauth/token?client_id=XXXXX&
 */
