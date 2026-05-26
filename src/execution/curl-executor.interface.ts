import type { HttpResponse } from '../domain/http-response';

export interface CurlExecutionOptions {
  readonly curlPath: string;
  readonly timeoutMs: number;
  readonly followRedirects: boolean;
  readonly insecureTls: boolean;
}

export interface ICurlExecutor {
  execute(command: string, options: CurlExecutionOptions): Promise<HttpResponse>;
}
