import { HttpClient, HttpHeaders, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, tap } from 'rxjs/operators';
import { parseString } from 'xml2js';
//import { RegisterForm } from '../interfaces/form-crearUsuario.interface';


@Injectable({
  providedIn: 'root'
})
export class EventosBaseService {
  public url = "https://eventosproyectocalendario.azurewebsites.net/Services/WebServiceEvento.asmx";
  public httpOptions:any = {};

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

  public obtenerListaEventos =  () => {
    let body = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">\r\n  <soap:Body>\r\n    <ListarEventos xmlns=\"http://tempuri.org/\">\r\n    </ListarEventos>\r\n  </soap:Body>\r\n</soap:Envelope>";
    return this.http.post(this.url, body, this.httpOptions).pipe(
      map( resp => resp )
    );
  }

  public crearEvento =  (nombreEvento) => {
    let body = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">\r\n  <soap:Body>\r\n    <CrearEvento xmlns=\"http://tempuri.org/\">\r\n        <evento>"+nombreEvento+"</evento>\r\n        <estado>1</estado>\r\n    </CrearEvento>\r\n  </soap:Body>\r\n</soap:Envelope>"
    return this.http.post(this.url, body, this.httpOptions).pipe(
      map( resp => resp )
    );
  }

  public actualizarEvento =  (id: number, descripcion : string) => {
    let body = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">\r\n  <soap:Body>\r\n    <ActualizarEvento xmlns=\"http://tempuri.org/\">\r\n        <id>"+id+"</id>\r\n        <evento>"+descripcion+"</evento>\r\n        <estado>1</estado>\r\n    </ActualizarEvento>\r\n  </soap:Body>\r\n</soap:Envelope>"
    return this.http.post(this.url, body, this.httpOptions).pipe(
      map( resp => resp )
    );
  }

}