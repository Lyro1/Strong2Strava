import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthorizeComponent} from "./pages/authorize/authorize.component";
import {ImportPageComponent} from "./pages/import-page/import-page.component";

const routes: Routes = [
  {path: 'authorize', component: AuthorizeComponent},
  {path: '', component: ImportPageComponent, pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
