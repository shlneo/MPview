import type { MatchFormat } from './types'

// Сколько карт реально сыграется в серии. В отличие от прошлой версии, ни одна
// карта не становится "решающей" по умолчанию (без клика) — каждая карта
// явно либо забанена, либо выбрана кем-то из команд, в том числе последняя.
const PICKS_BY_FORMAT: Record<MatchFormat, number> = { bo1: 1, bo3: 3, bo5: 5 }

// Строим порядок действий под точное число активных карт в пуле. Для Bo3 при
// 7 картах это даёт классическую схему бан-бан-пик-пик-бан-бан-пик; для Bo1 —
// бан×6 + финальный пик; для Bo5 — бан-бан + пик×5.
export function buildVetoPattern(format: MatchFormat, totalMaps: number): Array<'ban' | 'pick'> {
  const picks = Math.min(PICKS_BY_FORMAT[format], totalMaps)
  const bans = totalMaps - picks
  const leadingBans = Math.min(2, bans)
  const middlePicks = Math.max(picks - 1, 0)
  const trailingBans = bans - leadingBans

  return [
    ...Array(leadingBans).fill('ban'),
    ...Array(middlePicks).fill('pick'),
    ...Array(trailingBans).fill('ban'),
    ...Array(picks > 0 ? 1 : 0).fill('pick')
  ]
}

export function turnTeamId(stepIndex: number, teamAId: string, teamBId: string): string {
  return stepIndex % 2 === 0 ? teamAId : teamBId
}
