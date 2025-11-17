# Sistema Personalizado de Alerts

## 📋 Descripción General

Se ha implementado un sistema completo y personalizable de alertas que reemplaza los `alert()` y `window.confirm()` nativos del navegador por componentes React hermosos y funcionales.

## 🎯 Características

✅ **Alertas Personalizadas**: Diseño moderno con gradientes y animaciones  
✅ **Confirmaciones Interactivas**: Modal elegante para confirmaciones  
✅ **Tipos de Alertas**: Success, Error, Warning, Info  
✅ **Auto-cierre**: Las alertas se cierran automáticamente después de un tiempo configurable  
✅ **Cierre Manual**: Botón X para cerrar alertas manualmente  
✅ **Responsive**: Se adapta a dispositivos móviles  
✅ **Basado en Hooks**: Fácil de usar en cualquier componente  

## 📁 Estructura de Archivos

```
src/
├── context/
│   └── AlertContext.js          (Gestor global de alertas)
├── hooks/
│   ├── useAlert.js              (Hook para alertas simples)
│   └── useConfirm.js            (Hook para confirmaciones)
├── components/
│   └── AlertSystem/
│       ├── AlertSystem.jsx       (Componente que renderiza alertas)
│       └── AlertSystem.module.css (Estilos personalizables)
```

## 🚀 Uso

### 1. Alertas Simples

```jsx
import { useAlert } from '../../hooks/useAlert';

function MiComponente() {
  const { showSuccess, showError, showWarning, showInfo } = useAlert();

  const handleClick = () => {
    showSuccess('¡Operación exitosa!');
    showError('Ocurrió un error');
    showWarning('Advertencia importante');
    showInfo('Información útil');
  };

  return <button onClick={handleClick}>Mostrar Alerta</button>;
}
```

### 2. Confirmaciones

```jsx
import { useConfirm } from '../../hooks/useConfirm';

function MiComponente() {
  const { showConfirm } = useConfirm();

  const handleDelete = async () => {
    const confirmed = await showConfirm('¿Está seguro de eliminar?');
    
    if (confirmed) {
      // Ejecutar eliminación
      console.log('Eliminando...');
    } else {
      console.log('Operación cancelada');
    }
  };

  return <button onClick={handleDelete}>Eliminar</button>;
}
```

## 🎨 Personalización

### Colores y Estilos

Edita `src/components/AlertSystem/AlertSystem.module.css` para cambiar:

```css
/* Success */
.alert-success {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
}

/* Error */
.alert-error {
  background: linear-gradient(135deg, #f44336 0%, #da190b 100%);
  color: white;
}

/* Warning */
.alert-warning {
  background: linear-gradient(135deg, #ff9800 0%, #e68900 100%);
  color: white;
}

/* Info */
.alert-info {
  background: linear-gradient(135deg, #2196f3 0%, #0b7dda 100%);
  color: white;
}
```

### Duración de Alertas

La duración por defecto es configurable al llamar:

```jsx
showSuccess(mensaje, 3000);  // 3 segundos
showError(mensaje, 4000);    // 4 segundos
showWarning(mensaje, 3500);  // 3.5 segundos
showInfo(mensaje);           // 3 segundos (default)

// Si no quieres auto-cierre
showAlert(mensaje, 'info', 0); // 0 = no se cierra automáticamente
```

## 🔧 Componentes Modificados

Se han actualizado los siguientes componentes para usar el nuevo sistema:

### Turnos
- ✅ TurnosList.jsx
- ✅ TurnosForm.jsx
- ✅ TurnosCard.jsx

### Pacientes
- ✅ PacientesList.jsx
- ✅ PacientesForm.jsx

### Personal
- ✅ PersonalList.jsx

### Historias Clínicas
- ✅ HistoriaClinicaForm.jsx
- ✅ SeguimientoForm.jsx

### Otros
- ✅ Dashboard.jsx
- ✅ PagosModal.jsx

## 🌐 Configuración en App.js

El sistema está configurado en `App.js`:

```jsx
import { AlertProvider } from './context/AlertContext';
import { AlertSystem } from './components/AlertSystem/AlertSystem';

function App() {
  return (
    <AlertProvider>
      <Router>
        <AlertSystem />
        <Routes>
          {/* ... rutas */}
        </Routes>
      </Router>
    </AlertProvider>
  );
}
```

## 🎯 Próximos Pasos

Para personalizar aún más el sistema:

1. **Cambiar iconos**: Edita la sección `icons` en `AlertSystem.jsx`
2. **Agregar nuevos tipos**: Añade más casos en `AlertComponent`
3. **Modificar duración default**: Cambia los valores en `useAlert.js`
4. **Temas**: Crea archivos CSS adicionales para modo oscuro

## 📝 Notas Importantes

- ⚠️ El sistema requiere que `AlertProvider` envuelva toda la aplicación
- ⚠️ `AlertSystem` debe estar dentro de `AlertProvider` y antes de las rutas
- ⚠️ Los hooks solo funcionan dentro de componentes que están dentro de `AlertProvider`
- ℹ️ Las confirmaciones son promesas, usa `await` para esperar la respuesta

## 🐛 Troubleshooting

**Error: "useAlert debe ser usado dentro de AlertProvider"**
→ Verifica que `AlertProvider` envuelve tu componente en App.js

**Las alertas no se muestran**
→ Asegúrate de que `AlertSystem` está renderizado en App.js

**Las animaciones no funcionan**
→ Verifica que los estilos CSS están importados correctamente

---

**Autor**: Sistema personalizado de notificaciones  
**Última actualización**: 2025-11-16
