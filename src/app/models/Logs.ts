import { Schema, model, models } from 'mongoose';

interface ILogs {
    user: string;
    email: string;
    data: string;
    action: string;

}

const LogsSchema = new Schema<ILogs>({
    user: String,
    email: String,
    data: String,
    action: String,
},
    {
        timestamps: true,
        collection: 'logs',
        strict: false,
    }
);

export const Logs = models.Logs || model('Logs', LogsSchema);

export default Logs;


