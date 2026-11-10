function parseTags(input) {
  // not a string (undefined, null, number...) -> no tags
  if (typeof input !== 'string') return []

  const cleaned = input
    .split(',')                      
    .map((tag) => tag.trim().toLowerCase())   
    .filter((tag) => tag.length > 0)

  return [...new Set(cleaned)]
}

module.exports = { parseTags }