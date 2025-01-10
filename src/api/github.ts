import api from './base';
import { AxiosPromise } from 'axios';

export interface GithubToken {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    refresh_token_expires_in: number;
    scope: string;
    token_type: string;
}

export function githubToken(token: string, signal: AbortSignal): AxiosPromise<GithubToken> {
    return api.get(`/github-token?code=${token}`, { signal });
}
