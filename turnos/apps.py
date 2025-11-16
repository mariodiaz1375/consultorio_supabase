from django.apps import AppConfig


class TurnosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'turnos'

    def ready(self):
        """
        Este método se ejecuta cuando Django inicia.
        Aquí importamos los signals para que se registren.
        """
        import turnos.signals  # 🚨 ESTA LÍNEA ES CLAVE