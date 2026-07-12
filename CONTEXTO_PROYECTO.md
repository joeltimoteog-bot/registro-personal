# CONTEXTO COMPLETO — Sistema de Registro de Personal Unifrutti
> Pega este documento al inicio de una conversación nueva con Claude para continuar el proyecto sin perder contexto.

## 1. QUIÉN SOY Y QUÉ ES EL PROYECTO
- Soy **Joel Timoteo Gonza** (usuario admin: `jtimoteo`, correo: joel.timoteog@gmail.com)
- Cargo: **Coordinador de Relaciones Laborales** · Área: **RECLUTAMIENTO DE PERSONAL**
- Soy el **creador y único autor** del sistema (propiedad intelectual protegida)
- Sistema web móvil de **registro de personal agrícola** para Unifrutti (empresas Rapel y Verfrut)
- **En producción**: 2,400+ registros reales, 16 usuarios (hasta 8 registrando simultáneamente)

## 2. ARQUITECTURA
| Componente | Tecnología |
|---|---|
| Frontend | index.html único (HTML+CSS+JS, fuente Tahoma) |
| Hosting | GitHub Pages: https://joeltimoteog-bot.github.io/registro-personal/ |
| Repo | https://github.com/joeltimoteog-bot/registro-personal |
| Backend | Google Apps Script (webhook, JSONP/GET por CORS) |
| Base de datos | Google Sheets (almacén oficial de registros) |
| Tiempo real | Firebase Realtime Database (SOLO contadores de grupo, sin datos personales) |
| PWA | Instalable en celular (manifest.json + sw.js sin caché + icon-192/512.png) |

**Colores corporativos:** rojo #c8102e, azul #1a3c6e (--blue), azul oscuro #142e54 (--blue-dark)

**Firebase proyecto:** registro-personal-7fe60 · databaseURL: https://registro-personal-7fe60-default-rtdb.firebaseio.com · rama `contadores` con reglas read/write true (solo esa rama)

## 3. GOOGLE SHEETS — ESTRUCTURA
- **Rapel** y **Verfrut**: bases fuente de trabajadores (21 columnas)
- **BB.REGISTRO**: registros del sistema — 27 columnas, índices 0-26:
  0:DNI, 1:ApellidoPaterno, 2:ApellidoMaterno, 3:Nombres, 4:SigueMismaDir, 5:DireccionActual, 6:Departamento, 7:Provincia, 8:Distrito, 9:Telefono1, 10:TieneHijos, 11:NivelEducativo, 12:Institucion, 13:Carrera, 14:AnoEgreso, 15:Discapacidad, 16:Parentesco, 17:ContactoReferencia, 18:TelefonoReferencia, 19:FechaRegistro, 20:Empresa, 21:Ruta, 22:Codigo, 23:Grupo, 24:Tipo, 25:RegistradoPor, 26:EsTardio
- **Usuarios**: usuario, cargo, Estado (Administrador/usuario), Contraseña (hash SHA-256)
- **PRE-REGISTRO-QR**, **AUDITORIA**, **LOG-ACCESOS**, **BB.REGISTRO-HISTORICO** (auto-creadas)

## 4. APPS SCRIPT (v2.6 desplegado)
- Config: `CORREO_ADMIN='joel.timoteog@gmail.com'`, `TIMEOUT_SESION_MIN=1440` (24h)
- **Acciones públicas** (sin token): login, registrarQR, buscarAmbas, buscar, listarHoja
- **Con token** (SHA-256, secreto 'UNF-2026-'+usuario): registrar, buscarBBRegistro, actualizarRegistro, contarGrupo, listarBBRegistro, exportarBBRegistro, logExportacion, listarUsuarios, agregarUsuario, eliminarUsuario
- **Anti-duplicados en registrar (3 capas):** LockService.waitLock(10000) + CacheService con `_regId` (300 seg) + verificación DNI+fecha en últimas 50 filas → si duplica devuelve `{ok:true,duplicado:true}`
- **Triggers activos:** backupSemanal (lunes 8AM, DriveApp.makeCopy + email con enlace — NO usar UrlFetch por permisos), archivarRegistrosAntiguos (>6 meses → BB.REGISTRO-HISTORICO, día 1 c/mes), verificarSaludSistema (diario 7AM, detecta contraseñas sin hash)
- registrarLoginFallido: log + alerta email al llegar a 10 fallos/hora
- contarGrupo optimizado: lee solo columnas W-X con getRange(2,23,n,2)
- ⚠️ Cambios en Apps Script requieren: Implementar → Administrar implementaciones → ✏️ → **Nueva versión** → Implementar

## 5. FRONTEND — FUNCIONES CLAVE (index.html, VERSION_ACTUAL='3.1.1')
- **Login** rediseñado "Ejecutivo dividido": panel marca izquierda (azul #142e54, logos Unifrutti+JTG) + formulario derecha; fondo azul sólido; responsive apila en móvil (560px)
- **Diseño 3.0 "Corporativo Premium"**: card-headers gradiente azul con texto blanco, tabs píldora azul, botones 12x18px, inputs 12px fondo #f6f8fb, sombras tinte azul, fondo #eef1f6
- **Sesión persistente**: localStorage 'sesion_activa' (20h, restaurarSesion() al cargar) — resolvió "me bota del sistema" en móviles
- **Sistema de versiones**: VERSION_ACTUAL en index + version.json deben coincidir; usuarios con pestaña abierta ven modal de actualización en máx 2 min → "Continuar" limpia caché y recarga
- **Firebase contador tiempo real**: suscribirContadorFirebase/incrementarContadorFirebase (transaction)/desuscribir; polling a Sheets solo 1 de cada 4 ciclos (30s+jitter, solo pestaña visible); Sheets reconcilia Firebase cada sync
- **Protección de datos al guardar**: bandera _guardandoEnProceso, await al guardado, borrador _borrador_ultimo en localStorage, formulario NO se limpia si falla, reintento automático (2 intentos, timeout 20s)
- **Exportación restringida**: EXPORT_AUTORIZADOS=['jtimoteo','jsiancas','javendano']; jtimoteo exporta directo; jsiancas/javendano ven modal de confidencialidad; otros bloqueados; toda descarga se registra en LOG-ACCESOS
- **Derechos de autor**: Config bloqueada para no-creadores con mensaje de propiedad intelectual; docs técnicos solo isCreador (clase admin-only-doc); credencial "👑 Sesión de Creador" reemplaza el saludo cuando entra jtimoteo (msgUsuarios/msgCreador)
- **Búsqueda**: primero BB.REGISTRO (datos recientes, carga automática), luego Rapel/Verfrut; duplicado mismo día = BLOQUEADO; fecha distinta = permitido con aviso
- Logo JTG personal integrado (4 lugares, base64 JPEG ~2KB, alt="JTG"); logo Unifrutti intacto (alt="Unifrutti")
- Versión visible dinámica: spans class="ver-dinamica" rellenados desde VERSION_ACTUAL

## 6. ARCHIVOS DEL PROYECTO (en repo y en C:\REGISTRO DE PERSONAL - RECLUTAMIENTO)
index.html, version.json, manifest.json, sw.js, icon-192.png, icon-512.png, Manual_Usuario_Sistema_Registro_Personal.pdf (17 págs), Documento_Impacto_Sistema.pdf (1 pág), Documento_Tecnico_Continuidad.pdf (9 págs, solo creador), Guia_Capacitacion_Suplente.pdf (7 págs, solo creador)

## 7. FLUJO DE DEPLOY (mi proceso, donde suelo fallar)
1. Descargar archivos de la conversación (caen en Descargas)
2. Copiar a la carpeta reemplazando:
   `Copy-Item "$env:USERPROFILE\Downloads\index.html" "C:\REGISTRO DE PERSONAL - RECLUTAMIENTO\" -Force`
3. `cd "C:\REGISTRO DE PERSONAL - RECLUTAMIENTO"` → `git add .` → `git commit -m "..."` → `git push`
4. Si sale "nothing to commit" = NO reemplacé los archivos (verificar con `Select-String -Path index.html -Pattern "VERSION_ACTUAL ="`)
5. GitHub Pages tarda 1-10 min; verificar con https://joeltimoteog-bot.github.io/registro-personal/version.json?t=999

## 8. REGLAS DE TRABAJO CON CLAUDE (importantes)
- **Solo modificar lo que pido explícitamente; NO tocar nada más** (especialmente: cambios de estilo NUNCA tocan funciones)
- Cada versión nueva: actualizar VERSION_ACTUAL en index.html Y version.json (deben coincidir), copiar index.html → index_v4.html, entregar archivos con present_files, dar comandos PowerShell completos con Copy-Item
- Guardar en /mnt/user-data/outputs/personal-manager/
- Siempre en español
- Recordarme que Apps Script requiere redespliegue como "Nueva versión"
- Claude me hace preguntas de confirmación antes de cambios grandes

## 9. DESCARTADO / RESUELTO (no volver a proponer)
- Lector de huella USB: descartado (navegadores no lo soportan)
- Modo offline: pospuesto (plan B: hotspot del celular)
- Migrar todo a Firebase/Supabase: NO — el almacenamiento oficial se queda en Google Sheets; Firebase solo para contadores
- Duplicados: resuelto con 6 capas; sesión que "bota": resuelto con sesión persistente; lentitud con 6+ usuarios: resuelto con optimizaciones + Firebase

## 10. ESTADO ACTUAL Y PENDIENTES
- Versión en producción: **3.1.1** (verificar pie de página)
- Pendiente de verificar: feedback de usuarios sobre velocidad en hora pico con Firebase activo
- Tarea manual pendiente de Joel: simulacro de restauración de backup
- Recomendación vigente: rotar URL del Apps Script cada 6 meses (próximo: ~diciembre 2026)
