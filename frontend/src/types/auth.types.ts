export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    name: string;
    phone: string;
    password: string;
}