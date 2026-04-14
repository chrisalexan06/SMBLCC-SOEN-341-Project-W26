import { Page, expect } from '@playwright/test'


//helper functions for signing in and out during tests, using credentials from environment variables
export async function signIn(page: Page) {
  const currentUrl = page.url();
  if (!currentUrl.includes('/login')) {
    await page.goto('/login');
  }
  await page.waitForLoadState('networkidle')
  await page.getByPlaceholder('name@example.com').click({ force: true })
  await page.keyboard.type("christina+clerk_test@example.com", { delay: 25 })

  await page.getByPlaceholder('••••••••').click({ force: true })
  await page.keyboard.type("Test1$12", { delay: 25 })


  await page.locator('button[type="submit"]').click({ force: true })

  await page.waitForURL('/dashboard')
}

//fix so that it directs to profile page and then click the user button to sign out, since the user button is not visible on the dashboard page
export async function signOut(page: Page) {
  await page.waitForLoadState('networkidle')
  const currentUrl = page.url();
  if (!currentUrl.includes('/profile')) {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });
  }
  
  // Click the Clerk UserButton (renders as a button with an img inside)
  await page.getByRole('button', { name: 'Open user menu' }).waitFor({ state: 'visible'})
  await page.getByRole('button', { name: 'Open user menu' }).click()
  
  // Wait for the dropdown menu to appear
  await page.waitForTimeout(500)
  await page.getByText('Sign out').click()
  await page.waitForURL('/')
}

export async function addInfoNoName(page: Page) {
  await page.getByText('Add New').click({force: true})
  
  //input description
  await page.getByPlaceholder('A short description of your dish...').click()
  await page.keyboard.type("D")
  
  //input time 
  await page.getByTestId('prep-time').click()
  await page.keyboard.type("1")
  
  //input calories
  await page.getByTestId('estimated-calories').click()
  await page.keyboard.type("1")
  
  //input cost
  await page.getByTestId('estimated-cost').click()
  await page.keyboard.type("2")
  
  //set difficulty already set to easy by default, so no need to change that

  //set ingredients
  await page.getByPlaceholder('Ingredient').click()
  await page.keyboard.type("B")
  
  //set prep steps
  await page.getByPlaceholder('Step 1...').click()
  await page.keyboard.type("O")
  
}

export async function deleteRecipe(page: Page, recipeName: string) {
  const currentUrl = page.url();
  if (!currentUrl.includes('/recipes')) {
    await page.goto('/recipes');
  }
  await page.waitForURL('/recipes')
  await page.getByTestId(`select-recipe-${recipeName}`).check() 
  
  await expect(page.getByTestId(`select-recipe-${recipeName}`)).toBeChecked()
  //await page.screenshot({ path: 'e2e/debug-1-after-submit.png' })
  
  await expect(page.getByText('1 selected')).toBeVisible({timeout: 2000})
  
  await page.evaluate(() => {
  window.confirm = () => true
  })
  
  await page.getByTestId('delete-selected-button').click({ force: true })
  await expect(page.getByText(recipeName)).not.toBeVisible({timeout: 10000})

}
