import { test, expect } from '@playwright/test';
const utils = require('../utils.js');
const { readFileSync } = require('fs');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
let execEnv = { env: { ...process.env, FORCE_COLOR: "0" } };

let accountDataJson = 'tests/CreateAccount/account-fields.json';
// let orgName  = 'ScratchOrg_ShortTerm_Scr';
let orgName  = 'DevHub_Dev';
let orgSalesAppUrl  = 'app/standard__LightningSales';
let orgAppUrl  = orgSalesAppUrl;
let clearTestDataBefore = true;
let clearTestDataAfter  = true;

test('create-account', async ({ page }) => {
	console.log(test.info().title);
	test.slow();
	
	// load test data json
	let accountData = readFileSync(accountDataJson);
	let accountDataObj = JSON.parse(accountData);
	const accountName = utils.CURRENT_RELEASE + accountDataObj.Name;
	console.log('accountDataObj: ', accountDataObj);

	// clear test record
	if (clearTestDataBefore)
	{
		try {
			console.log('Clearing test data.');
			// let sfOutput = await exec('sf data delete:record -o ' + orgName + ' --json -s Account --where "Name=\'' + testDataJObj.businessName + '\'"', execEnv);
			let sfOutput = await exec(`sf data delete record -o  ${orgName}  --json -s Account --where "Name=${accountName}"`, execEnv);
			var jsonObj = JSON.parse(sfOutput.stdout.trim());
			console.log('Success: ' + jsonObj.result.success);
		} catch(error) {
			console.log('-----error: ', error);
			console.log('No matching record found.');
		}
	}

	let sfOutput = await exec(`sf org open -o ${orgName} --path /lightning/${orgAppUrl} -r --json`, execEnv);
	console.log('-----sfOutput: ', sfOutput);
	let sfJsonObj = JSON.parse(sfOutput.stdout.trim());
	console.log('-----sfJsonObj: ', sfJsonObj);
	const SF_URL = sfJsonObj.result.url;
	console.log('-----SF_URL: ', SF_URL);

	// start test here
	await page.goto(SF_URL);

	// open Accounts tab
	await page.getByRole('link', { name: 'Accounts' }).click();
	await page.waitForTimeout(1000);
	await page.getByRole('button', { name: 'New' }).click();
	await page.getByRole('textbox', { name: 'Account Name' }).click();
	await page.getByRole('textbox', { name: 'Account Name' }).fill(accountName);
	await page.getByRole('textbox', { name: 'Phone' }).click();
	await page.getByRole('textbox', { name: 'Phone' }).fill(accountDataObj.Phone);
	await page.getByRole('button', { name: 'Save', exact: true }).click();
	await page.waitForTimeout(1000);
	await page.getByRole('tab', { name: 'Details' }).click();123
	await page.waitForTimeout(1000);

 	await expect(page.locator('records-record-layout-block')).toContainText(accountName);
 	await expect(page.locator('records-record-layout-block')).toContainText(accountDataObj.Phone);

	// await expect(page.locator('#tab-5 lightning-formatted-text').filter({hasText: accountName})).toBeVisible();
	await expect(page.locator('records-record-layout-item [data-target-selection-name="sfdc:RecordField.Account.Name"] lightning-formatted-text')).toHaveText(accountName);
	await expect(page.locator('records-record-layout-item [data-target-selection-name="sfdc:RecordField.Account.Phone"] lightning-formatted-phone a')).toHaveText(accountDataObj.Phone);
	// await expect(page.locator('#tab-5').getByRole('link', { name: accountDataObj.Phone })).toBeVisible();

	//SELECT Account
	let sfOutputAccount = await exec(`sf data query -o  ${orgName} --json -q "SELECT Id, Name FROM Account WHERE Name='${accountName}'"`, execEnv);
	console.log('-----sfOutputAccount: ', sfOutputAccount)
	let sfOutputAccountObj = JSON.parse(sfOutputAccount.stdout.trim());
	console.log('-----sfOutputAccountObj: ', sfOutputAccountObj);
	console.log('-----sfOutputAccountObj.result: ', sfOutputAccountObj.result);
	console.log('-----sfOutputAccountObj.result.records: ', sfOutputAccountObj.result.records);

	sfOutputAccountObj.result.records.forEach((record: any, index: number) => {
		console.log('-----index: ', index);
		console.log('-----record.Id: ', record.Id);
		console.log('-----record.Name: ', record.Name);
	});

	// clear test data.
	if (clearTestDataAfter) {
		try {
			console.log('Clearing test data.');
			// let sfOutput = await exec('sf data delete:record -o ' + orgName + ' --json -s Account --where "Name=\'' + testDataJObj.businessName + '\'"', execEnv);
			let sfOutput = await exec(`sf data delete record -o  ${orgName}  --json -s Account --where "Name=${accountName}"`, execEnv);
			var jsonObj = JSON.parse(sfOutput.stdout.trim());
			console.log('Success: ' + jsonObj.result.success);
		} catch(error) {
			console.log('-----error: ', error);
			console.log('No matching record found.');
		}
	}
});