import { Suspense } from "react"
import LandingHero from "@/components/landing-hero"

export default function Home() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <LandingHero />
    </Suspense>
  )
}
