import { EmailAddress } from '@clerk/nextjs/server'
import { Page } from '@playwright/test'


//helper functions for signing in and out during tests, using credentials from environment variables
export async function signIn(page: Page) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  await page.getByPlaceholder('name@example.com').click({ force: true })
  await page.keyboard.type("christina+clerk_test@example.com", { delay: 50 })

  await page.getByPlaceholder('••••••••').click({ force: true })
  await page.keyboard.type("Test1$12", { delay: 50 })

  await page.screenshot({ path: 'e2e/debug-2-filled.png' })

  await page.locator('button[type="submit"]').click({ force: true })

  await page.waitForURL('/dashboard', { timeout: 60000 }).catch(async () => {
    console.log('Final URL:', page.url())
    
  })
}

//fix so that it directs to profile page and then click the user button to sign out, since the user button is not visible on the dashboard page
export async function signOut(page: Page) {
  await page.goto('/profile')
  await page.waitForURL('/profile')

  // Click the Clerk UserButton (renders as a button with an img inside)
  await page.locator('button img').first().click()
  
  // Wait for the dropdown menu to appear
  await page.waitForTimeout(1000)
  
  await page.getByText('Sign out').click()
  await page.waitForURL('/')
}

export async function addInfoNoName(page: Page) {
  await page.getByTestId('add-new-recipe-button').click()
  
  //input description
  await page.getByPlaceholder('A short description of your dish...').click()
  await page.keyboard.type("This is a test recipe description.", { delay: 50 })
  await page.waitForTimeout(1000)
  
  //input time 
  await page.getByTestId('prep-time').click()
  await page.keyboard.type("10", { delay: 50 })
  await page.waitForTimeout(100)
  //input calories
  await page.getByTestId('estimated-calories').click()
  await page.keyboard.type("100", { delay: 50 })
  await page.waitForTimeout(100)
  //input cost
  await page.getByTestId('estimated-cost').click()
  await page.keyboard.type("20", { delay: 50 })
  await page.waitForTimeout(100)
  //set difficulty already set to easy by default, so no need to change that

  //set ingredients
  await page.getByPlaceholder('Ingredient').click()
  await page.keyboard.type("Boxed salad", { delay: 50 })
  await page.waitForTimeout(100)
  //set prep steps
  await page.getByPlaceholder('Step 1...').click()
  await page.keyboard.type("Open and put into a bowl and mix", { delay: 50 })
  await page.waitForTimeout(100)
}
