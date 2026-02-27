import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
    pollId: mongoose.Types.ObjectId;
    senderName: string;
    senderRole: 'teacher' | 'student';
    text: string;
    createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['teacher', 'student'], required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
