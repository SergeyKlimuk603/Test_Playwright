export const CURRENT_RELEASE = 'R_v_1_0_0_';
export const CURRENT_RELEASE_DATE = '2026-06-01';

export function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}