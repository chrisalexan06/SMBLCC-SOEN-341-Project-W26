import { Page } from '@playwright/test'

//helper functions for signing in and out during tests, using credentials from environment variables
export async function signIn(page: Page) {
  await page.goto('/login')

  await page.fill('input[name="identifier"]', process.env.CLERK_TEST_USER_EMAIL!)
  await page.click('button:has-text("Continue")')

  await page.fill('input[name="password"]', process.env.CLERK_TEST_USER_PASSWORD!)
  await page.click('button:has-text("Continue")')

  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard')
}

export async function signOut(page: Page) {
  await page.click('[data-clerk-user-button]')
  await page.click('button:has-text("Sign out")')
  await page.waitForURL('/')
}
