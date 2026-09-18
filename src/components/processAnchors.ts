/**
 * Single source of truth for the Process section's four stage anchors.
 * Expressed as fractions of the content frame (.msj-stage-layer inner width),
 * which uses the same symmetric width as .msj-container:
 *   width: min(calc(100% - clamp(28px, 6vw, 116px)), 1800px)
 * Values are the four column centres of a 4-column CSS grid (repeat(4, 1fr)),
 * so left/right outer margins are equal by construction.
 */
export const STAGE_ANCHORS = [0.125, 0.375, 0.625, 0.875] as const;
