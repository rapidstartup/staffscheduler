import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to the Staff Scheduling Platform
        </h1>
        <p className="mt-3 text-2xl">
          Get started by logging in or signing up
        </p>
        <div className="flex mt-6">
          <Link href="/login" className="mx-4 px-6 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors">
            Login
          </Link>
          <Link href="/signup" className="mx-4 px-6 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition-colors">
            Sign Up
          </Link>
        </div>
      </main>
    </div>
  )
}

