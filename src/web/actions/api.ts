import { Message } from '../../common/models/message';

const API_HOST = 'https://everythingissauce.com'

export function get(url: string, body?: Message, token?: string): Promise<Message> {
  return call('GET', url, body, token);
}

export function post(url: string, body?: Message, token?: string): Promise<Message> {
  return call('POST', url, body, token);
}

export function put(url: string, body?: Message, token?: string): Promise<Message> {
  return call('PUT', url, body, token);
}

function call(
    method: string,
    url: string,
    body: Message,
    token?: string): Promise<Message> {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  if (token) {
    headers.append('x-pifuxelck-auth', token);
  }
  return fetch(API_HOST + url, {
      method,
      headers,
      mode: 'cors',
      body: JSON.stringify(body),
  }).then((res) => res.json());
}
