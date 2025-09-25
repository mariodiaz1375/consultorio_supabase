# personal/management/commands/setup_groups.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from personal.models import Personal, Puestos
from pacientes.models import Paciente  # ajusta según tus apps

class Command(BaseCommand):
    help = 'Crear grupos y permisos por puesto'

    def handle(self, *args, **options):
        # Crear grupos
        admin_group, _ = Group.objects.get_or_create(name='Administrador')
        odontologo_group, _ = Group.objects.get_or_create(name='Odontólogo')
        secretaria_group, _ = Group.objects.get_or_create(name='Secretaria')
        asistente_group, _ = Group.objects.get_or_create(name='Asistente')

        # Permisos para Administrador (todos)
        admin_group.permissions.set(Permission.objects.all())

        # Permisos para Odontólogo
        odontologo_perms = Permission.objects.filter(
            content_type__app_label__in=['pacientes', 'historias_clinicas', 'turnos']
        )
        odontologo_group.permissions.set(odontologo_perms)

        # Permisos para Secretaria
        secretaria_perms = Permission.objects.filter(
            content_type__app_label__in=['pacientes', 'turnos'],
            codename__in=['view_paciente', 'add_paciente', 'change_paciente', 
                         'view_turno', 'add_turno', 'change_turno']
        )
        secretaria_group.permissions.set(secretaria_perms)

        # Permisos para Asistente (solo lectura)
        asistente_perms = Permission.objects.filter(
            codename__startswith='view_'
        )
        asistente_group.permissions.set(asistente_perms)

        self.stdout.write('Grupos creados exitosamente')