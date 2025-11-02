import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { type EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  let next = requestUrl.searchParams.get('next') ?? '/dashboard'

  // Ensure next is a relative path
  if (!next.startsWith('/')) {
    next = '/dashboard'
  }

  const supabase = await createClient()

  // Handle PKCE flow (code parameter)
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        // Successfully exchanged code for session
        const origin = new URL(request.url).origin
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      }

      console.error('Code exchange error:', error)
      const errorUrl = new URL(request.url)
      errorUrl.pathname = '/'
      errorUrl.searchParams.set('error', `auth_error: ${error.message}`)
      errorUrl.searchParams.delete('code')
      errorUrl.searchParams.delete('next')
      return NextResponse.redirect(errorUrl)
    } catch (err: any) {
      console.error('Auth callback exception:', err)
      const errorUrl = new URL(request.url)
      errorUrl.pathname = '/'
      errorUrl.searchParams.set('error', `auth_error: ${err.message || 'Unknown error'}`)
      errorUrl.searchParams.delete('code')
      errorUrl.searchParams.delete('next')
      return NextResponse.redirect(errorUrl)
    }
  }

  // Handle OTP flow (token_hash parameter) - for older email templates
  if (tokenHash && type) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type,
      })

      if (!error) {
        // Successfully verified - redirect to dashboard or next URL
        const origin = new URL(request.url).origin
        return NextResponse.redirect(`${origin}${next}`)
      }

      console.error('OTP verification error:', error)
      const errorUrl = new URL(request.url)
      errorUrl.pathname = '/'
      errorUrl.searchParams.set('error', `auth_error: ${error.message}`)
      errorUrl.searchParams.delete('token_hash')
      errorUrl.searchParams.delete('type')
      errorUrl.searchParams.delete('next')
      return NextResponse.redirect(errorUrl)
    } catch (err: any) {
      console.error('Auth callback exception:', err)
      const errorUrl = new URL(request.url)
      errorUrl.pathname = '/'
      errorUrl.searchParams.set('error', `auth_error: ${err.message || 'Unknown error'}`)
      errorUrl.searchParams.delete('token_hash')
      errorUrl.searchParams.delete('type')
      errorUrl.searchParams.delete('next')
      return NextResponse.redirect(errorUrl)
    }
  }

  // No code or token_hash found - redirect to error page
  const errorUrl = new URL(request.url)
  errorUrl.pathname = '/'
  errorUrl.searchParams.set('error', 'auth_callback_error')
  errorUrl.searchParams.delete('code')
  errorUrl.searchParams.delete('token_hash')
  errorUrl.searchParams.delete('type')
  errorUrl.searchParams.delete('next')
  return NextResponse.redirect(errorUrl)
}

