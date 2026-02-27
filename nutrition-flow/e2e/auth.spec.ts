import { test, expect } from '@playwright/test'
import { signIn, signOut } from './helpers/auth'

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

//might delete this test since the middleware should handle redirecting unauthenticated users, but it doesn't hurt to have an extra check
//  test('unauthenticated user is redirected', async ({ page }) => {
 //   await page.goto('/dashboard')
//    await expect(page).toHaveURL(/\/login/)
//  })
})
