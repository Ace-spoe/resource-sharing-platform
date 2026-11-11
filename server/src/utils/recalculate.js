
async function recalculate(tx , resourceId){
    const { _avg, _count } = await tx.rating.aggregate({
    where: { resourceId },
    _avg: { score: true },
    _count: { score: true },
  })

   await tx.resource.update({
    where: { id: resourceId },
    data: {
      avgRating: _avg.score ?? 0, // no ratings -> average is null -> store 0
      ratingCount: _count.score,
    },
  })

}

module.exports = {recalculate}