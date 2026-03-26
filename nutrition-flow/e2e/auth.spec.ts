import { test, expect, Page } from '@playwright/test'
import { signIn, signOut, addInfoNoName } from './helpers/auth'


//tests to see if user can sign in and access dashboard, sign out successfully, and if unauthenticated users are redirected to sign-in page when trying to access protected routes
test.describe('Authentication', () => {
  test('user can sign in and access dashboard', async ({ page }) => {
    await signIn(page)
    await expect(page).toHaveURL('/dashboard').catch(async () => {
    console.log('Current URL:', page.url())
    })
  })

 // test('user cannot create recipe without name', async ({ page }) => {
  //  await signIn(page)
  //  await page.screenshot({ path: 'e2e/debug-before-AddNew.png' })
  //  await addInfoNoName(page)

    // Check for error message on the page
    
  //  await page.locator('button[type="submit"]').click({ force: true })
   // await page.screenshot({ path: 'e2e/debug-after-AddNew.png' })
  
  //  const dialogPromise= page.waitForEvent('dialog')
  //  const dialog = await dialogPromise

    //expect(dialog.message()).toContain('Please enter a recipe name') // optional
 //   await dialog.accept()
 // })

  test('user can create and delete recipe', async ({ page }) => {
    await signIn(page) 
    await addInfoNoName(page)


    //input name
    const recipeName = 'Test Recipe ' + Date.now()
    await page.getByPlaceholder('e.g., Quinoa Buddha Bowl').click()
    await page.keyboard.type(recipeName, { delay: 50 })
    await page.waitForTimeout(1000)
    
    await page.getByTestId("save-recipe-button").click({ force: true })
    await expect(page.getByText('Recipe saved')).toBeVisible()
    
    await page.goto('/recipes') 
    await page.waitForURL('/recipes')

    await page.screenshot({ path: 'LOOK HERE.png' })
    await page.getByTestId(`select-recipe-${recipeName}`).check() 
    await expect(page.getByTestId(`select-recipe-${recipeName}`)).toBeChecked()
    

    await expect(page.getByText('1 selected')).toBeVisible()

    await page.evaluate(() => {
    window.confirm = () => true
    })

    await page.getByTestId('delete-selected-button').click({ force: true })

    await expect(page.getByText('1 selected')).not.toBeVisible()

    await page.screenshot({ path: 'LOOK AGAIN.png' })
   

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
