# Image prompt contract

Build image prompts in this order:

1. `SCENE`: visible narrative moment.
2. `CAST`: named characters, references, permanent traits, current state, pose, and action.
3. `CREATURES`: verified anatomy, count, equipment, behavior, and uncertainties; write `None visible` when no creatures are present.
4. `ENVIRONMENT`: location, terrain, architecture, atmosphere, and important props.
5. `SPATIAL RELATIONSHIPS`: foreground, middle ground, background, distances, facing, and action direction.
6. `CAMERA AND COMPOSITION`: framing, angle, focal subject, depth, and aspect ratio.
7. `LIGHTING AND PALETTE`: scene lighting and active palette.
8. `STYLE`: active `base_style` and setting from `visual-style.yaml`.
9. `CONTINUITY CONSTRAINTS`: identities, species, anatomy, equipment, temporary states, and exact cast count.
10. `NEGATIVE CONSTRAINTS`: global negatives plus scene-specific failure cases.

Before generation, verify internally that every visible named character has a registry entry and an available portrait, or is explicitly marked unresolved.
