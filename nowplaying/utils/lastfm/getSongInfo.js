async function getSongInfo(artist, track) {
	const res = await fetch(`${process.env.LAST_FM_API_URL}?method=track.getInfo&api_key=${process.env.LAST_FM_API_KEY}&artist=${artist}&track=${track}&format=json`);
	if (!res.ok) return null;

	const data = await res.json();

	const trackImage = data?.track?.album?.image?.at(-1)?.['#text']?.replace('/300x300', '') || null;

	return trackImage;
}

module.exports = { getSongInfo }