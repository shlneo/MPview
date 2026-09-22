export interface MapInfo {
  id: string
  name: string
  // Градиент + акцентный цвет — запасной вариант, пока для карты нет
  // картинки в public/maps/ (см. README.md там же).
  gradient: string
  accent: string
  // Путь к картинке карты — кладётся в public/maps/, подхватывается сама.
  defaultImage: string
  // В драфте участвуют только активные карты (их должно быть ровно 7 —
  // столько, сколько реально в текущем конкурентном пуле). Остальные карты
  // просто лежат про запас в этом же файле, чтобы при смене пула между
  // сезонами не пришлось ничего удалять/добавлять — только переключить флаг.
  active: boolean
}

export const MAP_POOL: MapInfo[] = [
  {
    id: 'dust2',
    name: 'Dust II',
    gradient: 'linear-gradient(160deg, #c99a5b 0%, #8a5a2e 55%, #4a2f18 100%)',
    accent: '#e0a95f',
    defaultImage: '/maps/dust2.png',
    active: true
  },
  {
    id: 'mirage',
    name: 'Mirage',
    gradient: 'linear-gradient(160deg, #d98a4a 0%, #8b4a6b 55%, #3d2247 100%)',
    accent: '#e8935a',
    defaultImage: '/maps/mirage.png',
    active: true
  },
  {
    id: 'inferno',
    name: 'Inferno',
    gradient: 'linear-gradient(160deg, #e2652f 0%, #9c2f1f 55%, #481412 100%)',
    accent: '#f0794a',
    defaultImage: '/maps/inferno.png',
    active: true
  },
  {
    id: 'nuke',
    name: 'Nuke',
    gradient: 'linear-gradient(160deg, #7fb0ad 0%, #34575c 55%, #17282d 100%)',
    accent: '#8fd6d1',
    defaultImage: '/maps/nuke.png',
    active: true
  },
  {
    id: 'overpass',
    name: 'Overpass',
    gradient: 'linear-gradient(160deg, #7fae6a 0%, #3c6b52 55%, #1c2f28 100%)',
    accent: '#9bd47f',
    defaultImage: '/maps/overpass.png',
    active: false
  },
  {
    id: 'ancient',
    name: 'Ancient',
    gradient: 'linear-gradient(160deg, #8fae5f 0%, #4d6b3a 55%, #24321d 100%)',
    accent: '#a9cf74',
    defaultImage: '/maps/ancient.png',
    active: true
  },
  {
    id: 'vertigo',
    name: 'Vertigo',
    gradient: 'linear-gradient(160deg, #9fb4c9 0%, #4d5f75 55%, #232b36 100%)',
    accent: '#b9cfe3',
    defaultImage: '/maps/vertigo.png',
    active: false
  },
  {
    id: 'train',
    name: 'Train',
    gradient: 'linear-gradient(160deg, #c9a23e 0%, #7a6a2e 55%, #362d16 100%)',
    accent: '#dbb84f',
    defaultImage: '/maps/train.png',
    active: false
  },
  {
    id: 'anubis',
    name: 'Anubis',
    gradient: 'linear-gradient(160deg, #d9c48a 0%, #7a6a45 55%, #2f2a1c 100%)',
    accent: '#e6d29e',
    defaultImage: '/maps/anubis.png',
    active: true
  },
  {
    id: 'cache',
    name: 'Cache',
    gradient: 'linear-gradient(160deg, #8a9a7f 0%, #4d5c47 55%, #22281f 100%)',
    accent: '#a3b896',
    defaultImage: '/maps/cache.png',
    active: true
  }
]
