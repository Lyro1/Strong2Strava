import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ImportPageComponent } from './pages/import-page/import-page.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GlobeComponent } from './components/globe/globe.component';
import { AuthorizeComponent } from './pages/authorize/authorize.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AuthInterceptor} from "./interceptors/httpInterceptor";
import { NgOptimizedImage } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    ImportPageComponent,
    GlobeComponent,
    AuthorizeComponent
  ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        NgbModule,
        NgOptimizedImage
    ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
