import { Server } from 'socket.io'
import { createServer } from 'http'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res)
  })

  const io = new Server(server)

  io.on('connection', (socket) => {
    console.log('A user connected')

    socket.on('join', (userId) => {
      socket.join(userId)
      console.log(`User ${userId} joined`)
    })

    socket.on('shiftUpdate', (data) => {
      io.to(data.userId).emit('shiftUpdated', data)
    })

    socket.on('tradeRequest', (data) => {
      io.to(data.targetUserId).emit('newTradeRequest', data)
    })

    socket.on('disconnect', () => {
      console.log('A user disconnected')
    })
  })

  server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
  })
})

export const sendNotification = (userId: string, message: string) => {
  io.to(userId).emit('notification', message)
}

