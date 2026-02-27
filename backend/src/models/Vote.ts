import mongoose, { Document, Schema } from 'mongoose';

export interface IVote extends Document {
    pollId: mongoose.Types.ObjectId;
    studentName: string;
    selectedOption: string;
    createdAt: Date;
}

const voteSchema = new Schema<IVote>({
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
    studentName: { type: String, required: true },
    selectedOption: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Unique constraint to prevent double voting
voteSchema.index({ pollId: 1, studentName: 1 }, { unique: true });

export const Vote = mongoose.model<IVote>('Vote', voteSchema);
