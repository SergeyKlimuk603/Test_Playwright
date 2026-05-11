import { test, expect } from "@playwright/test";
const { readFileSync } = require("fs");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);
let execEnv = { env: { ...process.env, FORCE_COLOR: "0" } };

// let orgName = "ScratchOrg_ShortTerm_Scr";
let orgName  = 'DevHub_Dev';
let orgSalesAppUrl = "app/standard__LightningSales";
let orgAppUrl = orgSalesAppUrl;

test("salesforce-auth", async ({ page }) => {
	let sfOutput = await exec(
		`sf org open -o ${orgName} --path /lightning/${orgAppUrl} -r --json`,
		execEnv,
	);
	let sfJsonObj = JSON.parse(sfOutput.stdout.trim());
	const SF_URL = sfJsonObj.result.url;

	// start test here
	await page.goto(SF_URL);
});
