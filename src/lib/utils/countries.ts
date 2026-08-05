export function getFlagEmoji(countryCode: string) {
  return [...countryCode.toUpperCase()]
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

export const countryMap = new Map();

countryMap.set("فلسطين", "PS");
countryMap.set("سودان", "SD");
countryMap.set("جنوب السودان", "SS");
countryMap.set("يمن", "YE");
countryMap.set("نيجر", "NE");
countryMap.set("نيجير", "NG");

countryMap.entries().forEach(([ar_name, abbr]) => countryMap.set(abbr, ar_name));
