# Plan de Implementación: Sistema de Rachas, Congeladores y Pruebas

Para implementar la funcionalidad tal cual la has descrito (rachas, ganar 1 congelador cada 6 días, requerir pruebas en fotos/audio, y la integración de la mascota Sgt. Hoot), necesitamos actualizar tanto la base de datos como la interfaz de usuario. 

A continuación detallo el plan técnico para que lo revisemos antes de empezar a programar:

## 1. Cambios en la Base de Datos (Supabase)

### Tabla `profiles` (Usuarios)
Necesitamos que cada usuario pueda almacenar su inventario de congeladores.
- **Agregar:** `streak_freezes` (Integer, por defecto `0`).

### Tabla `habit_completions` (Registro de cumplimiento)
Necesitamos registrar qué tipo de prueba se subió y si un día específico se salvó usando un congelador en lugar de completarlo normalmente.
- **Agregar:** `proof_url` (Texto, la URL pública del archivo subido).
- **Agregar:** `proof_type` (Texto, validado para aceptar solo `'image'`, `'audio'`, o `'none'`).
- **Agregar:** `is_freeze` (Booleano, por defecto `false`). Si es `true`, significa que ese día no se subió prueba, pero se gastó un congelador para no perder la racha.

### Nuevo Almacenamiento (Supabase Storage)
- **Crear Bucket:** `habit_proofs`.
- **Reglas de Seguridad (RLS):** Solo el dueño de la prueba puede subirla y verla (o hacerla pública si luego quieres compartir tus rachas).

## 2. Lógica del Sistema (Backend & Frontend)

### Subir Evidencia (Frontend)
Cuando toques el botón para completar un hábito, la app no lo marcará inmediatamente. En su lugar:
1. Se abrirá la cámara de tu iPhone o el micrófono (usando el API nativo del navegador `<input type="file" capture="environment">`).
2. El archivo se sube al bucket `habit_proofs` de Supabase.
3. Se guarda el registro en `habit_completions` vinculando la URL de tu foto/audio.

### Cálculo de Racha (Streak)
- El cliente (React) calculará la racha buscando días consecutivos hacia atrás en la tabla de completados.
- Si hay un hueco (un día sin completar), la racha es `0`. 
- Si en ese hueco el usuario decide gastar un congelador (clickeando un botón de "Salvar Racha" desde la UI), se insertará un registro de tipo `is_freeze = true` y la racha se unirá nuevamente.

### Ganar Congeladores
- Se creará una lógica que analice tu progreso: Cada vez que registres **6 rachas consecutivas** sin fallar, el sistema automáticamente sumará `+1` a tu columna de `streak_freezes`.
- El Sargento Hoot aparecerá en la pantalla para informarte: *"Felicidades soldado. Ganaste un congelador. Úsalo sabiamente."*

## 3. UI y El Sargento Hoot
- Integraremos el HTML del Mockup directamente a React (`App.tsx`).
- El Sargento Hoot será un componente dinámico (`<MascotBanner />`). 
- **Estados del Sargento:** 
  - *Estado Normal:* Te recuerda qué hábitos faltan.
  - *Estado Peligro:* Si un hábito está atrasado, el banner se pone rojo y el sargento usa un lenguaje más agresivo (basado en el tono que elijas en configuración).
  - *Estado Éxito:* Si pasas los 6 días, cambia su diálogo para premiarte con el congelador.
