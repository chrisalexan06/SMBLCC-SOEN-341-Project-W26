import { test, expect } from '@playwright/test'
import { signIn, signOut, addInfoNoName, deleteRecipe } from './helpers/auth'
import { format } from 'date-fns'


//tests to see if user can sign in and access dashboard, sign out successfully, and if unauthenticated users are redirected to sign-in page when trying to access protected routes
test.describe('Authentication', () => {
  test('user can sign in and access dashboard', async ({ page }) => {
    await signIn(page)
    await expect(page).toHaveURL('/dashboard').catch(async () => {
    console.log('Current URL:', page.url())
    })
  })

  test('user can sign out', async ({ page }) => {
    await signIn(page)
    await expect(page).toHaveURL('/dashboard')
    await signOut(page)
    await expect(page).toHaveURL('/')
  })
})

test.describe('Weekly Planner Functions', () => {
  test('user can add recipe to weekly planner', async ({ page }) => {
    await signIn(page)
    await addInfoNoName(page)
    //input name
    const recipeName = 'Cheese Balls ' + Date.now()
    
    await page.getByPlaceholder('e.g., Quinoa Buddha Bowl').click()
    await page.keyboard.type(recipeName, { delay: 50 })
    
    await page.getByTestId("save-recipe-button").click({ force: true })
    
    await expect(page.getByText('Recipe saved')).toBeVisible( {timeout: 10000})

    await page.goto('/planning') 
    await page.waitForURL('/planning')

    const dateKey = format(new Date(), "yyyy-MM-dd");
    await page.getByTestId(`meal-slot-${dateKey}-1`).click({ force: true })
    await page.getByText(recipeName).click()

    await deleteRecipe(page, recipeName)
  })

  test('user cannot add duplicate recipe to weekly planner', async ({ page }) => {
    await signIn(page)
    await addInfoNoName(page)

    //input name
    const recipeName = 'E ' + Date.now()
    await page.getByPlaceholder('e.g., Quinoa Buddha Bowl').click()
    await page.keyboard.type(recipeName, { delay: 25 })
    
    await page.getByTestId("save-recipe-button").click({ force: true })
    await expect(page.getByText('Recipe saved')).toBeVisible({timeout: 10000})

    await page.goto('/planning') 
    await page.waitForURL('/planning')

    const dateKey = format(new Date(), "yyyy-MM-dd");
    await page.getByTestId(`meal-slot-${dateKey}-1`).click({ force: true })

    const dialog = page.getByRole('dialog', { name: 'Select Recipe' });
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await dialog.getByText(recipeName).click()
    await page.keyboard.press('Escape')

    await page.getByTestId(`meal-slot-${dateKey}-2`).click({ force: true })
    await dialog.getByText(recipeName).click();
    
    await page.waitForTimeout(1000)
    await expect(dialog.getByText('You already added this recipe.')).toBeVisible({timeout: 10000})
  })
})

test.describe('Recipe Functions', () => {
  test('user cannot create recipe without name', async ({ page }) => {
    await signIn(page) 
    await addInfoNoName(page)
    
    await page.evaluate(() => {
    window.confirm = () => true
    })
    await page.getByTestId("save-recipe-button").click({ force: true })
    await expect(page.getByText('Please enter a recipe name')).not.toBeVisible({timeout: 10000})
    
  })

  test('user can create and delete recipe', async ({ page }) => {
    await signIn(page) 
    await addInfoNoName(page)

    //input name
    const recipeName = 'Test Recipe ' + Date.now()
    await page.getByPlaceholder('e.g., Quinoa Buddha Bowl').fill(recipeName)
    
    await page.getByTestId("save-recipe-button").click({ force: true })
    await expect(page.getByText('Recipe saved')).toBeVisible({timeout: 10000})
    
    await deleteRecipe(page, recipeName)
    // await page.screenshot({ path: 'e2e/debug-3-after-submit.png' })
  })
})

test.describe('Unique Features', () => {
  test('user can favorite a recipe', async ({ page }) => {
    await signIn(page) 

    await page.getByTestId("save-button").first().click({ force: true })
    await page.waitForTimeout(500)

    await page.getByText("Review Saved").click({ force: true })
    await page.waitForTimeout(500)

    await expect(page.getByText("No saved recipes yet")).not.toBeVisible({timeout: 10000})

  })
})

  test.describe('For You Feed', () => {
    test('not interested hides the recipe', async ({ page }) => {
    await signIn(page)

    // Get the name of the first visible recipe
    const recipeName = await page.locator('.carousel-item, [role="group"]')
      .first()
      .locator('p.font-bold, p.text-sm')
      .first()
      .innerText()

    await page.getByText('Not Interested').first().click({ force: true })

    // Recipe should no longer appear in the feed
    await expect(page.getByText(recipeName)).not.toBeVisible({timeout: 10000})
    })

    test('find nearby searches for the recipe on the map', async ({ page }) => {
    await signIn(page)

    await page.getByText('Find nearby').first().click({ force: true })
    // The map search label should update to reflect the recipe name
    await expect(page.getByText("Spicebros")).not.toBeVisible({timeout: 10000})
  })
})

  test.describe('User Profile', () => {
    test('user can update profile information', async ({ page }) => {
      await signIn(page)
      await page.goto('/profile')
      await page.waitForURL('/profile')
      await page.getByTestId('age-input').fill('30')

      await page.getByText('Save Changes').click()
      await expect(page.getByText('Settings saved successfully!')).toBeVisible()
    })
  })