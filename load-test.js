import http from 'k6/http'
import { sleep } from 'k6'

export const options = {
  vus: 10,
  duration: '30s',
}

export default function () {
  http.get('http://localhost:3000/api/shifts?month=6&year=2023')
  sleep(1)
}

