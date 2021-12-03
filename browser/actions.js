const {getGame} = require('../scripts/game')
const {getControl} = require('../scripts/control')

let game = getGame()
let ctrl = getControl()
ctrl.bindGame(game)
let render = null

//
// control inputs
//
exports.tapleft = () => ctrl.tap('left')
exports.tapup = () => ctrl.tap('top')
exports.tapright = () => ctrl.tap('right')
exports.tapdownbegan = () => ctrl.tap('bottom:began')
exports.tapdownend = () => ctrl.tap('bottom:end')
exports.taprotate = () => ctrl.tap('rotate')
exports.tapdrop = () => ctrl.tap('drop')
exports.tappause = () => ctrl.tap('pause')
exports.tapstart = () => ctrl.tap('start')

exports.debugstep = () => ctrl.tap('debug:step')
exports.debugup = () => ctrl.tap('debug:up')
exports.debugdown = () => ctrl.tap('debug:down')

exports.initrender = (div) => {
  if (!render) {
    render = new RenderForBrowser(div, game)
  }
  render.draw()
  ctrl.tap('start')
  // ctrl.autoPlay('drop', 'drop', 'drop', 'drop', 'rotate', 'right', 'right', 'drop')
}

//
// game events
//
game.listen('score:changed', score => {
  document.querySelector('span#score').innerText = String(score).padStart(4, '0')
})
game.listen('lines:changed', lines => {
  document.querySelector('span#lines').innerText = String(lines).padStart(4, '0')
})
game.listen('combo:changed', combo => {
  document.querySelector('span#combo').innerText = String(combo).padStart(4, '0')
})
game.listen('level:changed', level => {
  document.querySelector('span#level').innerText = String(level)
})
game.listen('gameover', () => {
  alert(`gameover`)
  ctrl.tap('pause')
})
game.listen('render', () => render && render.draw())


//
// render
//
class RenderForBrowser {
  constructor(div, game) {
    this.game = game
    this.div = div
    let style = getComputedStyle(div)
    this.w = parseInt(style.width, 10)-1
    this.h = parseInt(style.height, 10)-1
    this.xcount = game.xcount
    this.ycount = game.ycount
    this.gridw = (this.w/this.xcount)
    this.gridh = (this.h/this.ycount)

    this.grids = []
    for (let y = 0; y < this.ycount; y++) {
      let arr = []
      for (let x = 0; x < this.xcount; x++) {
        let inner = document.createElement('div')
        inner.className = 'inner'
        let grid = document.createElement('div')
        grid.appendChild(inner)
        grid.classList.add('grid')
        grid.style.left = `${x*this.gridw}px`
        grid.style.top = `${y*this.gridh}px`
        grid.style.width = `${this.gridw + 1}px`
        grid.style.height = `${this.gridh + 1}px`
        arr.push(grid)
        this.div.appendChild(grid)
      }
      this.grids.push(arr)
    }

    this.nextGrids = []
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 4; x++) {
        let grid = document.createElement('div')
        grid.style.position = 'absolute'
        grid.style.left = `${x*15 + this.w + 40}px`
        grid.style.top = `${y*15 + this.h - 100}px`
        grid.style.width = `${15}px`
        grid.style.height = `${15}px`
        grid.style.background = 'gray'
        grid.style.border = `1px solid #879372`
        this.nextGrids.push(grid)
        this.div.appendChild(grid)
      }
    }
  }

  draw() {
    this.drawBases()
    this.drawPredictShape()
    this.drawCurrShape()
    this.drawNextShape()
  }

  drawBases() {
    this.game.bases.forEach((base, y) => {
      base.forEach((mark, x) => {
        if (mark > 0) {
          this.drawGrid(x, y, 'grid base')
        } else {
          this.drawGrid(x, y, 'grid')
        }
      })
    })
  }
  drawCurrShape() {
    let {pos, shape} = this.game.curr
    shape.grids.forEach(grid => {
      this.drawGrid(grid.x+pos.x, grid.y+pos.y, 'grid curr')
    })
  }
  drawNextShape() {
    this.nextGrids.forEach(grid => {
      grid.style.background = 'gray'
    })
    let {pos, shape} = this.game.next
    shape.grids.forEach(grid => {
      this.nextGrids[4*(grid.y-shape.boundTop) + grid.x].style.background = '#c7b77b'
    })
  }
  drawPredictShape() {
    let {pos, shape} = this.game.predict
    shape.grids.forEach(grid => {
      this.drawGrid(grid.x+pos.x, grid.y+pos.y, 'grid predict')
    })
  }
  drawGrid(x, y, className='grid') {
    if (x < 0 || y < 0) return
    if (x >= this.xcount || y >= this.ycount) return

    let grid = this.grids[y][x]
    grid.className = className
  }
}