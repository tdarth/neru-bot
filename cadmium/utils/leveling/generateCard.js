/*
userName,
avatar,
level = 0,
currentXp = 0,
nextLevelXp = 100,
rank = null,
bg_color = '#202024',
backgroundImage = null,
circleColor = null,
emptyBarColor = null,
filledBarColor = null,
userColor = null,
rankColor = null,
levelColor = null,
xpPercentColor = null,
xpNumberColor = null,
*/

async function generateLevelCard(options = {}) {
    const bodyObject = {};
    for (const [key, value] of Object.entries(options)) {
        if (value !== undefined && value !== null) {
            bodyObject[key] = value;
        }
    }

    const body = JSON.stringify(bodyObject);

    const response = await fetch('https://dashboard.botghost.com/api/public/levels_card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
    });

    if (response.ok) return response.json();
    else return 'https://help.autodesk.com/sfdcarticles/img/0EM3g000004LgDI';
}

module.exports = { generateLevelCard };