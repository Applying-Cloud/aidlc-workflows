# Applying Extension Advisor — Extensión AI-DLC (always-on)

## Propósito
Antes de que AI-DLC presente los prompts de opt-in individuales en
Requirements Analysis, esta extensión analiza el contexto del producto y
**recomienda proactivamente qué extensiones activar**, con justificación
basada en señales del technical-environment. El usuario sigue confirmando
cada extensión por el mecanismo de opt-in normal del framework; el advisor
solo orienta la decisión — no la reemplaza ni la fuerza.

## Por qué es always-on
Esta extensión NO tiene archivo `*.opt-in.md`. Por convención del core-workflow,
las extensiones sin opt-in se cargan y aplican siempre. Es deliberado: la
recomendación debe ocurrir en todo proyecto, antes de pedir confirmaciones.

## Cuándo aplica
- **Aplica**: una sola vez, al INICIO de Requirements Analysis, ANTES de
  presentar los prompts de opt-in de las demás extensiones.
- **N/A**: en cualquier otra etapa (Application Design, Construction, etc.).
  En el resumen de compliance de esas etapas, márcala como N/A.

---

## Regla: recomendación de extensiones antes del análisis

### Paso 1 — Reunir contexto
Lee, si existen:
- `Product-Definition/technical-environment.md` (stack, componentes, NFRs)
- `Product-Definition/vision-document.md` (objetivos, restricciones, compliance)
- La lista de extensiones descubiertas al escanear `extensions/` y sus
  `*.opt-in.md` (las que tienen prompt opt-in son las candidatas a recomendar).

Si no hay `Product-Definition/`, usa lo que el usuario haya descrito hasta ahora
y dilo explícitamente ("recomendación preliminar, sin technical-environment").

### Paso 2 — Mapear señales a extensiones
Para CADA extensión con opt-in disponible, evalúa si el contexto la justifica.
Guíate por señales como estas (no es lista cerrada — razona sobre lo que detectes):

| Extensión              | Activar si el contexto menciona…                                  |
|------------------------|-------------------------------------------------------------------|
| security/baseline      | datos personales/PII, pagos, PCI, auth, exposición pública, compliance |
| testing/property-based | lógica algorítmica, parsers, transformaciones, invariantes, edge cases |
| resiliency/baseline    | alta disponibilidad, SLAs, reintentos, colas, tolerancia a fallos |
| applying-project-bootstrap | proyecto nuevo greenfield, necesidad de crear repos/workspace |

Para extensiones nuevas que aparezcan en `extensions/` en el futuro, infiere su
criterio desde su propio `*.opt-in.md` y aplícalo igual.

### Paso 3 — Presentar la recomendación consolidada
Antes de los opt-in individuales, presenta UNA tabla de recomendación:

```
### Recomendación de extensiones (Applying Advisor)

Basado en tu technical-environment, esto es lo que sugiero activar:

| Extensión                  | Recomendación | Por qué (señal detectada)                    |
|----------------------------|---------------|----------------------------------------------|
| security/baseline          | ✅ Activar    | Tech-env menciona PII y endpoints públicos   |
| testing/property-based     | ✅ Activar    | Hay lógica de cálculo con invariantes        |
| resiliency/baseline        | ⚪ Opcional   | No hay SLA explícito; actívala si aplica     |
| applying-project-bootstrap | ✅ Activar    | Proyecto greenfield, sin repos creados aún   |

A continuación te pediré confirmación de cada una por separado.
¿Deseas ajustar esta recomendación antes de continuar?
[Answer]:
```

Reglas de la presentación:
- Toda recomendación lleva justificación con la señal concreta del contexto.
  Prohibido recomendar "porque sí": si no hay señal, márcala ⚪ Opcional y dilo.
- No inventes señales para justificar activar algo. Si la data es incompleta,
  decláralo y recomienda Opcional.
- No fuerces la decisión: tras la recomendación, sigue con el opt-in normal
  del framework para que el usuario confirme cada extensión.

### Paso 4 — Continuar con el flujo normal
Tras la recomendación, procede con los prompts de opt-in individuales tal como
define el core-workflow. Registra las decisiones finales del usuario en
`aidlc-docs/aidlc-state.md` bajo `## Extension Configuration` (lo hace el
framework) y deja constancia en `audit.md` de que el advisor corrió y qué
recomendó vs. qué eligió el usuario.
