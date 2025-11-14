from django.apps import AppConfig


class PagosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pagos'

    def ready(self):
        """
        Este método se ejecuta cuando Django inicia.
        Aquí importamos los signals para que se registren.
        """
        import pagos.signals  # Importar el archivo signals.py