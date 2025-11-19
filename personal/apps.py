from django.apps import AppConfig


class PersonalConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'personal'

    def ready(self):
        """
        Importa las señales cuando la aplicación está lista.
        Esto asegura que los signals se registren correctamente.
        """
        import personal.signals