import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NgbTabsetModule, NgbCollapseModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Angulartics2Module } from 'angulartics2';
import { DragAndDropModule } from 'angular-draggable-droppable';
import { DemoAppComponent } from './demo-app.component';
import { DemoComponent as DefaultDemoComponent } from './demo-modules/kitchen-sink/component';
import { DemoModule as DefaultDemoModule } from './demo-modules/kitchen-sink/module';
import { environment } from '../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { CarbonAdComponent } from './carbon-ad/carbon-ad.component';
import { InicioComponent } from './inicio/inicio.component';
import { EventoComponent } from './evento/evento.component';
import { PerfilComponent } from './perfil/perfil.component';

//import { HomeComponent } from './home/component';
//import { HomeModule } from './home/module';

@NgModule({
  declarations: [DemoAppComponent, CarbonAdComponent, InicioComponent, EventoComponent, PerfilComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTabsetModule,
    NgbCollapseModule,
    NgbTooltipModule,
    DragAndDropModule,
    HttpClientModule,
    Angulartics2Module.forRoot({
      developerMode: !environment.production,
    }),
    ClipboardModule,
    DefaultDemoModule,
    //HomeModule,
    RouterModule.forRoot(
      [
        {
          path: 'kitchen-sink',
          component: DefaultDemoComponent,
          data: {
            label: 'Kitchen sink',
          },
        },
        {
          path: 'inicio',
          component: InicioComponent,
          data: {
            label: 'inicio',
          },
        },
        {
          path: 'evento',
          component: EventoComponent,
          data: {
            label: 'evento',
          },
        },
        {
          path: 'perfil',
          component: PerfilComponent,
          data: {
            label: 'perfil',
          },
        },
        {
          path: '**',
          //redirectTo: 'kitchen-sink',
          redirectTo: 'inicio',
        },
      ],
      {
        useHash: true,
      }
    ),
  ],
  bootstrap: [DemoAppComponent],
})

export class DemoAppModule {}