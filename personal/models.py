from django.db import models

# Create your models here.

# CREATE TABLE personal(
# 	id_pers INT AUTO_INCREMENT,
#     nom_pers VARCHAR(50) NOT NULL,
#     ape_pers VARCHAR(50) NOT NULL,
#     dni_pers VARCHAR(12) NOT NULL,
#     fec_nac_pers DATE,
#     dom_pers VARCHAR(50) NOT NULL,
#     tel_pers VARCHAR(40) NOT NULL,
#     email_pers VARCHAR(50),
#     matricula VARCHAR(20),
#     activo BOOLEAN DEFAULT TRUE,
#     CONSTRAINT pk_pers PRIMARY KEY(id_pers)
# );

class Puestos(models.Model):
    nombre_puesto = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre_puesto
    class Meta:
        verbose_name = 'Puesto'
        verbose_name_plural = 'Puestos'


class Especialidades(models.Model):
    nombre_esp = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre_esp
    
    class Meta:
        verbose_name = 'Especialidad'
        verbose_name_plural = 'Especialidades'


class Personal(models.Model):
    nombre = models.CharField(max_length=255)
    apellido = models.CharField(max_length=255)
    dni = models.CharField(max_length=255)
    fecha_nacimiento = models.DateField()
    domicilio = models.CharField(max_length=255)
    telefono = models.CharField(max_length=255)
    email = models.EmailField(max_length=255)
    matricula = models.CharField(max_length=255)
    activo = models.BooleanField(default=True)
    puestos = models.ManyToManyField(Puestos, related_name='personal')
    especialidades = models.ManyToManyField(Especialidades, related_name='personal')

    def __str__(self):
        return f"{self.dni} {self.nombre} {self.apellido}"
    
    class Meta:
        verbose_name = 'Personal'
        verbose_name_plural = 'Personal'