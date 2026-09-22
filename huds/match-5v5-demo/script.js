// Мок-данные матча. Структура специально повторяет data.mock.json —
// когда появится реальный источник (CS2 GSI / MatchZy), эта функция
// заменится на приём тех же полей по WebSocket, а рендер ниже не изменится.
const MATCH_DATA = {
  series: { format: 'BO3', name: 'FIESTA SERIES 2', seriesScoreA: 2, seriesScoreB: 4 },
  map: 'DUST2',
  round: { number: 8, of: 24, clock: '1:21' },
  teams: {
    a: {
      name: 'PHANTOM ACADEMY',
      short: 'PA',
      color: '#3b82f6',
      score: 0,
      players: [
        { nick: 'chessz0r', hp: 100, armor: true, weapon: 'AK-47', kills: 3, deaths: 1, money: 2900, alive: true },
        { nick: 'Ayteem', hp: 100, armor: true, weapon: 'M4A1', kills: 2, deaths: 1, money: 3200, alive: true },
        { nick: 'Nawko', hp: 79, armor: true, weapon: 'AWP', kills: 5, deaths: 0, money: 1500, alive: true },
        { nick: 'Brahm-cf', hp: 100, armor: false, weapon: 'Deagle', kills: 1, deaths: 2, money: 4100, alive: true },
        { nick: 'KaLtayr1s', hp: 0, armor: false, weapon: 'AK-47', kills: 2, deaths: 3, money: 2000, alive: false }
      ]
    },
    b: {
      name: 'WW',
      short: 'WW',
      color: '#f97316',
      score: 0,
      players: [
        { nick: 'TheB', hp: 100, armor: true, weapon: 'M4A4', kills: 4, deaths: 1, money: 3600, alive: true },
        { nick: 'Atlas', hp: 60, armor: true, weapon: 'AK-47', kills: 1, deaths: 3, money: 1200, alive: true },
        { nick: 'Kongsi', hp: 100, armor: true, weapon: 'AWP', kills: 6, deaths: 0, money: 2500, alive: true },
        { nick: 'Kelier', hp: 0, armor: false, weapon: 'Glock', kills: 0, deaths: 4, money: 800, alive: false },
        { nick: 'Strobo', hp: 100, armor: false, weapon: 'Famas', kills: 2, deaths: 2, money: 1900, alive: true }
      ]
    }
  },
  killfeed: [
    { killer: 'Kongsi', killerTeam: 'b', weapon: 'AWP', victim: 'KaLtayr1s', headshot: true },
    { killer: 'Nawko', killerTeam: 'a', weapon: 'AK-47', victim: 'Kelier', headshot: false },
    { killer: 'TheB', killerTeam: 'b', weapon: 'M4A4', victim: 'Brahm-cf', headshot: false }
  ]
}

// Стабильные псевдослучайные позиции игроков на миникарте — только для наглядности демо.
const MINIMAP_POSITIONS = {
  a: [
    { x: 30, y: 70 },
    { x: 45, y: 55 },
    { x: 60, y: 40 },
    { x: 25, y: 45 },
    { x: 50, y: 80 }
  ],
  b: [
    { x: 70, y: 20 },
    { x: 80, y: 35 },
    { x: 65, y: 60 },
    { x: 85, y: 55 },
    { x: 75, y: 75 }
  ]
}

function initials(nick) {
  return nick.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase()
}

function hpColor(hp) {
  if (hp <= 25) return 'var(--hp-low)'
  if (hp <= 60) return 'var(--hp-mid)'
  return 'var(--hp-good)'
}

function renderScoreboard(data) {
  const { teams, round } = data
  return `
    <div class="scoreboard">
      <div class="team a">
        <div class="team-chip" style="background:${teams.a.color}">${teams.a.short}</div>
        <div class="team-name">${teams.a.name}</div>
      </div>
      <div class="score a">${teams.a.score}</div>
      <div class="round-info">
        <div class="round-clock">${round.clock}</div>
        <div class="round-label">Round ${round.number}/${round.of}</div>
      </div>
      <div class="score b">${teams.b.score}</div>
      <div class="team a">
        <div class="team-name">${teams.b.name}</div>
        <div class="team-chip" style="background:${teams.b.color}">${teams.b.short}</div>
      </div>
    </div>
  `
}

function renderSeriesTag(data) {
  const { series, map } = data
  return `
    <div class="series-tag">
      <div class="format">${series.format}</div>
      <div class="name">${map}</div>
      <div class="series-score">
        <span class="a">${series.seriesScoreA}</span>
        <span>:</span>
        <span class="b">${series.seriesScoreB}</span>
      </div>
    </div>
  `
}

function renderMinimap(data) {
  const dots = ['a', 'b']
    .flatMap((teamKey) =>
      data.teams[teamKey].players.map((p, i) => {
        const pos = MINIMAP_POSITIONS[teamKey][i]
        const deadClass = p.alive ? '' : ' dead'
        return `<div class="minimap-dot${deadClass}" style="left:${pos.x}%;top:${pos.y}%;background:${data.teams[teamKey].color}"></div>`
      })
    )
    .join('')

  return `
    <div class="minimap">
      <div class="minimap-grid"></div>
      ${dots}
      <div class="minimap-label">${data.map}</div>
    </div>
  `
}

function renderKillfeed(data) {
  const rows = data.killfeed
    .map((k) => {
      const color = data.teams[k.killerTeam].color
      const hs = k.headshot ? '<span class="headshot">★</span>' : ''
      return `
        <div class="killfeed-row">
          <span class="killer" style="color:${color}">${k.killer}</span>
          <span class="weapon">${k.weapon}</span>
          ${hs}
          <span>${k.victim}</span>
        </div>
      `
    })
    .join('')

  return `<div class="killfeed">${rows}</div>`
}

function renderPlayerRow(player, color) {
  const deadClass = player.alive ? '' : ' dead'
  return `
    <div class="player-row${deadClass}" style="--row-color:${color}">
      <div class="avatar">${initials(player.nick)}</div>
      <div class="player-main">
        <div class="player-top">
          <span class="nick">${player.nick}</span>
          <span class="kd">${player.kills}-${player.deaths}</span>
        </div>
        <div class="hp-bar">
          <div class="hp-bar-fill" style="width:${player.hp}%;background:${hpColor(player.hp)}"></div>
        </div>
      </div>
      <div class="player-side">
        <span class="weapon">${player.weapon}</span>
        <span class="money">$${player.money}</span>
      </div>
    </div>
  `
}

function renderTeamPanel(team, side) {
  const rows = team.players.map((p) => renderPlayerRow(p, team.color)).join('')
  return `<div class="team-panel ${side}">${rows}</div>`
}

function renderSponsorBar() {
  return `<div class="sponsor-bar">MPView</div>`
}

function render(data) {
  const hud = document.getElementById('hud')
  hud.innerHTML = [
    renderScoreboard(data),
    renderSeriesTag(data),
    renderMinimap(data),
    renderKillfeed(data),
    renderTeamPanel(data.teams.a, 'a'),
    renderTeamPanel(data.teams.b, 'b'),
    renderSponsorBar()
  ].join('')
}

render(MATCH_DATA)

// ---------- Камера игрока в эфире ----------
// MPView шлёт переключение камеры через локальный WebSocket (main-процесс,
// src/main/realtime.ts). Та же схема потом будет использоваться для live-данных
// матча из CS2 GSI — HUD ничего не знает о СS2/БД, просто слушает сокет.

const REALTIME_URL = 'ws://localhost:47990'
const cameraBox = document.getElementById('cameraBox')
const cameraInner = document.getElementById('cameraInner')
const cameraFrame = document.getElementById('cameraFrame')

const CAMERA_BASE_WIDTH = 320
const CAMERA_BASE_HEIGHT = 180

function setCameraRotation(rotation) {
  const deg = [0, 90, 180, 270].includes(rotation) ? rotation : 0
  cameraInner.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`
  // При повороте на 90/270 рамка визуально становится портретной —
  // меняем местами ширину/высоту самого camera-box, чтобы вокруг
  // повёрнутого видео не оставалось лишнего пустого места.
  const rotated = deg === 90 || deg === 270
  cameraBox.style.width = (rotated ? CAMERA_BASE_HEIGHT : CAMERA_BASE_WIDTH) + 'px'
  cameraBox.style.height = (rotated ? CAMERA_BASE_WIDTH : CAMERA_BASE_HEIGHT) + 'px'
}

// VDO.Ninja по умолчанию вписывает видео в кадр целиком (letterbox/pillarbox —
// чёрные полосы, если пропорции не совпадают). Параметр &cover переключает его
// на заполнение всей площади iframe с обрезкой лишнего — как object-fit:cover.
function withCoverParam(url) {
  if (!url || /[?&]cover(=|&|$)/.test(url)) return url
  return url + (url.includes('?') ? '&' : '?') + 'cover'
}

function setCamera(url, rotation) {
  if (url) {
    setCameraRotation(rotation)
    const src = withCoverParam(url)
    if (cameraFrame.src !== src) cameraFrame.src = src
    cameraBox.classList.add('active')
  } else {
    // Камера выключена/не выбрана — рамка остаётся на месте (обычный
    // ландшафтный вид), внутри показывается плейсхолдер-силуэт вместо видео.
    setCameraRotation(0)
    cameraBox.classList.remove('active')
    cameraFrame.src = ''
  }
}

function connectRealtime() {
  const ws = new WebSocket(REALTIME_URL)

  ws.addEventListener('message', (event) => {
    try {
      const msg = JSON.parse(event.data)
      if (msg.type === 'camera') setCamera(msg.url, msg.rotation)
    } catch {
      // игнорируем не-JSON/неизвестные сообщения
    }
  })

  // Если MPView ещё не запущен или перезапускается — пробуем переподключиться,
  // не оставляя HUD (открытый в OBS) без связи насовсем.
  ws.addEventListener('close', () => setTimeout(connectRealtime, 2000))
  ws.addEventListener('error', () => ws.close())
}

connectRealtime()
