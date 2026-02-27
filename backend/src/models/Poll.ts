import mongoose, { Document, Schema } from 'mongoose';

export interface IPoll extends Document {
    question: string;
    options: { id: string; text: string }[];
    startTime: Date;
    duration: number; // in seconds
    status: 'active' | 'completed';
    createdAt: Date;
}

const pollSchema = new Schema<IPoll>({
    question: { type: String, required: true },
    options: [{
        id: { type: String, required: true },
        text: { type: String, required: true }
    }],
    startTime: { type: Date, required: true },
    duration: { type: Number, required: true, default: 60 },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

export const Poll = mongoose.model<IPoll>('Poll', pollSchema);
