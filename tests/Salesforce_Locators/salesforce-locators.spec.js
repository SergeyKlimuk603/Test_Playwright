import { test, expect } from "@playwright/test";
const { readFileSync } = require("fs");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);
let execEnv = { env: { ...process.env, FORCE_COLOR: "0" } };

let accountDataJson = "tests/CreateAccount/account-fields.json";
let orgName = "ScratchOrg_ShortTerm_Scr";
// let orgName  = 'DevHub_Dev';
let orgSalesAppUrl = "app/standard__LightningSales";
let bnvAccountUrl = "r/Account/001Aq00001278DiIAI/view";
let orgAppUrl = bnvAccountUrl;

test("salesforce-locators", async ({ page }) => {
	test.slow();

	let sfOutput = await exec(
		`sf org open -o ${orgName} --path /lightning/${orgAppUrl} -r --json`,
		execEnv,
	);
	let sfJsonObj = JSON.parse(sfOutput.stdout.trim());
	const SF_URL = sfJsonObj.result.url;

	// start test here
	await page.goto(SF_URL);

	await page.getByRole("tab", { name: "Details" }).click();

	// Рабочий вариант 1----------------------------
	// Контейнер поля Phone
	const phoneField1 = page.locator(
		'[data-target-selection-name="sfdc:RecordField.Account.Phone"]',
	);

	// Значение поля
	const phoneValue = phoneField1.locator(".test-id__field-value");

	// Проверка значения
	await expect(phoneValue).toHaveText("1234");
	// Рабочий вариант 1----------------------------

	// Рабочий вариант 2----------------------------
	const phoneField2 = page.locator(
		'records-record-layout-item[field-label="Phone"]',
	);

	await expect(phoneField2).toContainText("1234");
	// Рабочий вариант 2----------------------------

	// Рабочий вариант 3----------------------------
	const phoneValue3 = page.locator(
		'records-record-layout-item[field-label="Phone"] lightning-formatted-phone a',
	);

	await expect(phoneValue).toHaveText("1234");
	// Рабочий вариант 3----------------------------

	// Рабочий вариант 4!!!----------------------------

	await expect(
		page.locator(
			'records-record-layout-block [data-target-selection-name="sfdc:RecordField.Account.Phone"] lightning-formatted-phone a',
		),
	).toHaveText("1234");

	// Рабочий вариант 4----------------------------

	const ratingField = page.locator(
		'records-record-layout-item[field-label="Rating"] lightning-formatted-text',
	);

	await expect(ratingField).toHaveText("Warm");
});
