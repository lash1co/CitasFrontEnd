import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { map, take, filter } from 'rxjs/operators';
import StackBlitzSDK from '@stackblitz/sdk';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ViewChild, TemplateRef} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventosBaseService } from 'projects/demos/app/services/eventos.service';
import { debug } from 'console';
import { HttpClient, HttpHeaders, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import xml2js from 'xml2js';
import { DemoComponent } from 'projects/demos/app/demo-modules/kitchen-sink/component';
import { InicioComponent } from './inicio/inicio.component';

interface Source {
  filename: string;
  contents: {
    raw: string;
    highlighted: string;
  };
  language: string;
}

interface Demo {
  label: string;
  path: string;
  sources?: Source[];
  darkTheme: boolean;
  tags: string[];
}

async function getSources(folder: string): Promise<Source[]> {
  const { sources } = await import('./demo-modules/' + folder + '/sources.ts');

  return sources.map(({ filename, contents }) => {
    const [, extension]: RegExpMatchArray = filename.match(/^.+\.(.+)$/);
    const languages: { [extension: string]: string } = {
      ts: 'typescript',
      html: 'html',
      css: 'css',
    };
    return {
      filename,
      contents: {
        raw: contents.raw.default
          .replace(
            ",\n    RouterModule.forChild([{ path: '', component: DemoComponent }])",
            ''
          )
          .replace("\nimport { RouterModule } from '@angular/router';", ''),
        highlighted: contents.highlighted.default // TODO - move this into a regexp replace for both
          .replace(
            ',\n    RouterModule.forChild([{ path: <span class="hljs-string">\'\'</span>, component: DemoComponent }])',
            ''
          )
          .replace(
            '\n<span class="hljs-keyword">import</span> { RouterModule } from <span class="hljs-string">\'@angular/router\'</span>;',
            ''
          ),
      },
      language: languages[extension],
    };
  });
}

const dependencyVersions: any = {
  angular: require('@angular/core/package.json').version,
  angularRouter: require('@angular/router/package.json').version,
  angularCalendar: require('../../../package.json').version,
  calendarUtils: require('calendar-utils/package.json').version,
  angularResizableElement: require('angular-resizable-element/package.json')
    .version,
  angularDraggableDroppable: require('angular-draggable-droppable/package.json')
    .version,
  dateFns: require('date-fns/package.json').version,
  rxjs: require('rxjs/package.json').version,
  bootstrap: require('bootstrap-css-only/package.json').version,
  zoneJs: require('zone.js/package.json').version,
  ngBootstrap: require('@ng-bootstrap/ng-bootstrap/package.json').version,
  rrule: require('rrule/package.json').version,
  fontAwesome: require('@fortawesome/fontawesome-free/package.json').version,
  positioning: require('positioning/package.json').version,
  flatpickr: require('flatpickr/package.json').version,
  angularxFlatpickr: require('angularx-flatpickr/package.json').version,
};

@Component({
  providers:[DemoComponent],
  selector: 'mwl-demo-app',
  styleUrls: ['./demo-app.css'],
  templateUrl: './demo-app.html',
})

export class DemoAppComponent implements OnInit {
  public xmlItems: any;
  public objectEventos;

  public Id: any;
  public Nombre: any;
  public Rol: any;
  public Correo: any;
  public Telefono: any;

  public crearEventoForm = this.fb.group({
    nombreEvento: ['', [Validators.required]],
  });

  // MODAL AGENDAR CITA
  @ViewChild('modalAgendarCita', { static: true }) modalAgendarCita: TemplateRef<any>;
  modalData: {
    action: string;
    event: "";
  };

  // MODAL LISTAR EVENTOS
  @ViewChild('modalListarEventos', { static: true }) modalListarEventos: TemplateRef<any>;
  // FIN MODAL LISTAR EVENTOS 

  // MODAL LISTAR EVENTOS
  @ViewChild('modalCrearEvento', { static: true }) modalCrearEvento: TemplateRef<any>;
  // FIN MODAL LISTAR EVENTOS 

  demos: Demo[] = [];
  filteredDemos: Demo[] = [];
  activeDemo: Demo;
  isMenuVisible = false;
  firstDemoLoaded = false;
  searchText = '';
  copied$ = new Subject<boolean>();

  constructor(
    private demoComponent: DemoComponent,
    private eventoServicio: EventosBaseService,
    analytics: Angulartics2GoogleAnalytics,
    private modal: NgbModal,
    private fb: FormBuilder,
    private router: Router,
  ) {
    analytics.startTracking();
    this.Id = localStorage.getItem('Id');
    this.Nombre = localStorage.getItem('Nombre');
    this.Rol = localStorage.getItem('Rol');

    this.Correo = localStorage.getItem('Correo');
    this.Telefono = localStorage.getItem('Telefono');
  }

  ngOnInit() {
    const defaultRoute = this.router.config.find(
      (route) => route.path === '**'
    );

    this.demos = this.router.config
      .filter((route) => route.path !== '**')
      .map((route) => ({
        path: route.path,
        label: route.data.label,
        darkTheme: route.data.darkTheme,
        tags: route.data.tags || [],
      }));

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .pipe(take(1))
      .subscribe(() => {
        this.firstDemoLoaded = true;
      });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .pipe(
        map((event: NavigationStart) => {
          if (event.url === '/') {
            return { url: `/${defaultRoute.redirectTo}` };
          }
          return event;
        })
      )
      .subscribe(async (event: NavigationStart) => {
        this.activeDemo = this.demos.find(
          (demo) => `/${demo.path}` === event.url
        );
        this.activeDemo.sources = await getSources(this.activeDemo.path);
      });

    /*const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-uid', '7c1627e655');
    script.src = 'https://angular-calendar.ck.page/7c1627e655/index.js';
    document.getElementsByTagName('head')[0].appendChild(script);*/

    
  }

  copied() {
    this.copied$.next(true);
    setTimeout(() => {
      this.copied$.next(false);
    }, 1000);
  }

  openModalAgendarCita(): void {
    this.modal.open(this.modalAgendarCita, { size: 'lg' });
  }

  openModalListarEventos(): void{
    console.log("openModalCrearEvento");
    this.eventoServicio.obtenerListaEventos().subscribe( (resp:any) =>{
      let objectListaEventos = null;
      let arrayCadenaUno = resp.toString().split("<ListarEventosResponse xmlns=\"http://tempuri.org/\">");
      if(arrayCadenaUno.length > 0){
        let cadenaDos = (arrayCadenaUno[1]).split("</ListarEventosResponse>");
        objectListaEventos = cadenaDos.length > 0 ? cadenaDos[0] : null;
      }
      if(objectListaEventos == null){
        Swal.fire('No existen eventos!', `0 Registros retornados`, 'error');
      }else{
        resp = objectListaEventos;
        this.parseXML(resp)
        .then((resp) => {
          this.xmlItems = resp;
        });
        this.modal.open(this.modalListarEventos, { size: 'lg' });
      }
    }, (err) =>{
      Swal.fire('Error', err.error.msg, 'error');
    })
  }

  parseXML(data) {
    return new Promise(resolve => {
      var k: string | number,
        arr = [],
        parser = new xml2js.Parser(
          {
            trim: true,
            explicitArray: true
          });
      parser.parseString(data, function (err, result) {
        var obj = result.ListarEventosResult;
        for (k in obj.Evento) {
          var item = obj.Evento[k];
          arr.push({
            Id: item.Id[0],
            Nom_Evento: item.Nom_Evento[0],
            IdEstado: item.IdEstado[0]
          });
        }

        resolve(arr);
      });
    });
  }

  openModalCrearEvento(): void{
    this.modal.open(this.modalCrearEvento, { size: 'lg' });
  }

  crearEvento(): void{
    if( this.crearEventoForm.value.nombreEvento === "" ){
      Swal.fire('Importante!', `Para crear un evento debe diligenciar los campos`, 'warning');
    }else{
      this.eventoServicio.crearEvento( this.crearEventoForm.value.nombreEvento ).subscribe( (resp:any) =>{
        let arrayCrearEvento = resp.toString().indexOf("El evento ha sido creado");
        if(arrayCrearEvento != -1){
          this.modal.dismissAll(this.modalCrearEvento);
          Swal.fire('Bien hecho!', `Evento creado con exito`, 'success');
          //window.location.reload();
        }else{
          Swal.fire('Ha ocurrido un error!', `Por favor contacte al administrador. Evento no creado`, 'error');
        }
        this.crearEventoForm.reset();
      }, (err) =>{
        Swal.fire('Error', err.error.msg, 'error');
        this.crearEventoForm.reset();
      })
    }
  }

  cerrarSesion(): void{
    Swal.fire({
      title: 'Esta seguro?',
      text: "Desea cerrar la sesión!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Cerrar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('Id');
        localStorage.removeItem('Nombre');
        localStorage.removeItem('Rol');

        localStorage.removeItem('Telefono');
        localStorage.removeItem('Correo');

        this.Id = "";
        this.Nombre = "";
        this.Rol = "";
        this.Correo = "";
        this.Telefono = "";

        this.router.navigate(['inicio']);
      }
    })

    //window.location.reload();
  }

}