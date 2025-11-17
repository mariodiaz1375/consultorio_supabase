# 🔧 Debugging y Troubleshooting

## ❌ Problemas Comunes y Soluciones

### 1. Error: "useAlert debe ser usado dentro de AlertProvider"

**Síntoma**:
```
Error: useAlert must be used within an AlertProvider
```

**Causa**: El componente está intentando usar `useAlert()` pero no está dentro de `AlertProvider`.

**Solución**:
1. Verifica que `AlertProvider` está en `App.js`:
```jsx
// App.js
import { AlertProvider } from './context/AlertContext';

function App() {
  return (
    <AlertProvider>
      <Router>
        {/* ... */}
      </Router>
    </AlertProvider>
  );
}
```

2. Asegúrate de que el componente está dentro del árbol de React que contiene `AlertProvider`.

---

### 2. Las Alertas No Se Muestran

**Síntoma**: El código ejecuta `showSuccess()` pero no aparece nada en pantalla.

**Causa**: `AlertSystem` no está renderizado o el componente no está dentro de `AlertProvider`.

**Solución**:
1. Verifica que `AlertSystem` está en `App.js`:
```jsx
function App() {
  return (
    <AlertProvider>
      <Router>
        <AlertSystem />  {/* 👈 Debe estar aquí */}
        <Routes>
          {/* ... */}
        </Routes>
      </Router>
    </AlertProvider>
  );
}
```

2. Verifica en DevTools (F12) que el componente `AlertSystem` está renderizado:
```
Inspect → Elements → Busca: <div className="alertsContainer">
```

3. Abre la consola y ejecuta:
```javascript
// Esto debería ejecutarse sin error
const elem = document.querySelector('.alertsContainer');
console.log(elem); // Debe mostrar el elemento, no null
```

---

### 3. Alertas Aparecen pero Desaparecen Muy Rápido

**Síntoma**: La alerta aparece pero se cierra en menos de 1 segundo.

**Causa**: Probablemente hay dos `AlertProvider` o la duración es muy corta.

**Solución**:
1. Verifica que solo hay UN `AlertProvider` en la app:
```jsx
// Busca en todos los archivos por "AlertProvider"
// Debería encontrarse solo en App.js
```

2. Aumenta la duración al mostrar:
```jsx
showSuccess('Mensaje', 5000);  // 5 segundos en lugar de default
```

---

### 4. Las Confirmaciones No Responden

**Síntoma**: El modal de confirmación aparece pero los botones no funcionan.

**Causa**: Probablemente hay un error en el manejador o la promesa no se resuelve.

**Solución**:
1. Verifica que usas `await`:
```jsx
// ❌ Incorrecto
const confirmed = showConfirm('¿Continuar?');
console.log(confirmed);  // Esto será una Promise, no true/false

// ✅ Correcto
const confirmed = await showConfirm('¿Continuar?');
console.log(confirmed);  // Esto será true o false
```

2. Si no usas async/await, usa `.then()`:
```jsx
showConfirm('¿Continuar?').then(confirmed => {
  if (confirmed) {
    // Hacer algo
  }
});
```

---

### 5. Estilos CSS No Se Aplican

**Síntoma**: Las alertas aparecen pero sin colores, animaciones u otros estilos.

**Causa**: El archivo CSS no se está importando correctamente.

**Solución**:
1. Verifica que `AlertSystem.jsx` importa el CSS:
```jsx
import styles from './AlertSystem.module.css';
```

2. Verifica que el archivo existe:
```
src/components/AlertSystem/AlertSystem.module.css
```

3. Si aún no funciona, prueba abrir DevTools (F12) y:
   - Busca `.alertsContainer` en el inspector
   - Ve a la pestaña "Styles"
   - Verifica que los estilos están aplicados

---

### 6. Las Alertas Se Sobrelapan en Móvil

**Síntoma**: En dispositivos pequeños, dos alertas se superponen.

**Causa**: El CSS responsive no se está aplicando correctamente.

**Solución**:
Verifica que en `AlertSystem.module.css` existe la media query:
```css
@media (max-width: 480px) {
  .alertsContainer {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
```

---

## 🐛 Debug Avanzado

### Verificar el Contexto

En la consola del navegador (F12):
```javascript
// Ver si el contexto está disponible
const ctx = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher;
console.log(ctx);
```

### Registrar Alertas

Agrega logs en `AlertContext.js`:
```jsx
const showAlert = useCallback((message, type = 'info', duration = 3000) => {
    console.log(`[ALERT] ${type}: ${message}`);  // 👈 Log
    const id = Date.now();
    const newAlert = { id, message, type };
    
    setAlerts(prev => [...prev, newAlert]);
    // ...
}, []);
```

### Inspeccionar el Estado

En React DevTools (extensión):
1. Ve a la pestaña "Components"
2. Busca `AlertProvider`
3. Ve a "State" en el inspector
4. Deberías ver `alerts` y `confirmDialog`

---

## 📋 Checklist de Instalación

- [ ] ¿`AlertProvider` está en `App.js`?
- [ ] ¿`AlertSystem` está dentro de `Router` en `App.js`?
- [ ] ¿El archivo `AlertContext.js` existe?
- [ ] ¿El archivo `useAlert.js` existe?
- [ ] ¿El archivo `useConfirm.js` existe?
- [ ] ¿El archivo `AlertSystem.jsx` existe?
- [ ] ¿El archivo `AlertSystem.module.css` existe?
- [ ] ¿Los componentes tienen los imports correctos?
- [ ] ¿No hay errores en la consola del navegador?
- [ ] ¿Las alertas aparecen en la esquina superior derecha?

---

## 🔍 Comandos Útiles

### Buscar todos los usos de `alert()`
```bash
# En Windows PowerShell
grep -r "alert(" src --include="*.jsx" --include="*.js"
```

### Verificar imports
```bash
# Buscar si useAlert está importado
grep -r "useAlert" src --include="*.jsx" --include="*.js"
```

### Limpiar archivos de caché
```bash
# Limpiar node_modules
rm -r node_modules
npm install
```

---

## 💡 Tips de Debugging

1. **Abre DevTools**: F12 → Consola
2. **Busca errores rojo**: Cualquier cosa que diga "Error" o "Cannot read"
3. **Verifica la red**: F12 → Network → Busca solicitudes fallidas
4. **Inspecciona elementos**: F12 → Elements → Busca `.alertsContainer`
5. **Usa console.log**: Agrega logs en los lugares críticos

---

## 📞 Soporte Rápido

| Problema | Solución Rápida |
|----------|-----------------|
| No aparecen alertas | Verifica que `AlertProvider` y `AlertSystem` están en `App.js` |
| Error "must be used within" | El componente debe estar dentro de `AlertProvider` |
| Confirmación no funciona | Usa `await` o `.then()` para esperar la respuesta |
| Estilos incorrectos | Verifica que `AlertSystem.module.css` existe e importa |
| Alertas rápidas | Aumenta la duración: `showSuccess(msg, 5000)` |

---

**Última actualización**: 16 de noviembre de 2025
