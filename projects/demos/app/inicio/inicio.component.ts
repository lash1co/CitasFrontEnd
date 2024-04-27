import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { LoginService } from 'projects/demos/app/services/login.service';
import xml2js from 'xml2js';
import { ViewChild, TemplateRef} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CorreoService } from '../services/correo.service';

@Component({
  selector: 'mwl-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {
  public xmlUser: any;
  public Id : any;
  public Nombre : any;
  public Rol : any;
  public Telefono : any;
  public Correo : any;

  constructor(
    private fb: FormBuilder,
    private loginServicio: LoginService,
    private correoService: CorreoService,
    private modal: NgbModal,
    private router: Router,
  ) {
    this.Id = localStorage.getItem('Id');
    this.Nombre = localStorage.getItem('Nombre');
    this.Rol = localStorage.getItem('Rol');
    this.Telefono = localStorage.getItem('Telefono');
    this.Correo = localStorage.getItem('Correo');
  }

  ngOnInit(): void {
  }

  public loginForm = this.fb.group({
    user: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  public crearCuentaForm = this.fb.group({
    usuario: ['', [Validators.required]],
    contrasenia: ['', [Validators.required]],
    rol: ['', [Validators.required]],
    idSistema: ['', [Validators.required]],
    telefono: ['', [Validators.required]],
    correo: ['', [Validators.required]]
  });

  // MODAL CREAR CUENTA
  @ViewChild('modalCrearCuenta', { static: true }) modalCrearCuenta: TemplateRef<any>;

  iniciarSesion(): void{
    if( this.loginForm.value.user === "" || this.loginForm.value.password === "" ){
      Swal.fire('Importante!', `Para iniciar sesión debe diligenciar todos los campos del formulario`, 'warning');
    }else{
      this.loginServicio.iniciarSesion( this.loginForm.value ).subscribe( (resp:any) =>{
        console.log("resp: ", resp);
        let objectListaEventos = null;
        let arrayCadenaUno = resp.toString().split("<LoginResponse xmlns=\"http://tempuri.org/\">");
        if(arrayCadenaUno.length > 0){
          let cadenaDos = (arrayCadenaUno[1]).split("</LoginResponse>");
          objectListaEventos = cadenaDos.length > 0 ? cadenaDos[0] : null;
        }
        if(objectListaEventos == null){
          Swal.fire('Error!', `Ha ocurrido un error al realizar el inicio de sesión`, 'error');
        }else{
          resp = objectListaEventos;
          this.parseXML(resp)
          .then((resp) => {
            console.log("resp(Iniciar sesion): ", resp)
            this.xmlUser = resp;

            if( this.xmlUser[0].Id == 0 && this.xmlUser[0].Nombre == 0 ){
              Swal.fire('Importante!', `El usuario y/o contraseña ingresada no corresponde a un usuario de la aplicación, por lo tanto se recomienda crear una cuenta para continuar. `, 'warning');
            }else{
              this.loginForm.reset();
              debugger;
              this.Id = this.xmlUser[0].Id;
              this.Nombre = this.xmlUser[0].Nombre;
              this.Rol = this.xmlUser[0].Rol;
              this.Telefono = this.xmlUser[0].Telefono;
              this.Correo = this.xmlUser[0].Email;

              localStorage.setItem('Id', this.Id);
              localStorage.setItem('Nombre', this.Nombre);
              localStorage.setItem('Rol', this.Rol);

              localStorage.setItem('Telefono', this.Telefono);
              localStorage.setItem('Correo', this.Correo);

              //this.router.navigate(['kitchen-sink']);
              

              window.location.reload();
              //this.router.navigate(['Inicio']);
            }
          });
        }
      }, (err) =>{
        Swal.fire('Error', err.error.msg, 'error');
      })
    }
  }

  reloadCurrentRoute() {
    let currentUrl = 'kitchen-sink';
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  parseXML(data){
    return new Promise(resolve => {
      var k: string | number,
        arr = [],
        parser = new xml2js.Parser(
          {
            trim: true,
            explicitArray: true
          });
      parser.parseString(data, function (err, result) {
        if( result.LoginResult.Id[0] == 0){
          arr.push({
            Id: 0,
            Nombre: 0,
            Rol: 0,
            IdEstado: 0,
            Telefono: 0,
            Email: 0,
          });
        }else{
          arr.push({
            Id: result.LoginResult.Id[0],
            Nombre: result.LoginResult.Nombre[0],
            Rol: result.LoginResult.Rol[0],
            IdEstado: result.LoginResult.IdEstado[0],
            Telefono: result.LoginResult.Telefono[0],
            Email: result.LoginResult.Email[0],
          });
        }
        resolve(arr);
      });
    });
  }

  openModalCrearCuenta(): void{
    this.crearCuentaForm.setValue({
      usuario: '',
      contrasenia: '',
      rol: 2,
      idSistema: 1,
      telefono: '',
      correo: '',
    });
    this.modal.open(this.modalCrearCuenta, { size: 'lg' });
    let message = "Su cuenta ha sido registrada en https://calendarioangular.azurewebsites.net/ lo invitamos a que registre su agenda en el calendario virtual.";
    this.enviarCorreo("Creación de cuenta", "jealvarezo@unal.edu.co", message);
  }

  crearCuenta(): void{
    if( this.crearCuentaForm.value.usuario === "" || this.crearCuentaForm.value.contrasenia === "" ||
        this.crearCuentaForm.value.rol === "" || this.crearCuentaForm.value.idSistema === "" ||
        this.crearCuentaForm.value.telefono === "" || this.crearCuentaForm.value.correo === ""){
      Swal.fire('Importante!', `Para crear una cuenta debe diligenciar todos los campos del formulario`, 'warning');
    }else{
      this.loginServicio.crearCuenta( this.crearCuentaForm.value ).subscribe( (resp:any) =>{
        console.log("resp: ", resp);
        let objectListaEventos = null;
        let arrayCadenaUno = resp.toString().split("<CrearUsuarioResponse xmlns=\"http://tempuri.org/\">");
        if(arrayCadenaUno.length > 0){
          let cadenaDos = (arrayCadenaUno[1]).split("</CrearUsuarioResponse>");
          objectListaEventos = cadenaDos.length > 0 ? cadenaDos[0] : null;
        }
        if(objectListaEventos == null){
          Swal.fire('Error!', `Ha ocurrido un error al realizar el inicio de sesión`, 'error');
        }else{
          resp = objectListaEventos;
          if( resp !== "<CrearUsuarioResult>Usuario creado exitosamente</CrearUsuarioResult>" ){
            Swal.fire('Importante!', `Cuenta no creada, por favor contacte al administrador. `, 'warning');
          }else{
            this.crearCuentaForm.reset();
            this.modal.dismissAll(this.modalCrearCuenta);
            Swal.fire('Bien hecho!', `Cuenta creada con exito, por favor inicie sesión`, 'success');
          }
        }
      }, (err) =>{
        Swal.fire('Error', err.error.msg, 'error');
      })
    }
  }

  enviarCorreo(asunto : any, email : any, mensaje : any): void{
    this.correoService.enviarCorreo( asunto, email, mensaje ).subscribe( (resp:any) =>{
      debugger;
    }, (err) =>{
      debugger;
    })
  }

  cerrarSesion(): void{
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

    window.location.reload();
  }
}

