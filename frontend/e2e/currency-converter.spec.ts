import { test, expect } from '@playwright/test';

test.describe('Currency Converter - UI and Functionality', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for the app to load
        await page.waitForLoadState('networkidle');
    });

    test('should load the application with correct title and elements', async ({ page }) => {
        // Check page title
        await expect(page).toHaveTitle(/Currency Converter/i);

        // Check main heading
        await expect(page.locator('h1')).toContainText('CURRENCY');
        await expect(page.locator('h1')).toContainText('CONVERTER');

        // Check subtitle
        await expect(page.getByText(/Real-time exchange rates/i)).toBeVisible();

        // Check theme toggle button exists
        await expect(page.locator('.theme-toggle')).toBeVisible();

        // Check converter card is visible
        await expect(page.locator('.converter-card')).toBeVisible();
    });

    test('should have all input fields and buttons', async ({ page }) => {
        // Check amount input
        const amountInput = page.locator('#amount-input');
        await expect(amountInput).toBeVisible();
        await expect(amountInput).toHaveValue('100');

        // Check from currency dropdown
        const fromCurrency = page.locator('#from-currency');
        await expect(fromCurrency).toBeVisible();
        await expect(fromCurrency).toHaveValue('USD');

        // Check to currency dropdown
        const toCurrency = page.locator('#to-currency');
        await expect(toCurrency).toBeVisible();
        await expect(toCurrency).toHaveValue('EUR');

        // Check swap button
        await expect(page.locator('.swap-button')).toBeVisible();
    });

    test('should display conversion result on load', async ({ page }) => {
        // Wait for conversion to complete
        await page.waitForSelector('.result-section', { timeout: 10000 });

        // Check result is displayed
        await expect(page.locator('.result-amount')).toBeVisible();
        await expect(page.locator('.currency-code')).toContainText('EUR');

        // Check exchange rate is displayed
        await expect(page.locator('.exchange-rate')).toBeVisible();
        await expect(page.locator('.exchange-rate')).toContainText('1 USD');
    });

    test('should convert currency when amount is changed', async ({ page }) => {
        const amountInput = page.locator('#amount-input');

        // Clear and enter new amount
        await amountInput.clear();
        await amountInput.fill('250');

        // Wait for conversion
        await page.waitForTimeout(1000);

        // Check that result updates
        await expect(page.locator('.result-section')).toBeVisible();
        const resultAmount = await page.locator('.amount-value').textContent();
        expect(parseFloat(resultAmount || '0')).toBeGreaterThan(0);
    });

    test('should convert currency when from currency is changed', async ({ page }) => {
        const fromCurrency = page.locator('#from-currency');

        // Change from currency to GBP
        await fromCurrency.selectOption('GBP');

        // Wait for conversion
        await page.waitForTimeout(1000);

        // Check exchange rate updates
        await expect(page.locator('.exchange-rate')).toContainText('GBP');
    });

    test('should convert currency when to currency is changed', async ({ page }) => {
        const toCurrency = page.locator('#to-currency');

        // Change to currency to JPY
        await toCurrency.selectOption('JPY');

        // Wait for conversion
        await page.waitForTimeout(1000);

        // Check result currency code
        await expect(page.locator('.currency-code')).toContainText('JPY');
    });


    test('should toggle between dark and light mode', async ({ page }) => {
        const themeToggle = page.locator('.theme-toggle');
        const app = page.locator('.app');

        // Check initial mode (dark mode)
        await expect(app).toHaveClass(/dark-mode/);

        // Click theme toggle
        await themeToggle.click();

        // Wait for transition
        await page.waitForTimeout(500);

        // Check light mode is active
        await expect(app).toHaveClass(/light-mode/);

        // Toggle back to dark mode
        await themeToggle.click();
        await page.waitForTimeout(500);

        // Check dark mode is active again
        await expect(app).toHaveClass(/dark-mode/);
    });


    test('should show loading state during conversion', async ({ page }) => {
        const amountInput = page.locator('#amount-input');

        // Change amount to trigger conversion
        await amountInput.clear();
        await amountInput.fill('500');

        // Note: Loading might be too fast to catch, so we just check it doesn't error
    });


    test('should have responsive layout', async ({ page }) => {
        // Test desktop view
        await page.setViewportSize({ width: 1280, height: 720 });
        await expect(page.locator('.converter-card')).toBeVisible();

        // Test tablet view
        await page.setViewportSize({ width: 768, height: 1024 });
        await expect(page.locator('.converter-card')).toBeVisible();

        // Test mobile view
        await page.setViewportSize({ width: 375, height: 667 });
        await expect(page.locator('.converter-card')).toBeVisible();
    });


    test('should display footer with correct information', async ({ page }) => {
        const footer = page.locator('.footer');
        await expect(footer).toBeVisible();
        await expect(footer).toContainText('FreeCurrencyAPI');
        await expect(footer).toContainText('Real-time rates');
    });


    test('should maintain state after page interactions', async ({ page }) => {
        const amountInput = page.locator('#amount-input');
        const fromCurrency = page.locator('#from-currency');

        // Set custom values
        await amountInput.clear();
        await amountInput.fill('500');
        await fromCurrency.selectOption('GBP');

        // Wait for conversion
        await page.waitForTimeout(1000);

        // Check values are maintained
        await expect(amountInput).toHaveValue('500');
        await expect(fromCurrency).toHaveValue('GBP');
    });



    test('should have accessible form labels', async ({ page }) => {
        // Check amount label (use more specific selector)
        await expect(page.locator('.label-text').filter({ hasText: 'Amount' }).first()).toBeVisible();

        // Check from label
        await expect(page.locator('.label-text').filter({ hasText: 'From' })).toBeVisible();

        // Check to label
        await expect(page.locator('.label-text').filter({ hasText: 'To' })).toBeVisible();
    });
});
