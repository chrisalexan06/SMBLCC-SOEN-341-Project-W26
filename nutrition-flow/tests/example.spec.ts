import { test, expect, Page } from '@playwright/test'
import { clerkClient } from '@clerk/nextjs/server'

//creates a test user if it doesn't already exist, then defines helper functions for signing in and out during tests 
 async function setupTestUser() {
  const client = await clerkClient()

  // Check if test user exists
  const { data: users } = await client.users.getUserList({
    emailAddress: ['test@example.com']
  })

  if (users.length === 0) {
    // Create test user
    const user = await client.users.createUser({
      emailAddress: ['test@example.com'],
      password: process.env.CLERK_TEST_USER_PASSWORD,
      firstName: 'Test',
      lastName: 'User'
    })
    console.log('Created test user:', user.id)
  } else {
    console.log('Test user already exists:', users[0].id)
  }
}

setupTestUser()

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



//tests to see if user can sign in and access dashboard, sign out successfully, and if unauthenticated users are redirected to sign-in page when trying to access protected routes
test.describe('Authentication', () => {
  test('user can sign in and access dashboard', async ({ page }) => {
    await signIn(page)
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('user can sign out', async ({ page }) => {
    await signIn(page)
    await signOut(page)
    await expect(page).toHaveURL('/')
  })

  test('unauthenticated user is redirected', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })
})
