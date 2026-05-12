import { test, expect } from "@playwright/test";
const { readFileSync } = require("fs");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);
let execEnv = { env: { ...process.env, FORCE_COLOR: "0" } };

let orgName = "ScratchOrg_ShortTerm_Scr";
// let orgName  = 'DevHub_Dev';
const permissionSetName = 'Test_PS';

test("permission-set-object-permissions", async ({ page }) => {
    test.setTimeout(700000);

    // getting Permission Set Id by name to open Permission Set page
    const permissionSetId = await getPermissionSetId(permissionSetName);

    // opening Permission Set page in Salesforce UI
    let sfOutput = await exec(
        `sf org open -o ${orgName} --path /lightning/setup/PermSets/${permissionSetId}/summary -r --json`,
        execEnv,
    );
    let sfJsonObj = JSON.parse(sfOutput.stdout.trim());
    const SF_URL = sfJsonObj.result.url;

    // start test here
    await page.goto(SF_URL);

    // go to Object Permissions tab and click Edit
    await page.getByRole('tab', { name: 'Object Permissions' }).click();
    await page.locator('[data-tab-id="ObjectPermissions"]').getByRole('button', { name: 'Edit', exact: true }).click();

    // getting for modal
    const editPermissionModal = await page.locator('lightning-modal');

    // waiting for table rows to be visible in the modal
    const rows = await editPermissionModal.locator('tbody tr');
    await rows.last().waitFor();

    // getting count of rows in the table
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        const readCell = await row.locator('td[data-label="Read"]');

        const readCellButton = await readCell.locator('button');
        await readCellButton.waitFor();
        await readCellButton.click();

        // getting inline checkbox editor
        const editor = page.locator(
            'lightning-primitive-datatable-iedit-input-wrapper'
        );

        // getting editor checkbox label to click on it and change value
        const editableCheckboxLabel = await editor.locator(
            'label.slds-checkbox__label'
        );
        // ).last();
        // waiting for editor checkbox (to make stable)
        await editableCheckboxLabel.waitFor();

        // clicking on label to change checkbox value
        // variant 1 toggle checkbox
        await editableCheckboxLabel.click();

        // variant 2 check checkbox if it is not checked
        // if (!(await editableCheckboxLabel.isChecked())) {
        //     await editableCheckboxLabel.check();

        //     // checking that checkbox is checked and enabled
        //     await expect(editableCheckboxLabel).toBeEnabled();
        //     await expect(editableCheckboxLabel).toBeChecked();
        // }

        // variant 3 uncheck checkbox if it is not checked
        // if (await editableCheckboxLabel.isChecked()) {
        //     await editableCheckboxLabel.uncheck();

        //     // checking that checkbox is unchecked and enabled
        //     await expect(editableCheckboxLabel).toBeEnabled();
        //     await expect(editableCheckboxLabel).not.toBeChecked();
        // }
    }

    // getting header of the page to scroll to it before clicking Save button (to make stable)
    const header = await editPermissionModal.locator('lst-list-view-manager-header').click();

    // getting Save button in editor (if it needed)
    // variant 1
    const saveButton = page.locator('lightning-primitive-datatable-status-bar button.slds-button_brand');

    // variant 2
    // const statusBar = await page.locator('lightning-primitive-datatable-status-bar');
    // const saveButton = await statusBar.locator('button.slds-button_brand');

    // clicking Save button in editor (if it needed)
    // await saveButton.click();
});

async function getPermissionSetId(permissionSetName) {
    const permissionSetQuery = await exec(
        `sf data query \
        --target-org ${orgName} \
        --query "SELECT Id FROM PermissionSet WHERE Name = '${permissionSetName}' LIMIT 1" \
        --json`,
        execEnv,
    );

    const permissionSetJson = JSON.parse(permissionSetQuery.stdout);
    const permissionSetId = permissionSetJson.result.records[0].Id;

    return permissionSetId;
}
