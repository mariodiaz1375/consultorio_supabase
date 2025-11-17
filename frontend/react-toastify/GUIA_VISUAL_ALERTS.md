# 🎨 Guía Visual - Sistema de Alerts Personalizado

## 📺 Apariencia de las Alertas

### Alert de Éxito (Success)
```
┌─────────────────────────────────────────┐
│ ✓  Paciente creado con éxito            │ ✕
│                                         │
└─────────────────────────────────────────┘
```
**Color**: Verde (#4caf50)  
**Duración**: 3 segundos  
**Icono**: ✓  

### Alert de Error
```
┌─────────────────────────────────────────┐
│ ✕  Error al guardar el turno            │ ✕
│                                         │
└─────────────────────────────────────────┘
```
**Color**: Rojo (#f44336)  
**Duración**: 4 segundos  
**Icono**: ✕  

### Alert de Advertencia (Warning)
```
┌─────────────────────────────────────────┐
│ ⚠  Solo se puede agregar un detalle     │ ✕
│                                         │
└─────────────────────────────────────────┘
```
**Color**: Naranja (#ff9800)  
**Duración**: 3.5 segundos  
**Icono**: ⚠  

### Alert de Información (Info)
```
┌─────────────────────────────────────────┐
│ ℹ  Cargando datos del sistema...        │ ✕
│                                         │
└─────────────────────────────────────────┘
```
**Color**: Azul (#2196f3)  
**Duración**: 3 segundos  
**Icono**: ℹ  

---

## 🔔 Modal de Confirmación

```
┌──────────────────────────────────────┐
│                                      │
│  Confirmar                           │
│                                      │
│  ¿Está seguro de que desea eliminar  │
│  el turno de Juan Pérez...?          │
│                                      │
│  ┌──────────────┬──────────────────┐ │
│  │   Cancelar   │    Aceptar       │ │
│  └──────────────┴──────────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

**Overlay**: Fondo oscuro semi-transparente  
**Animación**: Sube suavemente desde abajo  
**Botones**: Cancelar (gris), Aceptar (verde)  

---

## 📱 En Dispositivos Móviles

### Alertas
```
┌─────────────────────┐
│ ✓  Operación exitosa│ ✕
│                     │
└─────────────────────┘
```
- Ancho: 95% de la pantalla
- Posición: Arriba derecha
- Se apila verticalmente

### Modal
```
┌──────────────────────┐
│   Confirmar          │
│                      │
│ ¿Está seguro...?     │
│                      │
│ ┌────────────────┐   │
│ │    Cancelar    │   │
│ ├────────────────┤   │
│ │    Aceptar     │   │
│ └────────────────┘   │
│                      │
└──────────────────────┘
```
- Botones apilados verticalmente
- Ancho completo adaptable
- Fácil de tocar

---

## 💻 Integración en Código

### Ejemplo 1: Alerta de Éxito
```jsx
import { useAlert } from '../../hooks/useAlert';

function MiComponente() {
  const { showSuccess } = useAlert();

  const handleCreate = async () => {
    try {
      await crearPaciente(datos);
      showSuccess('Paciente creado exitosamente');
    } catch (error) {
      // manejar error
    }
  };

  return <button onClick={handleCreate}>Crear</button>;
}
```

**Resultado Visual**:
```
┌────────────────────────────────┐
│ ✓  Paciente creado exitosamente│ ✕
└────────────────────────────────┘
↑                                ↑
← Posición fija en pantalla   Auto-cierra en 3s
```

### Ejemplo 2: Confirmación
```jsx
import { useConfirm } from '../../hooks/useConfirm';

function MiComponente() {
  const { showConfirm } = useConfirm();

  const handleDelete = async () => {
    const confirmed = await showConfirm(
      '¿Está seguro de eliminar este turno?'
    );
    
    if (confirmed) {
      await eliminarTurno(id);
    }
  };

  return <button onClick={handleDelete}>Eliminar</button>;
}
```

**Flujo Visual**:
```
1. Usuario hace click
   ↓
2. Modal aparece en pantalla
   ┌──────────────────┐
   │ Confirmar        │
   │ ¿Está seguro...? │
   │ [Cancelar] [Aceptar]
   └──────────────────┘
   ↓
3a. Si Aceptar → Promise resuelve "true"
   ↓
3b. Si Cancelar → Promise resuelve "false"
```

---

## 🎬 Animaciones

### Alert - Entrada (slideIn)
```
Posición inicial:   x = 400px (fuera de pantalla)
Posición final:     x = 0px
Duración:          0.3 segundos
Easing:            ease-out
```

### Modal - Entrada (slideUp)
```
Posición inicial:   y = 20px, opacity = 0
Posición final:     y = 0px, opacity = 1
Duración:          0.3 segundos
Easing:            ease-out
```

### Fondo - Entrada (fadeIn)
```
Opacity inicial:   0
Opacity final:     1
Duración:         0.2 segundos
```

---

## 🎨 Paleta de Colores

| Elemento | Color | Hex | RGB |
|----------|-------|-----|-----|
| Success Normal | Verde | #4caf50 | 76, 175, 80 |
| Success Oscuro | Verde Oscuro | #45a049 | 69, 160, 73 |
| Error Normal | Rojo | #f44336 | 244, 67, 54 |
| Error Oscuro | Rojo Oscuro | #da190b | 218, 25, 11 |
| Warning Normal | Naranja | #ff9800 | 255, 152, 0 |
| Warning Oscuro | Naranja Oscuro | #e68900 | 230, 137, 0 |
| Info Normal | Azul | #2196f3 | 33, 150, 243 |
| Info Oscuro | Azul Oscuro | #0b7dda | 11, 125, 218 |
| Botón Hover | Gris | #e8e8e8 | 232, 232, 232 |
| Overlay | Negro Transparente | rgba(0,0,0,0.5) | 0,0,0,50% |

---

## 🔧 Personalización Fácil

### Cambiar Colores
```css
/* En AlertSystem.module.css */
.alert-success {
  background: linear-gradient(135deg, #TU_COLOR 0%, #TU_COLOR_OSCURO 100%);
  color: white;
}
```

### Cambiar Iconos
```jsx
/* En AlertSystem.jsx */
const icons = {
  success: '🎉',      // Cambiar emoji
  error: '🚨',
  warning: '⚡',
  info: '💡'
};
```

### Cambiar Duración
```jsx
/* En useAlert.js */
showSuccess(message, 5000);  // 5 segundos en lugar de 3
```

---

## 📊 Comparativa: Antes vs Después

### Antes (alert nativo)
```
❌ Alert bloqueante del navegador
❌ Estilo inconsistente entre navegadores
❌ No se puede personalizar
❌ Interfaz poco amigable
❌ No responsive
```

### Después (nuevo sistema)
```
✅ Alertas no-bloqueantes
✅ Estilo consistente y hermoso
✅ Totalmente personalizable
✅ Interfaz moderna y amigable
✅ Totalmente responsive
✅ Con animaciones suaves
✅ Mejor experiencia de usuario
```

---

## 🎓 Referencia Rápida

```jsx
// Éxito
showSuccess('Operación completada')

// Error
showError('Algo salió mal')

// Advertencia
showWarning('Verifique los datos')

// Información
showInfo('Para más información...')

// Confirmación (await)
const result = await showConfirm('¿Continuar?')

// Confirmación (then)
showConfirm('¿Continuar?').then(result => {
  if (result) { /* ... */ }
})
```

---

**Última actualización**: 16 de noviembre de 2025  
**Versión del sistema**: 1.0  
**Estado**: Producción
