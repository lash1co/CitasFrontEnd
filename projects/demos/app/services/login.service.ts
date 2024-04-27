import { HttpClient, HttpHeaders, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, tap } from 'rxjs/operators';
import { parseString } from 'xml2js';
import { LoginForm } from '../interfaces/form-iniciarSesion.interface';
import { CrearCuentaForm } from '../interfaces/form-crearCuenta.interface';
import { ActualizarCuentaForm } from '../interfaces/form-actualizarCuenta.interface';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  public httpOptions:any = {};
  public url = "https://loginproyectocalendario.azurewebsites.net/Services/WebServiceLogin.asmx";

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

  public iniciarSesion = (FormData:LoginForm) => {
    let body = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">\r\n  <soap:Body>\r\n    <Login xmlns=\"http://tempuri.org/\">\r\n        <usuario>"+FormData.user+"</usuario>\r\n        <contrasenia>"+FormData.password+"</contrasenia>\r\n        <idSistema>1</idSistema>\r\n    </Login>\r\n  </soap:Body>\r\n</soap:Envelope>";
    return this.http.post(this.url, body, this.httpOptions).pipe(
      map( resp => resp )
    );
  }

  public crearCuenta = (FormData:CrearCuentaForm) => {
    let body = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">\r\n  <soap:Body>\r\n    <CrearUsuario xmlns=\"http://tempuri.org/\">\r\n        <usuario>"+FormData.usuario+"</usuario>\r\n        <contrasenia>"+FormData.contrasenia+"</contrasenia>\r\n        <rol>"+FormData.rol+"</rol>\r\n        <idSistema>"+FormData.idSistema+"</idSistema>\r\n        <telefono>"+FormData.telefono+"</telefono>\r\n        <correo>"+FormData.correo+"</correo>\r\n    </CrearUsuario>\r\n  </soap:Body>\r\n</soap:Envelope>"
    return this.http.post(this.url, body, this.httpOptions).pipe(
      map( resp => resp )
    );
  }

  public actualizarCuenta = (FormData:ActualizarCuentaForm) => {
    let body = "<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">\r\n  <soap:Body>\r\n    <UpdateUsuario xmlns=\"http://tempuri.org/\">\r\n        <usuario>"+FormData.usuario+"</usuario>\r\n\r\n\r\n        <telefono>"+FormData.telefono+"</telefono>\r\n        <correo>"+FormData.correo+"</correo>\r\n\r\n        <rol>"+FormData.rol+"</rol>\r\n        <idSistema>"+FormData.idSistema+"</idSistema>\r\n        <idEstado>1</idEstado>\r\n    </UpdateUsuario>\r\n  </soap:Body>\r\n</soap:Envelope>";
    return this.http.post(this.url, body, this.httpOptions).pipe(
      map( resp => resp )
    );
  }

}