import { HttpClient, HttpHeaders, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { debug } from 'console';
import { catchError, map, tap } from 'rxjs/operators';
import { parseString } from 'xml2js';
import { LoginForm } from '../interfaces/form-iniciarSesion.interface';

@Injectable({
  providedIn: 'root'
})
export class CorreoService {
  public httpOptions:any = {};
  public url = "http://notificacionwcfproyectocalendario.azurewebsites.net/notificacion.svc";

  constructor(
    private http: HttpClient,
  ) {
    this.httpOptions = { 
      headers: new HttpHeaders({ 
        'Content-Type':  'text/xml; charset=utf-8',
        'Accept': 'text/xml'
      }),
      responseType: "text"
    };
  }

  public enviarCorreo = ( asunto: any, email: any, mensaje: any ) => {
    let body = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">\n  <soap:Body>\n    <Notificar xmlns=\"http://tempuri.org/\">\n      <notificacion xmlns:d4p1=\"http://schemas.datacontract.org/2004/07/NotificacionWebService\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">\n        <d4p1:asunto>"+asunto+"</d4p1:asunto>\n        <d4p1:destinatario>"+email+"</d4p1:destinatario>\n        <d4p1:hash>MicroServicios</d4p1:hash>\n        <d4p1:mensaje>"+mensaje+"</d4p1:mensaje>\n      </notificacion>\n    </Notificar>\n  </soap:Body>\n</soap:Envelope>\n";
    debugger;
    return this.http.post(this.url, body, this.httpOptions).pipe(
      map( resp => resp )
    );
  }

}