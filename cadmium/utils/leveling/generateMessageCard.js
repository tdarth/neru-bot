/*
title
description
avatar
bg_color
description_color
*/

async function generateMessageCard(options = {}) {
    const bodyObject = {};
    for (const [key, value] of Object.entries(options)) {
        if (value !== undefined && value !== null) {
            bodyObject[key] = value;
        }
    }

    const body = JSON.stringify(bodyObject);

    const response = await fetch('https://dashboard.botghost.com/api/public/welcome_banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
    });

    if (response.ok) return response.text();
    else return 'https://help.autodesk.com/sfdcarticles/img/0EM3g000004LgDI';
}

module.exports = { generateMessageCard };