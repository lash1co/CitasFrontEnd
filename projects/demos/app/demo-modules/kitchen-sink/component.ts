import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours } from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView} from 'angular-calendar';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import Swal from 'sweetalert2';
import { CitaService } from 'projects/demos/app/services/cita.service';
import { EventosBaseService } from 'projects/demos/app/services/eventos.service';
import xml2js from 'xml2js';
import { isDebuggerStatement } from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import { replace } from 'sinon';
registerLocaleData(localeEs);

const colors: any = {
  red: {
    primary: '#FF1B00',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  green: {
    primary: '#23BE00',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'mwl-demo-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['styles.css'],
  templateUrl: 'template.html',
})

export class DemoComponent {
  public idUser = localStorage.getItem('Id');

  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();
  public events: CalendarEvent[] = [];
  public evento: any[] = [];
  //public cita: any[] = [];

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  public agendarCitaForm = this.fb.group({
    idEvento: ['', [Validators.required]],
    fechaInicio: ['', [Validators.required]],
    horaInicio: ['', [Validators.required]],
    fechaFin: ['', [Validators.required]],
    horaFin: ['', [Validators.required]],
    idUsuario: ['', [Validators.required]],
    tituloCita: ['', [Validators.required]],
  });

  public editarCitaForm = this.fb.group({
    id: ['', [Validators.required]],
    tituloCita: ['', [Validators.required]],
    idEvento: ['', [Validators.required]],
    horaInicio: ['', [Validators.required]],
    horaFin: ['', [Validators.required]],
    fechaInicio: ['', [Validators.required]],
    fechaFin: ['', [Validators.required]],
    estado: ['', [Validators.required]],
    idUsuario: ['', [Validators.required]],
  });

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  refresh: Subject<any> = new Subject();

  activeDayIsOpen: boolean = true;

  constructor(
    private citaServicio: CitaService,
    private eventoServicio: EventosBaseService,
    private modal: NgbModal,
    private fb: FormBuilder
  ) {
    this.consultarCitas();
    this.consultarEventos();
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    if( action == "Deleted" ){
      Swal.fire({
        title: 'Estas seguro?',
        text: "Desea eliminar la cita seleccionada!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#007bff',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, Eliminarlo!',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.eliminarCita(event.id);
        }else{
          this.consultarCitas();
          this.agendarCitaForm.reset();
        }
      })
    }else if( action == "Clicked" || action == "Edited" ){
      //cita
      this.citaServicio.consultarCitaPorId( event.id ).subscribe( (resp:any) =>{
        console.log("resp: ", resp);
        if(resp !== null){
          //this.cita = resp;

          this.editarCitaForm.setValue({
            id: resp.IdCita,
            tituloCita: resp.TituloCita,
            idEvento: resp.idEvento,
            horaInicio: resp.HoraInicio,
            horaFin: resp.HoraFin,
            fechaInicio: resp.FechaInicio.split("T")[0], //"2021-11-22",
            fechaFin: resp.FechaFin.split("T")[0],
            estado: resp.IdEstado,
            idUsuario: resp.IdUsuario,
          });

          this.modal.open(this.modalContent, { size: 'lg' });
        }else{
          Swal.fire('Ha ocurrido un error!', `Por favor contacte al administrador. Cita no consultada`, 'error');
        }
      }, (err) =>{
        Swal.fire('Error', err.error.msg, 'error');
      })
    }
  }

  consultarCitas(): void {
    console.log("consultarCitas()");
    this.citaServicio.obtenerListaCitas().subscribe( (resp:any) =>{
      this.events = [];
      console.log("resp: ", resp);
      resp.forEach((cita : any, resp :any) => {
        let color = colors.green;
        if(cita.IdEstado == 1){
          // Registrada
          color = colors.blue;
        }else if(cita.IdEstado == 2){
          // Cancelada
          color = colors.red;
        }
        let fecInicio = (cita.FechaInicio).split("T")[0];
        let fecFin = (cita.FechaFin).split("T")[0];

        let arrayHoraIn = (cita.HoraInicio).split(":");
        let horaIn = parseInt(arrayHoraIn[0]) > 12 ? (parseInt(arrayHoraIn[0])-12)+":"+arrayHoraIn[1]+" pm" : cita.HoraInicio+" am";

        let arrayHoraFn = (cita.HoraFin).split(":");
        let horaFn = parseInt(arrayHoraFn[0]) > 12 ? (parseInt(arrayHoraFn[0])-12)+":"+arrayHoraFn[1]+" pm" : cita.HoraFin+" am";

        this.events = [
          ...this.events,
          {
            id: cita.IdCita,
            title: horaIn +" a "+ horaFn +" -> "+ cita.Nom_Evento +" - "+ cita.TituloCita +" - "+ cita.Nombre,
            start: new Date( fecInicio+"T"+cita.HoraInicio+":00.320Z"),
            end:   new Date( fecFin+"T"+cita.HoraFin+":00.320Z"),
            color: color,
            draggable: false,
            resizable: {
              beforeStart: false,
              afterEnd: false,
            },
            actions: this.actions
          },
        ];
        this.refresh.next();
      })
    }, (err) =>{
      Swal.fire('Error', err.error.msg, 'error');
    })
  }

  consultarEventos(): void {
    console.log("consultarEventos()");
    this.evento = [];
    this.eventoServicio.obtenerListaEventos().subscribe( (resp:any) =>{
      let objectListaEventos = null;
      let arrayCadenaUno = resp.toString().split("<ListarEventosResponse xmlns=\"http://tempuri.org/\">");
      if(arrayCadenaUno.length > 0){
        let cadenaDos = (arrayCadenaUno[1]).split("</ListarEventosResponse>");
        objectListaEventos = cadenaDos.length > 0 ? cadenaDos[0] : null;
      }
      if(objectListaEventos == null){
        //Swal.fire('No existen eventos!', `0 Registros retornados`, 'error');
      }else{
        resp = objectListaEventos;
        this.parseXML(resp)
        .then((resp: any[]) => {
          this.evento = resp;
        });
        this.refresh.next();
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

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  agendarCita(): void{
    this.agendarCitaForm.value.idUsuario = this.idUser;
    if( this.agendarCitaForm.value.idEvento === "" || this.agendarCitaForm.value.fechaInicio === "" ||
        this.agendarCitaForm.value.horaInicio === "" || this.agendarCitaForm.value.fechaFin === "" ||
        this.agendarCitaForm.value.horaFin === "" || this.agendarCitaForm.value.idUsuario === "" ||
        this.agendarCitaForm.value.tituloCita === "" ){
      Swal.fire('Importante!', `Para agendar una cita debe diligenciar todos los campos del formulario antes de oprimir el botón crear`, 'warning');
    }else{
      this.citaServicio.agendarCita( this.agendarCitaForm.value ).subscribe( (resp:any) =>{
        console.log("resp: ", resp);
        if(resp === "Cita creada exitosamente"){
          this.consultarCitas();
          Swal.fire('Bien hecho!', `Cita agendada con exito`, 'success');
          this.agendarCitaForm.reset();
        }else if(resp === "No se pudo crear su cita debido a que este espacio ya ha sido agendado "){
          Swal.fire('Precaución!', `No se pudo crear su cita debido a que este espacio ya ha sido agendado`, 'warning');
          this.agendarCitaForm.reset();
        }else{
          Swal.fire('Ha ocurrido un error!', `Por favor contacte al administrador. Cita no agendada`, 'error');
        }
      }, (err) =>{
        Swal.fire('Error', err.error.msg, 'error');
      })
    }
  }

  eliminarCita(id): void{
    this.citaServicio.eliminarCita( id ).subscribe( (resp:any) =>{
      console.log("resp: ", resp);
      if(resp === "Cita eliminada exitosamente"){
        this.consultarCitas();
        Swal.fire('Bien hecho!', `Cita eliminada con exito`, 'success');
        this.agendarCitaForm.reset();
      }else{
        Swal.fire('Ha ocurrido un error!', `Por favor contacte al administrador. Cita no eliminada`, 'error');
      }
    }, (err) =>{
      Swal.fire('Error', err.error.msg, 'error');
    })
  }

  editarCita(): void{
    if( this.editarCitaForm.value.id === "" || this.editarCitaForm.value.tituloCita === "" ||
        this.editarCitaForm.value.idEvento === "" || this.editarCitaForm.value.horaInicio === "" ||
        this.editarCitaForm.value.horaFin === "" || this.editarCitaForm.value.fechaInicio === "" ||
        this.editarCitaForm.value.fechaFin === "" || this.editarCitaForm.value.estado === "" ||
        this.editarCitaForm.value.idUsuario === ""){
      Swal.fire('Importante!', `Para actualizada una cita debe diligenciar todos los campos del formulario antes de oprimir el botón actualizar`, 'warning');
    }else{
      this.citaServicio.editarCita( this.editarCitaForm.value ).subscribe( (resp:any) =>{
        console.log("resp: ", resp);
        if(resp === "resultado"){
          this.consultarCitas();
          Swal.fire('Bien hecho!', `Cita actualizada con exito`, 'success');
          this.editarCitaForm.reset();
          this.modal.dismissAll(this.modalContent);
        }else{
          Swal.fire('Ha ocurrido un error!', `Por favor contacte al administrador. Cita no actualizada`, 'error');
        }
      }, (err) =>{
        Swal.fire('Error', err.error.msg, 'error');
      })
    }
  }

}
