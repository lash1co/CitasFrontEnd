import { HttpClient, HttpHeaders, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, tap } from 'rxjs/operators';
import { parseString } from 'xml2js';
import { AgendarCitaForm } from '../interfaces/form-agendarCita.interface';
import { EditarCitaForm }  from '../interfaces/form-editarCita.interface';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  public urlApiCita = "https://apirestproyectocalendario.azurewebsites.net/api/citas/";
  public httpOptions:any = {};

  constructor(
    private http: HttpClient,
  ) {
    this.httpOptions = {
      headers: new HttpHeaders(
      {
        'Content-Type':  'application/json'
        /*, "Authorization": "Bearer "+this.token*/
      })
    };
  }

  // Crear cita
  public agendarCita = (FormData:AgendarCitaForm) => {
    let fechaInicial = FormData.fechaInicio; // +"T"+FormData.horaInicio+":00.320Z";
    let fechaFinal = FormData.fechaFin; // +"T"+FormData.horaFin+":00.320Z";

    const body = {
      IdEvento: FormData.idEvento,
      FechaInicio: fechaInicial,
      HoraInicio: FormData.horaInicio,
      FechaFin: fechaFinal,
      HoraFin: FormData.horaFin,
      IdUsuario: FormData.idUsuario,
      TituloCita: FormData.tituloCita,
      IdEstado: 1
    }
    console.log("body: ", body);

    return this.http.post(this.urlApiCita+"CrearCita", body, this.httpOptions).pipe(
      map(resp => resp)
    )
  }

  // Listar todas las citas
  public obtenerListaCitas =  () => {
    return this.http.get(this.urlApiCita+'ConsultarCitas', this.httpOptions).pipe(
      map( resp => resp )
    )
  }

  // Consultar los estados de las citas
  public consultarEstados =  () => {
    return this.http.get(this.urlApiCita+'consultarEstados', this.httpOptions).pipe(
      map( resp => resp )
    )
  }

  // Elimina cita
  public eliminarCita = (code) => {
    const json = {
      id: code
    }
    console.log(json);

    return this.http.post(this.urlApiCita+'EliminarCita', json, this.httpOptions).pipe(
      map(resp => resp)
    )
  }

  // Consultar cita por Id
  public consultarCitaPorId = (code) => {
    const json = {
      id: code
    }
    console.log(json);

    return this.http.post(this.urlApiCita+'ConsultarxId', json, this.httpOptions).pipe(
      map(resp => resp)
    )
  }

  // PENDIENTE
  public editarCita =  (FormData:EditarCitaForm) => {
    let fechaInicial = FormData.fechaInicio+"T"+FormData.horaInicio+":00.320Z";
    let fechaFinal = FormData.fechaFin+"T"+FormData.horaFin+":00.320Z";

    const body = {
      id: FormData.id,
      IdEstado: FormData.estado,
      IdEvento: FormData.idEvento,
      TituloCita: FormData.tituloCita,
      FechaInicio: fechaInicial,
      HoraInicio: FormData.horaInicio,
      FechaFin: fechaFinal,
      HoraFin: FormData.horaFin
    }
    console.log("body update: ", body);

    return this.http.post(this.urlApiCita+"UpdateCitaxId", body, this.httpOptions).pipe(
      map(resp => resp)
    )
  }

}