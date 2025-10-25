from django.db import models

# Create your models here.

    
class AnalisisFuncional(models.Model):
    nombre_analisis = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre_analisis
    
    class Meta:
        verbose_name = 'Analisis funcional'
        verbose_name_plural = 'Analisis funcionales'


class Antecedentes(models.Model):
    nombre_ant = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre_ant
    
    class Meta:
        verbose_name = 'Antecedente'
        verbose_name_plural = 'Antecedentes'

class Generos(models.Model):
    nombre_ge = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre_ge
    
    class Meta:
        verbose_name = 'Genero'
        verbose_name_plural = 'Generos'

class ObrasSociales(models.Model):
    nombre_os = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre_os
    
    class Meta:
        verbose_name = 'Obra Social'
        verbose_name_plural = 'Obras Sociales'


class Pacientes(models.Model):
    nombre = models.CharField(max_length=255)
    apellido = models.CharField(max_length=255)
    dni = models.CharField(max_length=255)
    fecha_nacimiento = models.DateField()
    domicilio = models.CharField(max_length=255, blank=True, null=True)
    telefono = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, blank=True, null=True)
    antecedentes = models.ManyToManyField(
        Antecedentes, 
        related_name='pacientes',
        blank=True,
        )
    analisis_funcional = models.ManyToManyField(
        AnalisisFuncional, 
        related_name='pacientes',
        blank=True
        )
    genero = models.ForeignKey(Generos, on_delete=models.PROTECT, default=3)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} {self.apellido}"
    
    @property
    def edad(self):
        from datetime import date
        hoy = date.today()
        edad = hoy.year - self.fecha_nacimiento.year - ((hoy.month, hoy.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day))
        return edad
    
    class Meta:
        verbose_name = 'Paciente'
        verbose_name_plural = 'Pacientes'

class OsPacientes(models.Model):
    paciente = models.ForeignKey(Pacientes, 
                              on_delete=models.PROTECT)
    os = models.ForeignKey(ObrasSociales, 
                              on_delete=models.CASCADE)
    num_afiliado = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.paciente} {self.os}"
    
    class Meta:
        verbose_name = 'Obra Social x Paciente'
        verbose_name_plural = 'Obras Sociales X Pacientes'
    

    # id_pac INT AUTO_INCREMENT,
    # nom_pac VARCHAR(50) NOT NULL,
    # ape_pac VARCHAR(50) NOT NULL,
    # dni_pac VARCHAR(12) NOT NULL,
    # fec_nac_pac DATE,
    # dom_pac VARCHAR(50),
    # tel_pac VARCHAR(40) NOT NULL,
    # email_pac VARCHAR(50),
    # CONSTRAINT pk_pac PRIMARY KEY(id_pac)