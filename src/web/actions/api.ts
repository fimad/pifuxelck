import { Message } from '../../common/models/message';

const API_HOST =
  location.hostname === 'everythingissauce.com'
    ? 'https://everythingissauce.com'
    : 'https://canary.everythingissauce.com';

export interface ApiResult {
  message: Message | null;
  ok: boolean;
}

export function get(
  url: string,
  body?: Message,
  token?: string
): Promise<ApiResult> {
  return call('GET', url, body, token);
}

export function post(
  url: string,
  body?: Message,
  token?: string
): Promise<ApiResult> {
  return call('POST', url, body, token);
}

export function put(
  url: string,
  body?: Message,
  token?: string
): Promise<ApiResult> {
  return call('PUT', url, body, token);
}

export function del(
  url: string,
  body?: Message,
  token?: string
): Promise<ApiResult> {
  return call('DELETE', url, body, token);
}

function call(
  method: string,
  url: string,
  body: Message,
  token?: string
): Promise<ApiResult> {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  if (token) {
    headers.append('x-pifuxelck-auth', token);
  }
  return fetch(API_HOST + url, {
    body: JSON.stringify(body),
    headers,
    method,
    mode: 'cors',
  }).then((res) => res.json().then((message) => ({ ok: res.ok, message })));
}
