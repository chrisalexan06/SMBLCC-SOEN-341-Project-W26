import { Page } from '@playwright/test'

//helper functions for signing in and out during tests, using credentials from environment variables
export async function signIn(page: Page) {
  await page.goto('/login')

  await page.fill('input[name="identifier"]', process.env.CLERK_TEST_USER_EMAIL!)
  await page.fill('input[name="password"]', process.env.CLERK_TEST_USER_PASSWORD!)
  await page.click('button:has-text("Log in")') //should work now

  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard')
}

//fix so that it directs to profile page and then click the user button to sign out, since the user button is not visible on the dashboard page
export async function signOut(page: Page) {
    //force to go to profile page to sign out
  await page.goto('/profile')
  await page.waitForURL('/profile')

  await page.click('[data-clerk-user-button]')
  await page.click('button:has-text("Sign out")')
  await page.waitForURL('/')
}
