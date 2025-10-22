export declare class User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'customer';
    created_at: Date;
    hashPassword(): Promise<void>;
}
