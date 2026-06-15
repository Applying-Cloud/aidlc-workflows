# Applying Project Bootstrap — Extensión AI-DLC

## Propósito
Automatizar la creación de repos, workspace y configuración de steering/skills
durante la fase de inception de AI-DLC. El agente usa la información producida
por aidlc-discovery en `Product-Definition/` para tomar decisiones.

## Contexto: flujo discovery → AI-DLC → bootstrap
Este proyecto usa aidlc-discovery como front door. El flujo es:
1. aidlc-discovery genera `Product-Definition/` (vision, tech env, open questions)
2. AI-DLC inception arranca con esos documentos como input pre-cargado
3. Esta extensión se activa durante inception y usa esos mismos documentos
   para crear repos, workspace, y distribuir steering automáticamente

## Prerrequisitos
Antes de ejecutar, verifica que el usuario tiene:
- GitHub CLI (`gh`) instalado: ejecuta `gh --version`
- GitHub CLI autenticado: ejecuta `gh auth status`
- Git configurado: ejecuta `git config user.name && git config user.email`
- `Product-Definition/` existe con al menos `vision-document.md` y
  `technical-environment.md` (generados por aidlc-discovery)

Si alguno falla, indica al usuario cómo resolverlo y espera antes de continuar.

## Cuándo ejecutar
Después de que AI-DLC carga los inputs de `Product-Definition/` y ANTES de
continuar con Requirements Analysis. Esta extensión crea la infraestructura
de repos que el resto de inception necesita para generar artefactos en las
rutas correctas.

IMPORTANTE: este repo (donde estamos ahora) se convierte en el repo `config`
del producto. No se crea un repo config nuevo — se renombra/reutiliza este.

---

## Paso 1: Detectar componentes del producto

Analiza `Product-Definition/technical-environment.md` (generado por aidlc-discovery).
Extrae los componentes del producto y su stack.
Si también existe `Product-Definition/open-questions.md`, revisa si hay preguntas
abiertas sobre arquitectura o stack que deban resolverse antes de crear repos.

Presenta al usuario en este formato:

```
### Componentes detectados
| # | Componente  | Stack principal         | Repo sugerido                    |
|---|-------------|-------------------------|----------------------------------|
| 1 | Frontend    | React 18 + TypeScript   | {producto}-frontend              |
| 2 | Backend     | Node.js 20 + Express    | {producto}-backend               |
| 3 | Infra       | Terraform 1.7           | {producto}-infra                 |
| 4 | Config      | Docs + contracts        | {producto}-config                |

¿Es correcto? ¿Deseas agregar, quitar o renombrar algún componente?
[Answer]:
```

El componente "Config" siempre se incluye — contiene product.md, api-contracts,
tipos compartidos y el workspace file.

Espera confirmación antes de continuar.

---

## Paso 2: Definir estrategia de repositorios

Presenta las opciones al usuario:

```
### Estrategia de repositorios
1. **Monorepo** — Un solo repo con carpetas por componente.
   Ideal para equipos pequeños (1-3 personas) que tocan todo.

2. **Multi-repo en workspace** — Un repo por componente, agrupados
   en un workspace file del IDE. Ideal para equipos separados por
   componente con CI/CD independiente.

3. **Multi-repo independiente** — Repos separados sin workspace compartido.
   Cada repo opera con total autonomía.

Recomendado para este proyecto (basado en el Vision Document): {recomendación}

¿Cuál prefieres?
[Answer]:
```

Basa tu recomendación en:
- Si el vision document menciona equipos separados → multi-repo workspace
- Si menciona equipo pequeño o MVP → monorepo
- Si menciona autonomía total por componente → multi-repo independiente
- Por defecto → multi-repo en workspace

Espera confirmación antes de continuar.

---

## Paso 3: Configuración de GitHub

Presenta al usuario:

```
### Configuración de GitHub
- Organización: ¿En qué org de GitHub creo los repos?
  (escribe el nombre exacto, o "personal" para tu cuenta)
  [Answer]:

- Visibilidad: ¿Privados o públicos?
  [Answer]: {private/public}

- Branch principal: ¿main o master?
  [Answer]: {main/master}
```

Espera confirmación antes de ejecutar.

---

## Paso 4: Crear repositorios

Ejecuta los comandos de GitHub CLI para crear los repos.

Para CADA componente confirmado en Paso 1:

```bash
gh repo create {org}/{repo-name} \
  --{visibility} \
  --description "{descripción del componente}" \
  --clone \
  --add-readme
```

Si la estrategia es **monorepo**, crea un solo repo:
```bash
gh repo create {org}/{producto} \
  --{visibility} \
  --description "{descripción del producto}" \
  --clone \
  --add-readme
```

Verifica que cada repo se creó exitosamente antes de continuar.
Si alguno falla (nombre ya existe, permisos, etc.), reporta al usuario
y espera instrucciones.

---

## Paso 5: Estructurar carpetas y workspace

### Si multi-repo en workspace:

En cada repo clonado, crea la estructura base:

**Repo config (este repo — ya existe, se estructura sobre lo que hay):**
```
{producto}-config/                        ← ESTE REPO (ya clonado)
├── Product-Definition/                   ← generado por aidlc-discovery (ya existe)
│   ├── vision-document.md
│   ├── technical-environment.md
│   ├── open-questions.md
│   ├── state/
│   ├── audit/
│   ├── interview/
│   └── visual/                           (si se usó visual sketch)
├── api-contracts/                        ← CREAR
│   └── .gitkeep
├── shared-types/                         ← CREAR
│   └── .gitkeep
├── {producto}.code-workspace             ← CREAR (ver formato abajo)
├── scripts/                              ← CREAR
│   ├── setup.sh                          # Script de onboarding
│   └── sync-steering.sh                  # Script de sync de steering
├── .kiro/                                ← YA EXISTE (de aidlc-discovery)
│   └── ...                               # No tocar — aidlc-discovery lo usa
└── aidlc-docs/                           ← AI-DLC lo crea aquí durante inception
```
IMPORTANTE: no sobrescribir `.kiro/` ni `Product-Definition/` — ya existen
del setup de aidlc-discovery. Solo agregar las carpetas nuevas.

**Repos de componente (frontend, backend, infra, etc.):**
```
{producto}-{componente}/
├── src/
│   └── .gitkeep
├── tests/
│   └── .gitkeep
├── .kiro/
│   ├── steering/
│   │   └── .gitkeep
│   ├── skills/
│   │   └── .gitkeep
│   └── hooks/
│       └── .gitkeep
├── .github/
│   └── workflows/
│       └── .gitkeep
└── README.md
```

**Workspace file** (`{producto}.code-workspace`):
```json
{
  "folders": [
    { "path": "../{producto}-config", "name": "config" },
    { "path": "../{producto}-frontend", "name": "frontend" },
    { "path": "../{producto}-backend", "name": "backend" },
    { "path": "../{producto}-infra", "name": "infra" }
  ],
  "settings": {
    "kiro.steering.sharedPath": "../{producto}-config"
  }
}
```
Ajusta los folders según los componentes confirmados en Paso 1.
Usa rutas relativas con `../` para que funcione sin importar dónde clone cada dev.

### Si monorepo:

```
{producto}/
├── apps/
│   ├── frontend/
│   │   └── src/
│   ├── backend/
│   │   └── src/
│   └── infra/
│       └── modules/
├── packages/
│   ├── shared-types/
│   └── contracts/
├── docs/
│   ├── product.md
│   └── tech-environment.md
├── .kiro/
│   ├── steering/
│   ├── skills/
│   └── hooks/
├── .github/
│   └── workflows/
└── scripts/
    └── sync-steering.sh
```

---

## Paso 5.5: Distribuir product.md a cada componente

Copia `Product-Definition/vision-document.md` como `product.md` al
`.kiro/steering/` de cada repo de componente. Este archivo le da al agente
el contexto del producto completo cuando trabaja en cualquier componente.

Para multi-repo:
```bash
for repo in frontend backend infra; do
  cp Product-Definition/vision-document.md \
    ../{producto}-${repo}/.kiro/steering/product.md
done
```

Para monorepo: una sola copia en `.kiro/steering/product.md` (ya cubre todo).

Este `product.md` usa `inclusion: always` — el agente siempre sabe para qué
producto está trabajando.

---

## Paso 6: Seleccionar y distribuir steering

Lee el catálogo de steering disponibles del repositorio central de Applying.

El catálogo de IP distribuible (steering, skills) vive en un repo SEPARADO del
framework, versionado de forma independiente:
`git@github.com:ApplyingCloudOrg/applying-steering-templates.git`, archivo `catalog.md`.

Clónalo o haz pull en una ruta temporal antes de leer el catálogo, p. ej.:
```bash
STEERING_REPO="git@github.com:ApplyingCloudOrg/applying-steering-templates.git"
STEERING_DIR="$(mktemp -d)/applying-steering-templates"
git clone --depth 1 "$STEERING_REPO" "$STEERING_DIR"
# El catálogo queda en: $STEERING_DIR/catalog.md
```
Fija la versión del catálogo (tag o commit) en el registro del Paso 11 para
trazabilidad. Si el repo no es accesible (permisos/red), informa al usuario y
salta este paso sin bloquear el resto del bootstrap.

Con base en `Product-Definition/technical-environment.md` (generado por aidlc-discovery),
selecciona los steering que aplican a CADA componente. Usa los criterios
"aplica cuando" del catálogo.

Presenta la selección al usuario:

```
### Steering seleccionados por componente

#### Frontend ({producto}-frontend)
- [x] base/base.md — Estándares Applying (siempre aplica)
- [x] architecture/react-nextjs-structure.md — Tech env: React 18
- [x] conventions/react-conventions.md — Convenciones de componentes
- [x] testing/testing-structure.md — Vitest detectado
- [ ] architecture/hexagonal-structure.md — No aplica: es backend

#### Backend ({producto}-backend)
- [x] base/base.md — Estándares Applying
- [x] architecture/hexagonal-structure.md — Tech env: hexagonal
- [x] conventions/rest-api.md — Expone REST API
- [x] conventions/error-handling.md — Siempre aplica
- [x] testing/testing-structure.md — Jest detectado
- [ ] architecture/react-nextjs-structure.md — No aplica: es frontend

#### Infra ({producto}-infra)
- [x] base/base.md — Estándares Applying
- [x] infrastructure/terraform-structure.md — Tech env: Terraform
- [ ] conventions/rest-api.md — No aplica: es IaC

¿Confirmas la selección? ¿Deseas agregar o quitar alguno?
[Answer]:
```

Espera confirmación. Luego ejecuta el script `sync-steering.sh` para cada componente.

Para CADA componente, ajusta el inclusion mode según la estrategia:
- **Multi-repo**: los steering específicos del componente usan `inclusion: always`
  (porque el repo entero es de un solo contexto)
- **Monorepo**: los steering usan `inclusion: fileMatch` con el glob del componente
  (ej: `apps/backend/**`)

Genera un `applying-steering.yaml` en cada repo/componente con el registro
de qué piezas se instalaron y en qué versión.

---

## Paso 7: Seleccionar skills

Con base en el catálogo, selecciona skills por componente y presenta al usuario.
Mismo formato que steering. Solo incluye skills cuyo criterio "aplica cuando"
coincide con lo detectado en el tech environment.

Espera confirmación y copia los skills seleccionados a `.kiro/skills/applying/`
de cada componente.

---

## Paso 8: Configurar hooks base

Crea hooks mínimos en cada componente:

**Para componentes con código (frontend, backend):**
```markdown
---
event: file_save
match: "src/**"
action: ask_kiro
---
Verifica que el archivo guardado cumple con las convenciones definidas
en los steering files de este componente. Si hay violaciones, sugiere
correcciones específicas.
```

**Para infraestructura:**
```markdown
---
event: file_save
match: "**/*.tf"
action: ask_kiro
---
Verifica que el archivo Terraform cumple con las convenciones de módulos,
naming y estructura definidas en el steering de infraestructura.
```

---

## Paso 9: Commit inicial

En CADA repo, haz commit y push de la estructura generada:

```bash
cd {repo-path}
git add -A
git commit -m "chore: bootstrap project structure

Generated by AI-DLC applying-project-bootstrap extension.
- Steering files from applying/steering-templates@{version}
- Strategy: {monorepo|multirepo-workspace|multirepo-independent}
- Components: {lista de componentes}"
git push origin {branch}
```

---

## Paso 10: Generar script de onboarding

Crea `scripts/setup.sh` en el repo config (o en la raíz si monorepo):

```bash
#!/bin/bash
# Onboarding script para nuevos developers
# Uso: curl -sL {raw-url} | bash
#   o: git clone {config-repo} && cd {config} && ./scripts/setup.sh

set -euo pipefail

PRODUCT="{producto}"
ORG="{org}"
REPOS=({lista de repos})
BRANCH="{branch}"

echo "=== Setting up $PRODUCT workspace ==="

# Verificar prerequisites
command -v gh >/dev/null 2>&1 || { echo "Instala GitHub CLI: https://cli.github.com"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "Instala git"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "Ejecuta: gh auth login"; exit 1; }

# Crear directorio del producto
mkdir -p "$PRODUCT" && cd "$PRODUCT"

# Clonar todos los repos
for repo in "${REPOS[@]}"; do
  if [ ! -d "$repo" ]; then
    gh repo clone "$ORG/$repo" -- -b "$BRANCH"
    echo "✓ Cloned $repo"
  else
    echo "~ $repo already exists, skipping"
  fi
done

echo ""
echo "=== Setup complete ==="
echo "Abre el workspace en Kiro:"
echo "  kiro ${PRODUCT}-config/${PRODUCT}.code-workspace"
```

---

## Paso 11: Resumen y registro

Presenta un resumen final de todo lo creado:

```
### Bootstrap completado

| Elemento          | Estado | Detalle                              |
|-------------------|--------|--------------------------------------|
| Repos creados     | ✓      | {n} repos en {org}                   |
| Workspace file    | ✓      | {producto}.code-workspace            |
| Steering files    | ✓      | {n} archivos en {n} componentes      |
| Skills            | ✓      | {n} skills en {n} componentes        |
| Hooks             | ✓      | {n} hooks configurados               |
| Commit inicial    | ✓      | Pushed a {branch} en todos los repos |
| Script onboarding | ✓      | scripts/setup.sh                     |
```

Registra en `audit.md` de AI-DLC:
```
## [Bootstrap] Applying Project Bootstrap
- Fecha: {timestamp}
- Estrategia: {monorepo|multirepo-workspace|multirepo-independent}
- Repos: {lista}
- Steering version: {version}
- Decisiones: {resumen de selecciones del usuario}
```

Continúa con Requirements Analysis normalmente.
AI-DLC ahora puede generar artefactos directamente en los repos creados.
