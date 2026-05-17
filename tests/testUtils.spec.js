import { test, expect } from '@playwright/test';
const utils = require('./utils.js');

test('test utils', async ({ page }) => {
 console.log('-----utils.getCurrentDate(): ', utils.getCurrentDate());
 console.log('-----CURRENT_RELEASE_DATE: ', utils.CURRENT_RELEASE_DATE);
 console.log('-----CURRENT_RELEASE: ', utils.CURRENT_RELEASE);
});