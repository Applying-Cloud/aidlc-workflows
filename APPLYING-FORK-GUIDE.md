# Applying — Guía del fork de aidlc-workflows

Cómo conviven las personalizaciones de Applying con el framework de awslabs,
y cómo traer la última versión de upstream sin que se crucen.

## Modelo de dos repos

| Repo | Contenido | Origen / actualización |
|------|-----------|------------------------|
| **aidlc-workflows** (este fork) | Framework awslabs + **lógica de workflow de Applying** (extensiones bootstrap y advisor) | `origin` = Applying-Cloud/aidlc-workflows · `upstream` = awslabs/aidlc-workflows |
| **applying-steering-templates** | **IP distribuible**: steering, skills, `catalog.md`. Versionada aparte. | ApplyingCloudOrg/applying-steering-templates |

Por qué separados: el framework lo *consumes* de awslabs; tu IP la *distribuyes*
hacia los repos de proyecto del cliente (vía el Paso 6 del bootstrap). Tienen
dueños, consumidores y ciclos de release distintos.

## Qué es de Applying en este fork (rutas namespaced)

Todo lo de Applying vive en rutas que awslabs nunca escribe:

```
.gitattributes                                                  ← normalización LF
APPLYING-FORK-GUIDE.md                                          ← este archivo
aidlc-rules/aws-aidlc-rule-details/extensions/
├── applying-project-bootstrap/                                 ← extensión (opt-in)
│   ├── applying-project-bootstrap.md
│   └── applying-project-bootstrap.opt-in.md
└── applying-extension-advisor/                                 ← extensión (always-on)
    └── applying-extension-advisor.md
```

Las extensiones `security/`, `testing/`, `resiliency/` son de awslabs — no tocar.

## LA REGLA DE ORO

**Nunca edites un archivo de awslabs in-place. Solo AGREGA archivos en rutas
namespaced (`applying-*`, `APPLYING-*`).**

Si necesitas cambiar comportamiento del flujo, hazlo con una extensión
(como hace el advisor), no editando `core-workflow.md` ni los archivos de
`inception/`, `common/`, etc. Mientras cumplas esto, `git merge upstream/main`
nunca produce conflictos sobre tu trabajo.

## Cómo traer la última versión de upstream

```bash
git fetch upstream
git merge upstream/main        # o: git rebase upstream/main
git push origin main
```

Como tus cambios solo agregan archivos nuevos, el merge es limpio. Si algún día
aparece un conflicto, significa que se editó un archivo compartido — revísalo:
la regla de oro se rompió en algún punto.

## Cómo se consume el catálogo de IP (en bootstrap)

La extensión bootstrap clona `applying-steering-templates` en runtime para leer
`catalog.md` y distribuir steering a los repos de proyecto. Fija la versión
(tag/commit) del catálogo en el registro del Paso 11 para trazabilidad.

---

## Pendientes manuales (no los pude hacer desde el sandbox)

El mount de Windows bloquea borrar archivos y el `.git/index.lock`. Ejecuta esto
una sola vez, en Windows, en la raíz de cada repo:

### 1. En `aidlc-workflows` — limpiar lock huérfano y commitear

Quedó un `index.lock` huérfano de una operación de git que crasheó (el repo está
íntegro: `git fsck` limpio, historial y working tree intactos).

```powershell
# PowerShell, en la raíz del fork
Remove-Item .git\index.lock -ErrorAction SilentlyContinue
git config core.autocrlf false
git config core.eol lf
git status                       # debe mostrar solo lo nuevo de Applying
git add .gitattributes APPLYING-FORK-GUIDE.md `
        aidlc-rules/aws-aidlc-rule-details/extensions/applying-project-bootstrap `
        aidlc-rules/aws-aidlc-rule-details/extensions/applying-extension-advisor
git commit -m "feat(applying): extensiones bootstrap + advisor, .gitattributes y guía de fork"
git push origin main
```

> El `.gitattributes` con `eol=lf` elimina los diffs fantasma por CRLF que tenías
> (todo el árbol aparecía modificado). Confírmalo: tras el commit, `git status`
> debe quedar limpio.

### 2. En `applying-steering-templates` — quitar la extensión movida

La extensión bootstrap se movió al fork; quita la copia vieja del repo de IP:

```powershell
git rm -r extensions
git commit -m "chore: mover applying-project-bootstrap al fork aidlc-workflows"
git push origin main
```

Tras esto, `applying-steering-templates` queda solo con `steering/`, `skills/`,
`catalog.md` y `scripts/` — su rol definitivo como repo de IP distribuible.
