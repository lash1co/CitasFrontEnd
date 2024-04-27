import { Component, OnInit } from '@angular/core';
import { EventosBaseService } from 'projects/demos/app/services/eventos.service';
import xml2js from 'xml2js';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewChild, TemplateRef} from '@angular/core';

@Component({
  selector: 'mwl-evento',
  templateUrl: './evento.component.html',
  styleUrls: ['./evento.component.scss']
})
export class EventoComponent implements OnInit {
  public eventoList: any;

  constructor(
    private eventoServicio: EventosBaseService,
    private fb: FormBuilder,
    private modal: NgbModal,
  ) {
    this.listarEventos();
  }

  ngOnInit(): void {
    this.listarEventos();
  }

  editField: string;

  @ViewChild('modalCrearEvento', { static: true }) modalCrearEvento: TemplateRef<any>;
  public crearEventoForm = this.fb.group({
    nombreEvento: ['', [Validators.required]],
  });

  listarEventos(): void{
    //console.log("listarEventos");
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
          this.eventoList = resp;
        });
      }
    }, (err) =>{
      Swal.fire('Error', err.error.msg, 'error');
    })
  }

  updateList(id: number, property: string, event: any) {
    let descripcionEvento = event.target.textContent;
    //console.log("descripcionEvento: ", descripcionEvento);
    debugger;
    if( descripcionEvento === "" ){
      Swal.fire('Importante!', `El campo descripción no debe estar en vacío.`, 'warning');
    }else{
      this.eventoServicio.actualizarEvento( id, descripcionEvento ).subscribe( (resp:any) =>{
        window.location.reload();
      }, (err) =>{
        Swal.fire('Error', err.error.msg, 'error');
      })
    }
  }

  changeValue(id: number, property: string, event: any) {
    //console.log("changeValue: id: ", id, " property: ", property);
    /*this.editField = event.target.textContent;*/
  }

  openModalCrearEvento(): void{
    this.modal.open(this.modalCrearEvento, { size: 'lg' });
  }

  crearEvento() {
    if( this.crearEventoForm.value.nombreEvento === "" ){
      Swal.fire('Importante!', `Para crear un evento debe diligenciar los campos`, 'warning');
    }else{
      this.eventoServicio.crearEvento( this.crearEventoForm.value.nombreEvento ).subscribe( (resp:any) =>{
        let arrayCrearEvento = resp.toString().indexOf("El evento ha sido creado");
        if(arrayCrearEvento != -1){
          this.modal.dismissAll(this.modalCrearEvento);
          //Swal.fire('Bien hecho!', `Evento creado con exito`, 'success');
          this.crearEventoForm.reset();
          window.location.reload();
        }else{
          Swal.fire('Ha ocurrido un error!', `Por favor contacte al administrador. Evento no creado`, 'error');
        }
      }, (err) =>{
        Swal.fire('Error', err.error.msg, 'error');
        this.crearEventoForm.reset();
      })
    }
  }

  remove(id: any) {
    console.log("Remover: ", id);
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
}
