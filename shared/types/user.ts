export interface IUser {
    id: string;
    email: string;
    name: string
    password?: string;
    googleId?: string;
    googleAvatar: string;
    ip?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}