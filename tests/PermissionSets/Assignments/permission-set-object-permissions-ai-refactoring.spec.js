// AI refactoring of tests/PermissionSets/Assignments/permission-set-object-permissions.spec.js

import { test, expect } from "@playwright/test";
import { promisify } from "util";
import { exec as childExec } from "child_process";

const exec = promisify(childExec);

const execEnv = {
    env: {
        ...process.env,
        FORCE_COLOR: "0",
    },
};

const ORG_NAME = "ScratchOrg_ShortTerm_Scr";
// const ORG_NAME = "DevHub_Dev";

const PERMISSION_SET_NAME = "Test_PS";

test.describe("Permission Set", () => {
    test("permission-set-object-permissions", async ({ page }) => {
        test.setTimeout(700000);

        const permissionSetId = await getPermissionSetId(
            PERMISSION_SET_NAME,
        );

        const salesforceUrl = await buildPermissionSetUrl(
            permissionSetId,
        );

        await page.goto(salesforceUrl);

        await openObjectPermissionsEditor(page);

        const editPermissionModal = page.locator("lightning-modal");

        await toggleReadPermissions(editPermissionModal, page);

        await scrollToModalHeader(editPermissionModal);

        const saveButton = getSaveButton(page);

        // clicking Save button in editor (if it needed)
        // await saveButton.click();
    });
});

/**
 * Returns Permission Set Id by Permission Set name
 */
async function getPermissionSetId(permissionSetName) {
    const query = `
        SELECT Id
        FROM PermissionSet
        WHERE Name = '${permissionSetName}'
        LIMIT 1
    `;

    const { stdout } = await exec(
        `sf data query \
        --target-org ${ORG_NAME} \
        --query "${query.replace(/\s+/g, " ").trim()}" \
        --json`,
        execEnv,
    );

    const response = JSON.parse(stdout);

    return response.result.records[0].Id;
}

/**
 * Builds Salesforce URL for Permission Set page
 */
async function buildPermissionSetUrl(permissionSetId) {
    const { stdout } = await exec(
        `sf org open \
        -o ${ORG_NAME} \
        --path /lightning/setup/PermSets/${permissionSetId}/summary \
        -r \
        --json`,
        execEnv,
    );

    const response = JSON.parse(stdout.trim());

    return response.result.url;
}

/**
 * Opens Object Permissions tab and clicks Edit
 */
async function openObjectPermissionsEditor(page) {
    await page
        .getByRole("tab", { name: "Object Permissions" })
        .click();

    await page
        .locator('[data-tab-id="ObjectPermissions"]')
        .getByRole("button", { name: "Edit", exact: true })
        .click();
}

/**
 * Toggles Read checkbox for each row in the table
 */
async function toggleReadPermissions(modal, page) {
    const rows = modal.locator("tbody tr");

    await rows.last().waitFor();

    const rowsCount = await rows.count();

    for (let index = 0; index < rowsCount; index++) {
        const row = rows.nth(index);

        await toggleReadPermissionForRow(row, page);
    }
}

/**
 * Toggles Read checkbox for a single row
 */
async function toggleReadPermissionForRow(row, page) {
    const readCellButton = row
        .locator('td[data-label="Read"]')
        .locator("button");

    await readCellButton.waitFor();
    await readCellButton.click();

    const checkboxLabel = page
        .locator("lightning-primitive-datatable-iedit-input-wrapper")
        .locator("label.slds-checkbox__label");

    await checkboxLabel.waitFor();

    // variant 1 toggle checkbox
    await checkboxLabel.click();

    // variant 2 check checkbox if it is not checked
    // if (!(await checkboxLabel.isChecked())) {
    //     await checkboxLabel.check();

    //     await expect(checkboxLabel).toBeEnabled();
    //     await expect(checkboxLabel).toBeChecked();
    // }

    // variant 3 uncheck checkbox if it is checked
    // if (await checkboxLabel.isChecked()) {
    //     await checkboxLabel.uncheck();

    //     await expect(checkboxLabel).toBeEnabled();
    //     await expect(checkboxLabel).not.toBeChecked();
    // }
}

/**
 * Scrolls modal to the top/header before save
 */
async function scrollToModalHeader(modal) {
    await modal.locator("lst-list-view-manager-header").click();
}

/**
 * Returns Save button locator
 */
function getSaveButton(page) {
    return page.locator(
        "lightning-primitive-datatable-status-bar button.slds-button_brand",
    );

    // variant 2
    // return page
    //     .locator("lightning-primitive-datatable-status-bar")
    //     .locator("button.slds-button_brand");
}