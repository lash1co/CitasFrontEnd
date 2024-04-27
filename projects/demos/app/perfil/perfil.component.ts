import { Component, OnInit } from '@angular/core';
import { LoginService } from 'projects/demos/app/services/login.service';
import xml2js from 'xml2js';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewChild, TemplateRef} from '@angular/core';

@Component({
  selector: 'mwl-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {

  constructor(
    private loginService: LoginService,
    private fb: FormBuilder,
    private modal: NgbModal,
  ) { }

  ngOnInit(): void {
    this.editarPerfilForm.setValue({
      id: localStorage.getItem('Id'),
      usuario: localStorage.getItem('Nombre'),
      rol: localStorage.getItem('Rol'),
      idSistema: 1,
      telefono: localStorage.getItem('Telefono'),
      correo: localStorage.getItem('Correo'),
    });
  }

  public editarPerfilForm = this.fb.group({
    id: ['', [Validators.required]],
    usuario: ['', [Validators.required]],
    rol: ['', [Validators.required]],
    idSistema: ['', [Validators.required]],
    telefono: ['', [Validators.required]],
    correo: ['', [Validators.required]],
  });

  editarPerfil() {
    if( this.editarPerfilForm.value.id === "" || this.editarPerfilForm.value.usuario === "" ||
        this.editarPerfilForm.value.rol === "" ||
        this.editarPerfilForm.value.idSistema === "" || this.editarPerfilForm.value.telefono === "" ||
        this.editarPerfilForm.value.correo === "" ){
      Swal.fire('Importante!', `Para actualizar el perfil debe diligenciar todos los campos`, 'warning');
    }else{
      debugger;
      this.loginService.actualizarCuenta( this.editarPerfilForm.value ).subscribe( (resp:any) =>{
        let arrayCrearEvento = resp.toString().indexOf("Modificacion exiosa");
        if(arrayCrearEvento != -1){
          localStorage.setItem('Telefono', this.editarPerfilForm.value.telefono);
          localStorage.setItem('Correo', this.editarPerfilForm.value.correo);

          this.editarPerfilForm.reset();
          window.location.reload();
        }else{
          Swal.fire('Ha ocurrido un error!', `Por favor contacte al administrador. Perfil no actualizado`, 'error');
        }
      }, (err) =>{
        Swal.fire('Error', err.error.msg, 'error');
        this.editarPerfilForm.reset();
      })
    }
  }

}
