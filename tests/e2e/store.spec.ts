import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { createClient } from '@supabase/supabase-js'
import { loadEnv } from 'vite'
import type { Page } from '@playwright/test'

const env = loadEnv('test', process.cwd(), '')
const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})
const createdUsers: string[] = []
async function signup(page: Page) {
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click()
  const email = `browser-${Date.now()}-${Math.random().toString(16).slice(2, 6)}@example.com`
  await page.getByLabel('Email address', { exact: true }).fill(email)
  await page.getByLabel('Password', { exact: true }).fill('EverydayTest123!')
  await page
    .getByRole('button', { name: 'Create your account', exact: true })
    .click()
  await expect(page).toHaveURL(/\/checkout|\/orders/)
  const { data } = await admin.auth.admin.listUsers()
  const user = data.users.find((entry) => entry.email === email)
  if (user) createdUsers.push(user.id)
  return email
}
async function address(page: Page) {
  await page.getByLabel('Full name', { exact: true }).fill('Alex Taylor')
  await page
    .getByLabel('Street address', { exact: true })
    .fill('125 Market Street')
  await page.getByLabel('City', { exact: true }).fill('San Francisco')
  await page.getByLabel('State', { exact: true }).fill('CA')
  await page.getByLabel('ZIP code', { exact: true }).fill('94103')
}
async function addLamp(page: Page) {
  await page.goto('/products/ee-47')
  await page.getByRole('button', { name: 'Add to bag', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Added to your bag', exact: true }),
  ).toBeVisible()
}
test.afterAll(async () => {
  for (const id of createdUsers) await admin.auth.admin.deleteUser(id)
})

test('catalog filters are in the URL, detail navigation restores them, and unknown products are handled', async ({
  page,
}) => {
  await page.goto('/products')
  await page.getByLabel('Search the collection').fill('cup')
  await page.getByRole('button', { name: 'Submit search' }).click()
  await expect(page).toHaveURL(/q=cup/)
  await expect(page.locator('.product-card')).toHaveCount(2)
  await page
    .getByRole('link', { name: 'View The everyday cup', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'The everyday cup', exact: true }),
  ).toBeVisible()
  await page.goBack()
  await expect(page.getByLabel('Search the collection')).toHaveValue('cup')
  await page.goto('/products/not-a-product')
  await expect(
    page.getByRole('heading', { name: "This one's wandered off." }),
  ).toBeVisible()
})

test('guest bag persists, registration merges it, successful mock payment saves a durable receipt', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await addLamp(page)
  await page.goto('/cart')
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Your bag (1)' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Continue to checkout' }).click()
  await signup(page)
  await expect(
    page.getByRole('heading', { name: 'The final little details.' }),
  ).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('ee-guest-cart')))
    .toBe('[]')
  await page.getByRole('button', { name: 'Place demo order' }).click()
  await expect(page.getByLabel('Full name', { exact: true })).toBeFocused()
  await expect(page.getByLabel('Full name', { exact: true })).toHaveAttribute(
    'aria-invalid',
    'true',
  )
  await address(page)
  await page.getByRole('button', { name: 'Place demo order' }).click()
  await expect(
    page.getByRole('heading', { name: 'Good things are in the making.' }),
  ).toBeVisible()
  await expect(page.locator('.summary-total')).toContainText('$54.99')
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Good things are in the making.' }),
  ).toBeVisible()
  await page.goto('/cart')
  await expect(
    page.getByRole('heading', { name: 'Your bag has room for good things.' }),
  ).toBeVisible()
  expect(errors).toEqual([])
})

test('declined mock payment preserves the bag and a new attempt succeeds', async ({
  page,
}) => {
  await addLamp(page)
  await page.goto('/auth?redirect=/checkout')
  await signup(page)
  await expect(
    page.getByRole('heading', { name: 'The final little details.' }),
  ).toBeVisible()
  await address(page)
  await page.getByLabel('Declined payment').check()
  await page.getByRole('button', { name: 'Place demo order' }).click()
  await expect(
    page.getByRole('heading', { name: 'The demo payment was declined.' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Try a new mock payment' }).click()
  await expect(page.locator('.bag-line')).toHaveCount(1)
  await address(page)
  await page.getByRole('button', { name: 'Place demo order' }).click()
  await expect(
    page.getByRole('heading', { name: 'Good things are in the making.' }),
  ).toBeVisible()
  await page.goto('/orders')
  await expect(page.locator('.order-card')).toHaveCount(2)
})

test('mobile can filter, use the menu, add an item and check out', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  await page
    .getByRole('dialog')
    .getByRole('link', { name: 'Kitchen & dining', exact: true })
    .click()
  await page.getByRole('button', { name: /^Filters/ }).click()
  await page.getByRole('dialog').getByLabel('Under $25').check()
  await page.getByRole('button', { name: 'Show results' }).click()
  await expect(page).toHaveURL(/price=under25/)
  await page
    .getByRole('link', { name: 'View The everyday cup', exact: true })
    .click()
  await page.getByRole('button', { name: 'Add to bag', exact: true }).click()
  await page.getByRole('link', { name: 'View your bag' }).click()
  await page.getByRole('link', { name: 'Continue to checkout' }).click()
  await signup(page)
  await expect(
    page.getByRole('heading', { name: 'The final little details.' }),
  ).toBeVisible()
  await address(page)
  await page.getByRole('button', { name: 'Place demo order' }).click()
  await expect(
    page.getByRole('heading', { name: 'Good things are in the making.' }),
  ).toBeVisible()
  expect(
    await page.evaluate(() => document.body.scrollWidth <= innerWidth),
  ).toBe(true)
})

test('375px, 768px and 1440px catalog layouts do not overflow and catalog failures allow retry', async ({
  page,
}) => {
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/products')
    await expect(page.locator('.product-card')).toHaveCount(12)
    expect(
      await page.evaluate(() => document.body.scrollWidth <= innerWidth),
    ).toBe(true)
  }
  await page.evaluate(() =>
    localStorage.setItem('ee-catalog-scenario', 'error'),
  )
  await page.reload()
  await expect(page.getByRole('alert')).toContainText(
    'The collection could not be loaded',
  )
  await page.evaluate(() => localStorage.removeItem('ee-catalog-scenario'))
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.locator('.product-card')).toHaveCount(12)
  await page.evaluate(() =>
    localStorage.setItem('ee-catalog-scenario', 'empty'),
  )
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'No favorites found just yet.' }),
  ).toBeVisible()
})

test('important shopping pages have no serious accessibility violations', async ({
  page,
}) => {
  for (const path of ['/', '/products', '/products/ee-47', '/auth']) {
    await page.goto(path)
    await expect(page.locator('h1')).toBeVisible()
    if (path === '/' || path === '/products')
      await expect(page.locator('.product-card').first()).toBeVisible()
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(
      results.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([])
  }
})

test('a lost checkout response can be recovered after reload without a duplicate order', async ({
  page,
  context,
}) => {
  await addLamp(page)
  await page.goto('/auth?redirect=/checkout')
  await signup(page)
  await expect(
    page.getByRole('heading', { name: 'The final little details.' }),
  ).toBeVisible()
  await address(page)
  let committed = false
  await context.route('**/functions/v1/checkout', async (route) => {
    const response = await route.fetch()
    committed = response.ok()
    await route.abort('failed')
  })
  await page.getByRole('button', { name: 'Place demo order' }).click()
  await expect(
    page.getByRole('button', { name: 'Recover checkout attempt' }),
  ).toBeVisible()
  expect(committed).toBe(true)
  await context.unroute('**/functions/v1/checkout')
  await page.reload()
  await page.getByRole('button', { name: 'Recover checkout attempt' }).click()
  await expect(
    page.getByRole('heading', { name: 'Good things are in the making.' }),
  ).toBeVisible()
  await page.goto('/orders')
  await expect(page.locator('.order-card')).toHaveCount(1)
})

test('failed login and switching accounts never exposes another account bag', async ({
  page,
}) => {
  await page.goto('/auth')
  const firstEmail = await signup(page)
  await addLamp(page)
  await page.goto('/orders')
  await page
    .locator('.orders-page')
    .getByRole('button', { name: 'Sign out', exact: true })
    .click()
  await page.goto('/cart')
  await expect(
    page.getByRole('heading', { name: 'Your bag has room for good things.' }),
  ).toBeVisible()
  await page.goto('/auth')
  await signup(page)
  await page.goto('/cart')
  await expect(
    page.getByRole('heading', { name: 'Your bag has room for good things.' }),
  ).toBeVisible()
  await page.goto('/orders')
  await page
    .locator('.orders-page')
    .getByRole('button', { name: 'Sign out', exact: true })
    .click()
  await page.goto('/auth')
  await page.getByLabel('Email address', { exact: true }).fill(firstEmail)
  await page.getByLabel('Password', { exact: true }).fill('WrongPassword123!')
  await page
    .locator('form')
    .getByRole('button', { name: 'Sign in', exact: true })
    .click()
  await expect(page.getByRole('alert')).toContainText(
    'Invalid login credentials',
  )
  await page.getByLabel('Password', { exact: true }).fill('EverydayTest123!')
  await page
    .locator('form')
    .getByRole('button', { name: 'Sign in', exact: true })
    .click()
  await expect(page).toHaveURL(/\/orders/)
  await page.goto('/cart')
  await expect(
    page.getByRole('heading', { name: 'Your bag (1)' }),
  ).toBeVisible()
})

test('failed guest merge retains local items and offers a working retry', async ({
  page,
  context,
}) => {
  await addLamp(page)
  await context.route('**/rest/v1/rpc/merge_guest_cart', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Demo connection failure' }),
    })
  })
  await page.goto('/auth?redirect=/checkout')
  await signup(page)
  await expect(page.getByRole('alert')).toContainText(
    'We could not save your guest bag',
  )
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('ee-guest-cart') || '[]').length,
    ),
  ).toBe(1)
  await context.unroute('**/rest/v1/rpc/merge_guest_cart')
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(
    page.getByRole('heading', { name: 'The final little details.' }),
  ).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('ee-guest-cart'))).toBe(
    '[]',
  )
})

test('keyboard menus restore focus and guest quantity changes support remove and undo', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  const menu = page.getByRole('button', { name: 'Open menu' })
  await menu.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(menu).toBeFocused()
  await addLamp(page)
  await page.goto('/cart')
  await page
    .getByRole('button', { name: 'Increase The reading lamp quantity' })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Your bag (2)' }),
  ).toBeVisible()
  await expect(page.locator('.summary-total')).toContainText('$96.00')
  await page.getByRole('button', { name: 'Remove The reading lamp' }).click()
  await expect(
    page.getByRole('heading', { name: 'Your bag has room for good things.' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Your bag (2)' }),
  ).toBeVisible()
})
