const LEVEL_1_2_TERMS = [
'executive',
'salary',
'legal',
'merger',
'acquisition',
'board minutes',
'compensation',
'termination',
'disciplinary',
'litigation',
'settlement',
]

const LEVEL_3_4_TERMS = [
'social security',
'tax file number',
'board minutes',
'acquisition',
]

interface FilterResult {
filtered: string
wasFiltered: boolean
reason: string | null
}

export function filterResponse(
response: string,
nrlLevel: number,
_needTags: string[],
): FilterResult {
if (nrlLevel >= 5) {
return { filtered: response, wasFiltered: false, reason: null }
}

const termsToRedact = nrlLevel <= 2 ? LEVEL_1_2_TERMS : LEVEL_3_4_TERMS

let filtered = response
let wasFiltered = false

for (const term of termsToRedact) {
const re = new RegExp(`\\b${term}\\b`, 'ig')
if (re.test(filtered)) {
wasFiltered = true
filtered = filtered.replace(re, '[REDACTED]')
}
}

return {
filtered: wasFiltered
? `${filtered}\n\n_Some content was restricted based on your access level._`
: filtered,
wasFiltered,
reason: wasFiltered ? 'NRL_RESPONSE_FILTER' : null,
}
}
