import mongoose from 'mongoose'

const placedBetSchema = mongoose.Schema({
  edgebetId: Number,
  outcomeId: Number
})

export default mongoose.model('placedBet', placedBetSchema)
