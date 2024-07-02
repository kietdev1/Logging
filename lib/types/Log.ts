import MessageProperties from "./MessageProperties";

export default interface Log {
    _id: string;
    MessageTemplate: string;
    Message: string | null;
    Level: string;
    Timestamp: string;
    Properties?: MessageProperties | null
}