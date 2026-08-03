---
name: skt-visual-agent
description: Generate or prepare visually consistent Storm King's Thunder campaign scenes from the user's current-session description. Use when Codex must resolve campaign characters and their portraits, consult historical blog continuity, verify D&D creatures, apply the versioned visual style, or revise an existing SKT image.
---

# SKT Visual Agent

## Load only what the scene needs

1. Read [references/project-config.md](references/project-config.md).
2. Resolve the campaign and portrait roots using that configuration; do not guess paths or scan unrelated user directories.
3. Read `visual-style.yaml` and only the matching entries from `characters.yaml` for named visible characters.
4. Read `creatures.yaml` only when the scene contains creatures, and only retrieve matching entries.
5. Search the blog only when historical continuity can materially affect the requested scene.
6. If a required source or portrait is unavailable, report the missing configured resource instead of inventing campaign data.

## Resolve the scene

1. Treat the user's current scene description and corrections as authoritative for cast, action, temporary states, environment, spatial relationships, and outcome.
2. Use the blog only for historical continuity; never require the current scene to exist there.
3. Resolve every visible named character against `characters.yaml`; each reference entry contains its source filename.
4. Separate permanent identity from temporary transformations, injuries, disguises, clothing, and equipment.
5. Resolve each creature from `creatures.yaml` first.
6. For a missing creature, run the configured read-only D&D resolver. Use its explicit fields and API image as evidence; never derive anatomy from statistics alone.
7. Mark unresolved details and use only conservative visual inference.

## Build and validate the image

1. Build the prompt in the order defined by [references/prompt-contract.md](references/prompt-contract.md), applying `visual-style.yaml`.
2. Supply the original local reference image for every visible named character.
3. Preserve identity, species, build, face, distinctive features, and established equipment.
4. Use 16:9 unless the user explicitly requests another ratio.
5. Validate cast count, spatial relationships, identity, anatomy, equipment, duplicates, setting, text, and aspect ratio.

## Generate or prepare the image

- If the user asks to generate an image, use the image-generation skill and generate directly after validation.
- If the user asks only for analysis or a prompt, do not generate an image.
- If the user asks to review before generation, show a concise scene summary and wait for confirmation.
- Without an explicit review request, keep successful checks internal and do not force an approval step.
- Stop before generation only when a missing reference or material conflict would substantially change the result.
- During revisions, change only the requested elements and preserve all other established identities and scene facts.

## Respond concisely

For successful direct generation, report only the important resolved assumptions and the generated image. Do not require the user to repeat workflow instructions already encoded in this agent.
