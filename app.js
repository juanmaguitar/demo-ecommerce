const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const FileStore = require('session-file-store')(session)

const products = require('./data/products.json')

const app = express()
const PORT = 3000

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))

app.set('view engine', 'pug')

app.use(session({
  name: 'jm-server-session-cookie-id',
  secret: '4u6mVaJtJrrhZb2iHx2ugBof',
  saveUninitialized: true,
  resave: true,
  store: new FileStore()
}))

app.use((req, res, next) => {
  req.session.cart = req.session.cart || []
  next()
})

app.get('/cart', (req, res) => {
  const cart = req.session.cart
  if (cart.length) {
    res.render('cart/index', { cart })
  } else {
    res.render('cart/empty')
  }
})

app.get('/', (req, res) => {
  const cart = req.session.cart
  res.render('list/index', { products, cart })
})

app.post('/cart', (req, res) => {
  const { id, name, price, image } = req.body
  const newItem = { id, name, price, image }
  req.session.cart.push(newItem)
  res.redirect('/')
})

app.delete('/cart/:id', (req, res) => {
  const id = +req.params.id
  const originalSize = req.session.cart.length
  req.session.cart = req.session.cart.filter(item => {
    return item.id !== id
  })
  if (originalSize === req.session.cart.length) {
    res.status(500).send(`Item w/ ID: ${id} was not removed from the cart`)
  } else {
    res.status(200).send(`Item w/ ID: ${id} was removed succesfully`)
  }
})

app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`))

