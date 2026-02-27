import mongoose, { Document, Schema } from 'mongoose';

export interface IParticipant extends Document {
    pollId: mongoose.Types.ObjectId;
    name: string;
    status: 'active' | 'kicked';
    joinedAt: Date;
}

const participantSchema = new Schema<IParticipant>({
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
    name: { type: String, required: true },
    status: { type: String, enum: ['active', 'kicked'], default: 'active' },
    joinedAt: { type: Date, default: Date.now }
});

participantSchema.index({ pollId: 1, name: 1 }, { unique: true });

export const Participant = mongoose.model<IParticipant>('Participant', participantSchema);
