'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import QRCode from 'qrcode.react'

export default function TwoFactorAuth() {
  const { data: session } = useSession()
  const [secret, setSecret] = useState('')
  const [otpauth, setOtpauth] = useState('')
  const [isEnabled, setIsEnabled] = useState(false)

  const enable2FA = async () => {
    const response = await fetch('/api/auth/enable-2fa', {
      method: 'POST',
    })
    const data = await response.json()
    if (data.secret && data.otpauth) {
      setSecret(data.secret)
      setOtpauth(data.otpauth)
      setIsEnabled(true)
    }
  }

  if (!session) {
    return null
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Two-Factor Authentication</h2>
      {!isEnabled ? (
        <button
          onClick={enable2FA}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Enable 2FA
        </button>
      ) : (
        <div>
          <p className="mb-2">Scan this QR code with your authenticator app:</p>
          <QRCode value={otpauth} />
          <p className="mt-2">Or enter this code manually: {secret}</p>
        </div>
      )}
    </div>
  )
}

